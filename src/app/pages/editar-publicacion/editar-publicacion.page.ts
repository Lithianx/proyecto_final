import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Usuario } from 'src/app/models/usuario.model';
import { Publicacion } from 'src/app/models/publicacion.model';
import { environment } from 'src/environments/environment';
import { LocalStorageService } from 'src/app/services/local-storage-social.service';
import { PublicacionService } from 'src/app/services/publicacion.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { NavController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-editar-publicacion',
  templateUrl: './editar-publicacion.page.html',
  styleUrls: ['./editar-publicacion.page.scss'],
  standalone: false,
})
export class EditarPublicacionPage implements OnInit {

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  // Usuario simulado (ajustado al modelo real, id_usuario string)
  usuarioActual: Usuario = {
    id_usuario: '0',
    nombre_usuario: 'Usuario Demo',
    correo_electronico: 'demo@correo.com',
    fecha_registro: new Date(),
    contrasena: '',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
    estado_cuenta: true,
    estado_online: true,
    sub_name: '',
    descripcion:''
  };

  postId!: string;
  publicacion!: Publicacion;
  contenido: string = '';
  imagenBase64: string | null = null;
  publicaciones: Publicacion[] = []; // Lista de publicaciones cargadas

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private localStorage: LocalStorageService,
    private publicacionService: PublicacionService,
    private usuarioService: UsuarioService,
    private navCtrl: NavController,
  private toastController: ToastController
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

    this.route.params.subscribe(async params => {
      this.postId = params['id'];

      // Cargar publicaciones según conexión
      if (navigator.onLine) {
        this.publicaciones = await this.publicacionService.getPublicaciones();
      } else {
        this.publicaciones = await this.publicacionService.getPublicacionesPersonal();
      }

      // Buscar la publicación por ID (id_publicacion ahora es string)
      const publicacionEncontrada = this.publicaciones.find(p => p.id_publicacion === this.postId);

      if (publicacionEncontrada) {
        this.publicacion = publicacionEncontrada;
        this.contenido = this.publicacion.contenido;
        this.imagenBase64 = this.publicacion.imagen || null;
      } else {
        console.warn('Publicación no encontrada');
      }
    });
  }

  eliminarImagen() {
    this.imagenBase64 = null;
  }

  // Giphy
  giphyResults: any[] = [];

  async buscarGiphy(query: string) {
    const giphyApiKey = environment.giphyApiKey;
    const url = `https://api.giphy.com/v1/gifs/search?api_key=${giphyApiKey}&q=${encodeURIComponent(query)}&limit=20&rating=g`;
    const resp = await fetch(url);
    const data = await resp.json();
    this.giphyResults = data.data; // Array de GIFs
  }

  mostrarBuscadorGiphy = false;

  seleccionarGifGiphy(url: string) {
    this.imagenBase64 = url; // Guarda la URL del GIF
    this.mostrarBuscadorGiphy = false;
  }

  seleccionarArchivo() {
    this.fileInput.nativeElement.click();
  }

  onArchivoSeleccionado(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = () => {
        const base64 = reader.result as string;

        if (file.type.startsWith('image/')) {
          this.imagenBase64 = base64;
        } else {
          console.warn('Solo se permiten imágenes en las publicaciones');
        }
      };

      reader.readAsDataURL(file);
    }
  }

  
  async guardarCambios() {
    if (this.publicacion) {
      this.publicacion.contenido = this.contenido;
      this.publicacion.imagen = this.imagenBase64 || '';

      await this.publicacionService.updatePublicacion(this.publicacion);

      // Si quieres mostrar todas las publicaciones (online/offline)
      if (navigator.onLine) {
        this.publicaciones = await this.publicacionService.getPublicaciones();
      } else {
        this.publicaciones = await this.publicacionService.getPublicacionesPersonal();
      }

      console.log('Cambios guardados:', this.publicaciones);
      await this.mostrarToast('¡Publicación modificada exitosamente!');
      this.router.navigate(['/home']);
    }
  }


  async mostrarToast(mensaje: string) {
  const toast = await this.toastController.create({
    message: mensaje,
    duration: 2000,
    color: 'success',
    position: 'bottom'
  });
  toast.present();
}
}