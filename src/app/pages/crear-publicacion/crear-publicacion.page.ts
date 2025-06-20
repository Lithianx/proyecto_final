import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { Usuario } from 'src/app/models/usuario.model';
import { Publicacion } from 'src/app/models/publicacion.model';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { environment } from 'src/environments/environment';

import { LocalStorageService } from 'src/app/services/local-storage-social.service';
import { PublicacionService } from 'src/app/services/publicacion.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { NavController } from '@ionic/angular';

import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-crear-publicacion',
  templateUrl: './crear-publicacion.page.html',
  styleUrls: ['./crear-publicacion.page.scss'],
  standalone: false,
})
export class CrearPublicacionPage implements OnInit {

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
    descripcion: ''
  };

  contenido: string = '';
  imagenBase64: string | null = null;
  mostrarDescripcion: boolean = false;

  publicaciones: Publicacion[] = []; // Lista de publicaciones creadas

  constructor(
    private router: Router,
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

    console.log(this.usuarioActual.avatar);

    this.publicaciones = await this.publicacionService.getPublicacionesPersonal();
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

  async seleccionarArchivo() {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        saveToGallery: true,
        promptLabelHeader: 'Selecciona una opción',
        promptLabelPhoto: 'Elegir de la galería',
        promptLabelPicture: 'Tomar foto',
        promptLabelCancel: 'Cancelar',
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt // Permite elegir entre cámara y galería
      });

      this.imagenBase64 = image.dataUrl || null;
    } catch (error: any) {
      if (error.message?.toLowerCase().includes('permission')) {
        alert('Debes permitir el acceso a la cámara o galería desde la configuración de tu dispositivo.');
      } else {
        console.warn('No se seleccionó ninguna imagen o se canceló la acción.');
      }
    }
  }

  // Función para crear la publicación
  async publicar() {
    if (!this.contenido.trim() && !this.imagenBase64) return;

    const nuevaPublicacion: Publicacion = {
      id_publicacion: '', // Temporal
      id_usuario: this.usuarioActual.id_usuario,
      contenido: this.contenido || '',
      imagen: this.imagenBase64 || '',
      fecha_publicacion: new Date(),
    };

    // Guardar en Firebase y obtener el ID generado
    const id_publicacion = await this.publicacionService.addPublicacion(nuevaPublicacion);
    console.log('ID de publicación generado:', id_publicacion);
    nuevaPublicacion.id_publicacion = id_publicacion;
    console.log('Publicación con ID:', nuevaPublicacion);
    // Cargar publicaciones según conexión
    if (navigator.onLine) {
      this.publicaciones = await this.publicacionService.getPublicaciones();
      console.log('Publicaciones obtenidas desde Firebase:', this.publicaciones);
    } else {
      this.publicaciones = await this.publicacionService.getPublicacionesPersonal();
    }

    console.log('Publicación creada:', nuevaPublicacion);

    this.contenido = '';
    this.imagenBase64 = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
    await this.mostrarToast('¡Publicación creada exitosamente!');
    this.router.navigate(['/home']);
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