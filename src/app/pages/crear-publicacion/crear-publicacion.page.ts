import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { Usuario } from 'src/app/models/usuario.model';
import { Publicacion } from 'src/app/models/publicacion.model';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { environment } from 'src/environments/environment';

import { LocalStorageService } from 'src/app/services/local-storage-social.service';
import { PublicacionService } from 'src/app/services/publicacion.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { FirebaseStorageService } from 'src/app/services/firebase-storage.service';
import { NavController } from '@ionic/angular';
import { UtilsService } from 'src/app/services/utils.service';
import { ToastController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { FiltroPalabraService } from 'src/app/services/filtropalabra.service';

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
  cargandoImagen: boolean = false;

  publicaciones: Publicacion[] = []; // Lista de publicaciones creadas

  constructor(
    private router: Router,
    private localStorage: LocalStorageService,
    private publicacionService: PublicacionService,
    private usuarioService: UsuarioService,
    private firebaseStorageService: FirebaseStorageService,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private utilsService: UtilsService,
    private filtroPalabra: FiltroPalabraService
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

  // Función para validar el tamaño de la imagen
  private validateImageSize(base64String: string): boolean {
    // Calcular el tamaño en bytes de la imagen base64
    const sizeInBytes = (base64String.length * 3) / 4;
    const sizeInMB = sizeInBytes / (1024 * 1024);
    
    // Límite de 5MB para imágenes
    return sizeInMB <= 5;
  }

  // Función para mostrar información del tamaño de la imagen
  private getImageSizeInfo(base64String: string): string {
    const sizeInBytes = (base64String.length * 3) / 4;
    const sizeInMB = sizeInBytes / (1024 * 1024);
    
    if (sizeInMB < 1) {
      return `${(sizeInMB * 1024).toFixed(0)} KB`;
    } else {
      return `${sizeInMB.toFixed(1)} MB`;
    }
  }

async seleccionarImagen() {
  const isCapacitor = !!(window as any).Capacitor?.isNativePlatform?.() || !!(window as any).Capacitor?.isNative;
  if (isCapacitor) {
    try {
      this.cargandoImagen = true; // Mostrar spinner
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
      
      if (image.dataUrl) {
        // Validar tamaño de la imagen
        if (!this.validateImageSize(image.dataUrl)) {
          const toast = await this.toastCtrl.create({
            message: `La imagen es demasiado grande (${this.getImageSizeInfo(image.dataUrl)}). Se comprimirá automáticamente.`,
            duration: 3000,
            color: 'warning',
            position: 'top'
          });
          toast.present();
        }
        
        this.imagenBase64 = image.dataUrl;
      }
    } catch (error: any) {
      const toast = await this.toastCtrl.create({
        message: 'No se pudo acceder a la cámara o galería. Revisa los permisos de la app.',
        duration: 2500,
        color: 'danger',
        position: 'top'
      });
      toast.present();
    } finally {
      this.cargandoImagen = false; // Ocultar spinner siempre
    }
  } else {
    this.fileInput.nativeElement.click();
  }
}

async onArchivoSeleccionado(event: any) {
  const file = event.target.files[0];
  if (file && file.type.startsWith('image/')) {
    // Validar tamaño del archivo (límite de 5MB)
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > 5) {
      const toast = await this.toastCtrl.create({
        message: `La imagen es demasiado grande (${fileSizeInMB.toFixed(1)} MB). El límite es 5MB.`,
        duration: 3000,
        color: 'danger',
        position: 'top'
      });
      toast.present();
      if (this.fileInput) {
        this.fileInput.nativeElement.value = '';
      }
      return;
    }

    this.cargandoImagen = true; // Mostrar spinner
    const reader = new FileReader();
    reader.onload = async () => {
      const imageBase64 = reader.result as string;
      
      // Validar tamaño en base64
      if (!this.validateImageSize(imageBase64)) {
        const toast = await this.toastCtrl.create({
          message: `La imagen es demasiado grande (${this.getImageSizeInfo(imageBase64)}). Se comprimirá automáticamente.`,
          duration: 3000,
          color: 'warning',
          position: 'top'
        });
        toast.present();
      }
      
      this.imagenBase64 = imageBase64;
      this.cargandoImagen = false; // Ocultar spinner
    };
    reader.onerror = () => {
      this.cargandoImagen = false;
    };
    reader.readAsDataURL(file);
  } else {
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

  // Filtro de palabras vetadas
  if (this.filtroPalabra.contienePalabraVetada(this.contenido)) {
    const toast = await this.toastCtrl.create({
      message: 'Tu publicación contiene palabras no permitidas.',
      duration: 2500,
      color: 'danger',
      position: 'top'
    });
    toast.present();
    return;
  }

  // Mostrar toast de carga
  const loadingToast = await this.toastCtrl.create({
    message: 'Publicando...',
    duration: 0,
    position: 'top'
  });
  await loadingToast.present();

  try {
    let imagenUrl = '';
    
    // Si hay imagen, subirla a Firebase Storage
    if (this.imagenBase64) {
      // Verificar si es una URL de Giphy (no necesita subirse a Storage)
      if (this.imagenBase64.startsWith('http')) {
        imagenUrl = this.imagenBase64;
      } else {
        // Verificar conexión para subir la imagen
        const online = await this.utilsService.checkInternetConnection();
        if (online) {
          console.log('📡 Subiendo imagen online...');
          // Comprimir y subir la imagen
          imagenUrl = await this.firebaseStorageService.uploadCompressedImage(
            this.imagenBase64,
            'publicaciones',
            1200, // maxWidth
            1200, // maxHeight
            0.8   // quality
          );
          console.log('✅ Imagen subida exitosamente:', imagenUrl);
        } else {
          console.log('📴 Guardando imagen offline en base64 para sincronización posterior');
          // Si no hay conexión, usar la imagen base64 para guardar offline
          // La sincronización se encargará de subirla después
          imagenUrl = this.imagenBase64;
        }
      }
    }

    const nuevaPublicacion: Publicacion = {
      id_publicacion: '', // Temporal
      id_usuario: this.usuarioActual.id_usuario,
      contenido: this.contenido || '',
      imagen: imagenUrl || '', // Ahora es una URL en lugar de base64
      fecha_publicacion: new Date(),
    };

    // Guardar en Firebase y obtener el ID generado
    const id_publicacion = await this.publicacionService.addPublicacion(nuevaPublicacion);
    nuevaPublicacion.id_publicacion = id_publicacion;

    // Cerrar toast de carga
    await loadingToast.dismiss();

    // Verifica conexión usando tu servicio
    const online = await this.utilsService.checkInternetConnection();

    // Muestra el toast adecuado
    await this.toastCtrl.create({
      message: online
        ? '¡Publicación creada exitosamente!'
        : 'Publicación guardada offline. Se sincronizará cuando tengas conexión.',
      duration: 3000,
      position: 'top',
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

  } catch (error) {
    // Cerrar toast de carga en caso de error
    await loadingToast.dismiss();
    
    console.error('Error al publicar:', error);
    const toast = await this.toastCtrl.create({
      message: 'Error al crear la publicación. Inténtalo de nuevo.',
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    toast.present();
  }
}
}