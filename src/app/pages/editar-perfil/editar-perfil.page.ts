import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Router } from '@angular/router';
import { Usuario } from 'src/app/models/usuario.model';
import { ToastController } from '@ionic/angular';
import { LocalStorageService } from '../../services/local-storage-social.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

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
    private router: Router,
    private toastController: ToastController
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

    // Guardar imagen seleccionada si existe
    if (this.imagenBase64) {
      this.usuario.avatar = this.imagenBase64;
    }

    try {
      await this.usuarioService.actualizarUsuario(this.usuario);

      this.fotoPerfil = this.usuario.avatar || this.fotoPerfil;
      this.nombreUsuario = this.usuario.nombre_usuario;
      this.descripcionBio = this.usuario.descripcion || '';
      this.subname = this.usuario.sub_name || '';

      this.mostrarToast('Perfil actualizado correctamente', 'success');
      this.router.navigate(['/perfil']);
    } catch (error) {
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
          quality: 80,
          allowEditing: false,
          saveToGallery: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Prompt
        });
        this.imagenBase64 = image.dataUrl || null;
        this.usuario.avatar = this.imagenBase64 || this.usuario.avatar;
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
      this.cargandoImagen = true;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenBase64 = reader.result as string;
        this.usuario.avatar = this.imagenBase64;
        this.cargandoImagen = false;
      };
      reader.onerror = () => {
        this.cargandoImagen = false;
      };
      reader.readAsDataURL(file);
    } else {
      this.mostrarToast('Por favor selecciona solo archivos de imagen.', 'danger');
      if (this.fileInput) {
        this.fileInput.nativeElement.value = '';
      }
    }
  }
}
