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
import { UtilsService } from 'src/app/services/utils.service';
import { ToastController } from '@ionic/angular';
import { Platform } from '@ionic/angular';

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
    descripcion: '',
    rol: 'usuario', // 'admin' o 'usuario'
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
    private toastCtrl: ToastController,
    private utilsService: UtilsService
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

async seleccionarImagen() {
  const isCapacitor = !!(window as any).Capacitor?.isNativePlatform?.() || !!(window as any).Capacitor?.isNative;

  if (isCapacitor) {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        saveToGallery: false,
        promptLabelHeader: 'Selecciona una opción',
        promptLabelPhoto: 'Elegir de la galería',
        promptLabelPicture: 'Tomar foto',
        promptLabelCancel: 'Cancelar',
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt
      });
      this.imagenBase64 = image.dataUrl || null;
    } catch (error: any) {
      // Muestra un toast si hay error (por ejemplo, permisos)
      const toast = await this.toastCtrl.create({
        message: 'No se pudo acceder a la cámara o galería. Revisa los permisos de la app.',
        duration: 2500,
        color: 'danger',
        position: 'top'
      });
      toast.present();
    }
  } else {
    // Web: dispara el input file
    this.fileInput.nativeElement.click();
  }
}

async onArchivoSeleccionado(event: any) {
  const file = event.target.files[0];
  if (file && file.type.startsWith('image/')) { // Solo imágenes
    const reader = new FileReader();
    reader.onload = () => {
      this.imagenBase64 = reader.result as string;
    };
    reader.readAsDataURL(file);
  } else {
    // Muestra un toast si no es imagen
    const toast = await this.toastCtrl.create({
      message: 'Por favor selecciona solo archivos de imagen.',
      duration: 2500,
      color: 'danger',
      position: 'top'
    });
    toast.present();
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
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
    nuevaPublicacion.id_publicacion = id_publicacion;

      // Verifica conexión usando tu servicio
  const online = await this.utilsService.checkInternetConnection();

  // Muestra el toast adecuado
  await this.toastCtrl.create({
    message: online
      ? '¡Publicación creada exitosamente!'
      : 'Publicación guardada offline. Se sincronizará cuando tengas conexión.',
    duration: 3000,
    position: 'bottom',
    color: online ? 'success' : 'warning'
  }).then(toast => toast.present());

  // Limpia el formulario
  this.contenido = '';
  this.imagenBase64 = null;
  if (this.fileInput) {
    this.fileInput.nativeElement.value = '';
  }

  // Navega a home
  this.router.navigate(['/home']);
  }
}