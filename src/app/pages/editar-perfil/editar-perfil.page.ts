import { Component, OnInit } from '@angular/core';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Router } from '@angular/router';
import { Usuario } from 'src/app/models/usuario.model';
import { ToastController } from '@ionic/angular';

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
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg'
  };

  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    const idUsuario = localStorage.getItem('id_usuario');
    if (idUsuario) {
      try {
        const user = await this.usuarioService.obtenerUsuarioDesdeFirestore(idUsuario);
        if (user) {
          this.usuario = user;
          console.log('✅ Usuario cargado desde Firestore en editar perfil:', this.usuario);
        } else {
          console.warn('⚠️ No se encontró usuario con ese ID en Firestore');
        }
      } catch (error) {
        console.error('❌ Error al cargar usuario desde Firestore:', error);
      }
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

guardarCambios() {
  // Validar correo y nombre para no enviar null o vacíos
  if (!this.usuario.correo_electronico || this.usuario.correo_electronico.trim() === '') {
    this.mostrarToast('El correo electrónico no puede estar vacío.', 'warning');
    return;
  }

  if (!this.usuario.nombre_usuario || this.usuario.nombre_usuario.trim() === '') {
    this.mostrarToast('El nombre de usuario no puede estar vacío.', 'warning');
    return;
  }

  this.usuarioService.actualizarUsuarioPorId(this.usuario.id_usuario, this.usuario)
    .then(() => {
      this.mostrarToast('Perfil actualizado correctamente', 'success');
      this.router.navigate(['/perfil']);
    })
    .catch(error => {
      console.error('Error al actualizar el perfil:', error);
      this.mostrarToast('Ocurrió un error al actualizar el perfil.', 'danger');
    });
}

}
