import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';

import { Reporte } from 'src/app/models/reporte.model';
import { TipoReporte } from 'src/app/models/tipo-reporte.model';
import { Publicacion } from 'src/app/models/publicacion.model';
import { Usuario } from 'src/app/models/usuario.model';

import { LocalStorageService } from 'src/app/services/local-storage-social.service';
import { PublicacionService } from 'src/app/services/publicacion.service';
import { ReporteService } from 'src/app/services/reporte.service';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-reportar',
  templateUrl: './reportar.page.html',
  styleUrls: ['./reportar.page.scss'],
  standalone: false,
})
export class ReportarPage implements OnInit {

  @ViewChild('reportarContainer', { static: false }) reportarContainer!: ElementRef;

  // Simulación del usuario actual (esto luego vendrá de auth)
  usuarioActual: Usuario = {
    id_usuario: '0', // string
    nombre_usuario: 'Usuario Demo',
    correo_electronico: 'demo@correo.com',
    fecha_registro: new Date(),
    contrasena: '',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
    estado_cuenta: true,
    estado_online: true
  };

  postId: string = ''; // string
  post!: Publicacion;
  mostrarDescripcion: boolean = false;

  alertOptions = {
    header: 'Selecciona una razón',
    message: 'Ayúdanos a entender el problema',
  };

  // Ahora usamos correctamente la interface Reporte
  reporte: Reporte = {
    id_reporte: '',
    id_usuario: '',
    id_tipo_reporte: '',
    id_publicacion: '',
    descripcion_reporte: '',
    fecha_reporte: new Date()
  };

  // Opciones del select
  TipoReporte: TipoReporte[] = [];

  usuarioPost!: Usuario;
  imagenSeleccionada: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private localStorage: LocalStorageService,
    private publicacionService: PublicacionService,
    private reporteService: ReporteService,
    private usuarioService: UsuarioService
  ) { }

  async ngOnInit() {
    // Cargar usuario actual
    const usuario = await this.usuarioService.getUsuarioActualConectado();
    if (usuario) {
      this.usuarioActual = usuario;
      await this.localStorage.setItem('usuarioActual', usuario);
    } else {
      // Si no hay usuario, podrías redirigir al login
      return;
    }


    // Accede al parámetro 'id' en la ruta
    this.route.params.subscribe(params => {
      this.postId = params['id'];
      this.reporte.id_publicacion = this.postId; // Actualiza el id_publicacion en el reporte
      this.obtenerPost();
    });
    // Desplazar hacia la sección de comentarios después de cargar
    setTimeout(() => {
      if (this.reportarContainer) {
        this.reportarContainer.nativeElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);

      this.TipoReporte = await this.reporteService.getTiposReporte(); // Debes tener este método en tu servicio
  }

  async obtenerPost() {
    // Carga los usuarios antes de buscar el post
    await this.usuarioService.cargarUsuarios();
    // Obtiene la publicación por ID (string)
    const post = await this.publicacionService.getPublicacionById(this.postId);

    if (post) {
      this.post = post;
      this.usuarioPost = this.usuarioService.getUsuarioPorId(this.post.id_usuario)!;
    } else {
      console.warn('Publicación no encontrada');
    }
  }

  async enviarReporte() {
    if (!this.reporte.id_tipo_reporte || !this.reporte.descripcion_reporte.trim()) {
      console.log('Formulario incompleto');
      return;
    }
    this.reporte.id_usuario = this.usuarioActual.id_usuario;
    this.reporte.fecha_reporte = new Date();

  // Guarda el reporte y recibe el id generado
  const id = await this.reporteService.guardarReporte({ ...this.reporte });
  this.reporte.id_reporte = id as string; // Ahora el id_reporte tiene el valor correcto

  console.log('Reporte guardado:', this.reporte);

    // Limpiar formulario
    this.reporte = {
      id_reporte: '',
      id_usuario: '',
      id_tipo_reporte: '',
      id_publicacion: '',
      descripcion_reporte: '',
      fecha_reporte: new Date()
    };

    // Mostrar Toast
    const toast = await this.toastCtrl.create({
      message: 'Tu reporte ha sido enviado. Gracias por ayudarnos a mantener la comunidad segura.',
      duration: 3000,
      position: 'bottom',
      color: 'success'
    });

    await toast.present();

    this.volver();
  }

  verImagen(publicacion: Publicacion) {
    this.imagenSeleccionada = publicacion.imagen ?? null;
  }

  cerrarVisor() {
    this.imagenSeleccionada = null;
  }

  volver() {
    this.navCtrl.back();
  }
}