import { Component } from '@angular/core';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-olvido-contrasena',
  templateUrl: './olvido-contrasena.page.html',
  styleUrls: ['./olvido-contrasena.page.scss'],
    standalone: false,
})
export class OlvidoContrasenaPage {
  correo: string = '';

  constructor(
    private usuarioService: UsuarioService,
    private toastController: ToastController
  ) {}

async enviarRestablecimiento() {
  if (!this.correo.trim()) {
    this.mostrarToast('Por favor ingresa tu correo');
    return;
  }

  try {
    await this.usuarioService.restablecerContrasena(this.correo.trim());
    this.mostrarToast('Correo de restablecimiento enviado', 'success');
    this.correo = '';  // <-- limpia el input
  } catch (error) {
    this.mostrarToast('Error al enviar el correo. Verifica el correo ingresado.');
  }
}


  async mostrarToast(mensaje: string, color: string = 'danger') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2500,
      position: 'top',
      color,
    });
    toast.present();
  }
}
