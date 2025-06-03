
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';

import { Reporte } from 'src/app/models/reporte.model';
import { TipoReporte } from 'src/app/models/tipo-reporte.model';
import { Publicacion } from 'src/app/models/publicacion.model';
import { Usuario } from 'src/app/models/usuario.model';



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
    id_usuario: 2,
    nombre_usuario: 'Usuario Demo',
    correo_electronico: 'usuario@demo.com',
    fecha_registro: new Date(),
    contrasena: '',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
    estado_cuenta: true,
    estado_online: true
  };

  postId: number = 0; // Inicializar con un valor por defecto
  post!: Publicacion;

  alertOptions = {
    header: 'Selecciona una razón',
    message: 'Ayúdanos a entender el problema',
  };

  // Ahora usamos correctamente la interface Reporte
  reporte: Reporte = {
    id_reporte: 1, // Simulación de ID aleatorio
    id_usuario: this.usuarioActual.id_usuario,
    id_tipo_reporte: 0,
    id_publicacion: 0, // Se actualizará en ngOnInit
    descripcion_reporte: '',
    fecha_reporte: new Date()
  };

  // Opciones del select
  TipoReporte: TipoReporte[] = [
    { id_tipo_reporte: 1 , descripcion_tipo_reporte: 'Contenido Inapropiado' },
    { id_tipo_reporte: 2 , descripcion_tipo_reporte: 'Spam' },
    { id_tipo_reporte: 3 , descripcion_tipo_reporte: 'Violencia' },
    { id_tipo_reporte: 4 , descripcion_tipo_reporte: 'Otro' }
  ];




usuarios: Usuario[] = [
  {
    id_usuario: 1,
    nombre_usuario: 'Pedro Gamer',
    correo_electronico: 'pedro@gamer.com',
    fecha_registro: new Date(),
    contrasena: '',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
    estado_cuenta: true,
    estado_online: true
  },
  // ...otros usuarios...
];


  constructor(private route: ActivatedRoute, private navCtrl: NavController, private toastCtrl: ToastController) { }

  ngOnInit() {
    // Accede al parámetro 'id' en la ruta
    this.route.params.subscribe(params => {
      this.postId = Number(params['id']);  // Asigna el valor del parámetro 'id'
      this.reporte.id_publicacion = this.postId; // Actualiza el id_publicacion en el reporte
      this.obtenerPost();
    });
    // Desplazar hacia la sección de comentarios después de cargar
    setTimeout(() => {
      if (this.reportarContainer) {
        this.reportarContainer.nativeElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }

usuarioPost!: Usuario;

  obtenerPost() {
  this.post = {
    id_publicacion: this.postId || 1,
    id_usuario: 1,
    contenido: '¡Esa victoria fue épica! 🎮💥',
    imagen: 'https://ionicframework.com/docs/img/demos/avatar.svg',
    fecha_publicacion: new Date()
  };
  // Buscar el usuario de la publicación
  this.usuarioPost = this.usuarios.find(u => u.id_usuario === this.post.id_usuario)!;
  }

  async enviarReporte() {
    if (!this.reporte.id_tipo_reporte || !this.reporte.descripcion_reporte.trim()) {
      console.log('Formulario incompleto');
      return;
    }

    console.log('Reporte enviado:', this.reporte);

      // Limpiar formulario
      this.reporte = {
        id_reporte: 0,
        id_usuario: 0,
        id_tipo_reporte: 0,
        id_publicacion: 0,
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

  volver() {
    this.navCtrl.back();
  }
}
