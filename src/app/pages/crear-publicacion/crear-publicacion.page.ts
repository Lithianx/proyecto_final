import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { Usuario } from 'src/app/models/usuario.model';
import { Publicacion } from 'src/app/models/publicacion.model';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { environment } from 'src/environments/environment';

import { LocalStorageService } from 'src/app/services/local-storage-social.service';

@Component({
  selector: 'app-crear-publicacion',
  templateUrl: './crear-publicacion.page.html',
  styleUrls: ['./crear-publicacion.page.scss'],
  standalone: false,
})
export class CrearPublicacionPage implements OnInit {

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  // Usuario simulado (ajustado al modelo real)
  usuario: Usuario = {
    id_usuario: 1,
    nombre_usuario: 'Juan Pérez',
    correo_electronico: 'juan@correo.com',
    fecha_registro: new Date(),
    contrasena: '',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
    estado_cuenta: true,
    estado_online: true
  };


  contenido: string = '';
  imagenBase64: string | null = null;
  mostrarDescripcion: boolean = false;

  publicaciones: Publicacion[] = []; // Lista de publicaciones creadas

  constructor(private router: Router,private localStorage: LocalStorageService) { }

async ngOnInit() {
  this.publicaciones = await this.localStorage.getList<Publicacion>('publicaciones_personal');
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
    id_publicacion: this.publicaciones.length + 1,
    id_usuario: this.usuario.id_usuario,
    contenido: this.contenido || '',
    imagen: this.imagenBase64 || '',
    fecha_publicacion: new Date(),
  };

  await this.localStorage.addToList<Publicacion>('publicaciones_personal', nuevaPublicacion);
  this.publicaciones = await this.localStorage.getList<Publicacion>('publicaciones_personal');

  console.log('Publicación creada:', nuevaPublicacion);

  this.contenido = '';
  this.imagenBase64 = null;
  if (this.fileInput) {
    this.fileInput.nativeElement.value = '';
  }
}

  // Función para navegar a la pantalla de edición
  modificar(post: Publicacion) {
    this.router.navigate(['/editar-publicacion', post.id_publicacion]);
  }
}
