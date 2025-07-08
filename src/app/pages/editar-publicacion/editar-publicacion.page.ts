import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Usuario } from 'src/app/models/usuario.model';
import { Publicacion } from 'src/app/models/publicacion.model';
import { environment } from 'src/environments/environment';
import { LocalStorageService } from 'src/app/services/local-storage-social.service';
import { PublicacionService } from 'src/app/services/publicacion.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { FirebaseStorageService } from 'src/app/services/firebase-storage.service';
import { NavController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { FiltroPalabraService } from 'src/app/services/filtropalabra.service';
import { UtilsService } from 'src/app/services/utils.service';

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
    descripcion:'',
    rol: ''
  };

  postId!: string;
  publicacion!: Publicacion;
  contenido: string = '';
  imagenBase64: string | null = null;
  publicaciones: Publicacion[] = []; // Lista de publicaciones cargadas
  cargandoImagen: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private localStorage: LocalStorageService,
    private publicacionService: PublicacionService,
    private usuarioService: UsuarioService,
    private firebaseStorageService: FirebaseStorageService,
    private utilsService: UtilsService,
    private navCtrl: NavController,
  private toastCtrl: ToastController,
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

    this.route.params.subscribe(async params => {
      this.postId = params['id'];

      // Cargar publicaciones según conexión usando el servicio utils
      const isOnline = await this.utilsService.checkInternetConnection();
      console.log(`🔍 Cargando publicación para editar. Online: ${isOnline}, ID: ${this.postId}`);

      if (isOnline) {
        console.log('📡 Cargando publicaciones online...');
        this.publicaciones = await this.publicacionService.getPublicaciones();
      } else {
        console.log('📴 Cargando publicaciones offline...');
        // Cargar tanto publicaciones locales como personales offline
        const publicacionesLocales = await this.localStorage.getList<Publicacion>('publicaciones') || [];
        const publicacionesPersonales = await this.publicacionService.getPublicacionesPersonal();
        this.publicaciones = [...publicacionesLocales, ...publicacionesPersonales];
        console.log(`📄 Publicaciones cargadas offline: ${this.publicaciones.length}`);
      }

      // Buscar la publicación por ID (id_publicacion ahora es string)
      const publicacionEncontrada = this.publicaciones.find(p => p.id_publicacion === this.postId);

      if (publicacionEncontrada) {
        this.publicacion = publicacionEncontrada;
        this.contenido = this.publicacion.contenido;
        this.imagenBase64 = this.publicacion.imagen || null;
        console.log(`✅ Publicación encontrada para editar: ${this.publicacion.id_publicacion}`);
      } else {
        console.warn(`❌ Publicación no encontrada con ID: ${this.postId}`);
        console.log('📄 Publicaciones disponibles:', this.publicaciones.map(p => ({ id: p.id_publicacion, contenido: p.contenido?.substring(0, 50) })));
        
        // Mostrar toast de error
        const toast = await this.toastCtrl.create({
          message: 'Publicación no encontrada',
          duration: 3000,
          color: 'danger'
        });
        await toast.present();
        
        // Regresar a la página anterior
        this.navCtrl.back();
      }
    });
  }

  // Función para validar el tamaño de la imagen
  private validateImageSize(base64String: string): boolean {
    const sizeInBytes = (base64String.length * 3) / 4;
    const sizeInMB = sizeInBytes / (1024 * 1024);
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
      position: 'bottom'
    });
    toast.present();
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }
}

  
async guardarCambios() {
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

  if (!this.publicacion) return;

  // Verificar conexión al inicio
  const isOnline = await this.utilsService.checkInternetConnection();
  console.log(`💾 Guardando cambios en publicación. Online: ${isOnline}`);

  // Mostrar toast de carga
  const loadingToast = await this.toastCtrl.create({
    message: 'Guardando cambios...',
    duration: 0,
    position: 'top'
  });
  await loadingToast.present();

  try {
    let imagenUrl = this.publicacion.imagen || '';
    
    // Si hay una nueva imagen, subirla a Firebase Storage
    if (this.imagenBase64 && this.imagenBase64 !== this.publicacion.imagen) {
      // Verificar si es una URL de Giphy (no necesita subirse a Storage)
      if (this.imagenBase64.startsWith('http')) {
        imagenUrl = this.imagenBase64;
      } else {
        // Verificar conexión para subir la imagen
        if (isOnline) {
          // Si había una imagen anterior y no es de Giphy, eliminarla
          if (this.publicacion.imagen && 
              this.publicacion.imagen.includes('firebasestorage.googleapis.com') &&
              !this.publicacion.imagen.startsWith('https://media.giphy.com/')) {
            try {
              await this.firebaseStorageService.deleteImage(this.publicacion.imagen);
            } catch (error) {
              console.error('Error al eliminar imagen anterior:', error);
            }
          }
          
          // Comprimir y subir la nueva imagen
          imagenUrl = await this.firebaseStorageService.uploadCompressedImage(
            this.imagenBase64,
            'publicaciones',
            1200, // maxWidth
            1200, // maxHeight
            0.8   // quality
          );
          console.log('✅ Imagen subida exitosamente:', imagenUrl);
        } else {
          // Si no hay conexión, usar la imagen base64 para guardar offline
          imagenUrl = this.imagenBase64;
          console.log('📴 Guardando imagen en base64 para sincronización posterior');
        }
      }
    }

    // Actualizar la publicación
    this.publicacion.contenido = this.contenido;
    this.publicacion.imagen = imagenUrl;

    await this.publicacionService.updatePublicacion(this.publicacion);
    console.log('✅ Publicación actualizada exitosamente');

    // Cerrar toast de carga
    await loadingToast.dismiss();

    // Recargar publicaciones según el estado de conexión
    if (isOnline) {
      this.publicaciones = await this.publicacionService.getPublicaciones();
    } else {
      // Cargar tanto publicaciones locales como personales offline
      const publicacionesLocales = await this.localStorage.getList<Publicacion>('publicaciones') || [];
      const publicacionesPersonales = await this.publicacionService.getPublicacionesPersonal();
      this.publicaciones = [...publicacionesLocales, ...publicacionesPersonales];
    }

    console.log('📄 Publicaciones recargadas:', this.publicaciones.length);
    
    const mensaje = isOnline ? 
      '¡Publicación modificada exitosamente!' : 
      '¡Publicación guardada offline! Se sincronizará cuando haya conexión.';
    
    await this.mostrarToast(mensaje);
    this.router.navigate(['/home']);

  } catch (error) {
    // Cerrar toast de carga en caso de error
    await loadingToast.dismiss();
    
    console.error('❌ Error al guardar cambios:', error);
    const toast = await this.toastCtrl.create({
      message: 'Error al guardar los cambios. Inténtalo de nuevo.',
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    toast.present();
  }
}


  async mostrarToast(mensaje: string) {
  const toast = await this.toastCtrl.create({
    message: mensaje,
    duration: 2000,
    color: 'success',
    position: 'top'
  });
  toast.present();
}
}