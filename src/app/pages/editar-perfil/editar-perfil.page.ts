import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Router } from '@angular/router';
import { Usuario } from 'src/app/models/usuario.model';
import { ToastController } from '@ionic/angular';
import { LocalStorageService } from '../../services/local-storage-social.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { FirebaseStorageService } from 'src/app/services/firebase-storage.service';
import { UtilsService } from 'src/app/services/utils.service';
import { FiltroPalabraService } from 'src/app/services/filtropalabra.service';

@Component({
  selector: 'app-editar-perfil',
  templateUrl: './editar-perfil.page.html',
  styleUrls: ['./editar-perfil.page.scss'],
  standalone: false,
})
export class EditarPerfilPage implements OnInit {

  usuario: Usuario = {
    id_usuario: '',
    nombre_usuario: '',
    correo_electronico: '',
    fecha_registro: new Date(),
    contrasena: '',
    estado_cuenta: true,
    estado_online: false,
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
    sub_name: '',
    descripcion: '',
    rol: ''
  };

  fotoPerfil: string = this.usuario.avatar;
  nombreUsuario: string = '';
  descripcionBio: string = '';
  subname: string = '';
  imagenBase64: string | null = null;
  cargandoImagen: boolean = false;

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private usuarioService: UsuarioService,
    private localStorageService: LocalStorageService,
    private firebaseStorageService: FirebaseStorageService,
    private utilsService: UtilsService,
    private router: Router,
    private toastController: ToastController,
    private filtroPalabraService: FiltroPalabraService
  ) {}

  ngOnInit() {}

  async ionViewWillEnter() {
    await this.cargarUsuario();
  }

  private async cargarUsuario() {
    const id_usuario: string | null = await this.localStorageService.getItem('id_usuario');
    if (!id_usuario) {
      console.warn('No hay id_usuario en localStorage');
      return;
    }

    try {
      const usuario = await this.usuarioService.getUsuarioPorId(id_usuario);
      if (usuario) {
        this.usuario = usuario;
        this.fotoPerfil = usuario.avatar || this.fotoPerfil;
        this.nombreUsuario = usuario.nombre_usuario || '';
        this.descripcionBio = usuario.descripcion || '';
        this.subname = usuario.sub_name || '';
      }
    } catch (error) {
      console.error('Error al cargar el usuario:', error);
    }
  }

  private validateImageSize(base64String: string): boolean {
    const sizeInBytes = (base64String.length * 3) / 4;
    const sizeInMB = sizeInBytes / (1024 * 1024);
    return sizeInMB <= 5;
  }

  private getImageSizeInfo(base64String: string): string {
    const sizeInBytes = (base64String.length * 3) / 4;
    const sizeInMB = sizeInBytes / (1024 * 1024);
    return sizeInMB < 1 ? `${(sizeInMB * 1024).toFixed(0)} KB` : `${sizeInMB.toFixed(1)} MB`;
  }

  async mostrarToast(mensaje: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2500,
      position: 'bottom',
      color: color
    });
    await toast.present();
  }

  async guardarCambios() {
    if (!this.usuario.correo_electronico.trim()) {
      this.mostrarToast('El correo electrónico no puede estar vacío.', 'warning');
      return;
    }

    if (!this.usuario.nombre_usuario.trim()) {
      this.mostrarToast('El nombre de usuario no puede estar vacío.', 'warning');
      return;
    }

    // Validar palabras prohibidas
    const campos = [
      { nombre: 'Nombre de usuario', valor: this.usuario.nombre_usuario },
      { nombre: 'Subnombre', valor: this.usuario.sub_name || '' },
      { nombre: 'Descripción', valor: this.usuario.descripcion || '' }
    ];

    for (const campo of campos) {
      if (this.filtroPalabraService.contienePalabraVetada(campo.valor)) {
        this.mostrarToast(`El campo "${campo.nombre}" contiene contenido inapropiado.`, 'danger');
        return;
      }
    }

    const loadingToast = await this.toastController.create({
      message: 'Guardando cambios...',
      duration: 0,
      position: 'bottom'
    });
    await loadingToast.present();

    try {
      if (this.imagenBase64) {
        const online = await this.utilsService.checkInternetConnection();
        if (online) {
          if (this.usuario.avatar &&
              this.usuario.avatar.includes('firebasestorage.googleapis.com') &&
              !this.usuario.avatar.includes('ionicframework.com/docs/img/demos/avatar.svg')) {
            try {
              await this.firebaseStorageService.deleteImage(this.usuario.avatar);
            } catch (error) {
              console.error('Error al eliminar avatar anterior:', error);
            }
          }

          const avatarUrl = await this.firebaseStorageService.uploadCompressedImage(
            this.imagenBase64, 'avatars', 400, 400, 0.9
          );
          this.usuario.avatar = avatarUrl;
        } else {
          await loadingToast.dismiss();
          this.mostrarToast('No se puede subir la imagen sin conexión a internet.', 'danger');
          return;
        }
      }

      await this.usuarioService.actualizarUsuario(this.usuario);

      this.fotoPerfil = this.usuario.avatar || this.fotoPerfil;
      this.nombreUsuario = this.usuario.nombre_usuario;
      this.descripcionBio = this.usuario.descripcion || '';
      this.subname = this.usuario.sub_name || '';

      await loadingToast.dismiss();
      this.mostrarToast('Perfil actualizado correctamente', 'success');
      this.router.navigate(['/perfil']);
    } catch (error) {
      await loadingToast.dismiss();
      console.error('Error al actualizar el perfil:', error);
      this.mostrarToast('Ocurrió un error al actualizar el perfil.', 'danger');
    }
  }

  async seleccionarImagen() {
    const isCapacitor = !!(window as any).Capacitor?.isNativePlatform?.() || !!(window as any).Capacitor?.isNative;
    if (isCapacitor) {
      try {
        this.cargandoImagen = true;
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          saveToGallery: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Prompt
        });

        if (image.dataUrl) {
          if (!this.validateImageSize(image.dataUrl)) {
            this.mostrarToast(`La imagen es demasiado grande (${this.getImageSizeInfo(image.dataUrl)}). Se comprimirá automáticamente.`, 'warning');
          }

          this.imagenBase64 = image.dataUrl;
          this.usuario.avatar = image.dataUrl;
        }
      } catch (error: any) {
        this.mostrarToast('No se pudo acceder a la cámara o galería. Revisa los permisos.', 'danger');
      } finally {
        this.cargandoImagen = false;
      }
    } else {
      this.fileInput.nativeElement.click();
    }
  }

  async onArchivoSeleccionado(event: any) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > 5) {
        this.mostrarToast(`La imagen es demasiado grande (${fileSizeInMB.toFixed(1)} MB). El límite es 5MB.`, 'danger');
        this.fileInput.nativeElement.value = '';
        return;
      }

      this.cargandoImagen = true;
      const reader = new FileReader();
      reader.onload = async () => {
        const imageBase64 = reader.result as string;

        if (!this.validateImageSize(imageBase64)) {
          this.mostrarToast(`La imagen es demasiado grande (${this.getImageSizeInfo(imageBase64)}). Se comprimirá automáticamente.`, 'warning');
        }

        this.imagenBase64 = imageBase64;
        this.usuario.avatar = imageBase64;
        this.cargandoImagen = false;
      };
      reader.onerror = () => {
        this.cargandoImagen = false;
      };
      reader.readAsDataURL(file);
    } else {
      this.mostrarToast('Por favor selecciona solo archivos de imagen.', 'danger');
      this.fileInput.nativeElement.value = '';
    }
  }
}
