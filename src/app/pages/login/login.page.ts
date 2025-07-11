import { Component } from '@angular/core';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';  

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  correo: string = '';
  contrasena: string = '';
  
  // Para controlar error en inputs
  errorAutenticacion: boolean = false;

  // Variable para mostrar/ocultar contraseña
  mostrarContrasena: boolean = false;

  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    private toastController: ToastController  
  ) {}


  toggleMostrarContrasena() {
    this.mostrarContrasena = !this.mostrarContrasena;
  }

async iniciarSesion() {
  try {
    this.errorAutenticacion = false;
    console.log('Iniciando proceso de inicio de sesión...');

    // Usa el método híbrido (online/offline)
    const usuario = await this.usuarioService.login(this.correo, this.contrasena);

    if (!usuario) {
      this.errorAutenticacion = true;
      await this.mostrarToast('Contraseña o correo incorrecto');
      return; 
    }

    // Aquí validas si la cuenta está desactivada
    if (usuario.estado_cuenta === false) {
      this.errorAutenticacion = true;
      await this.mostrarToast('Tu cuenta ha sido desactivada. Contacta al administrador.');
      return;
    }

    // Si estás online, verifica el correo (opcional)
    if (navigator.onLine && usuario && usuario.estado_cuenta === true) {
      const credenciales = await this.usuarioService.loginConFirebase(this.correo, this.contrasena);

      if (credenciales.user && !credenciales.user.emailVerified) {
        await this.mostrarToast('Verifica tu correo antes de iniciar sesión');
        return; 
      }
    }

    console.log('Usuario autenticado:', usuario.correo_electronico);
    // Marca el usuario como online
    await this.usuarioService.setUsuarioOnline(usuario.id_usuario, true);

    this.router.navigate(['/home']);
    
  } catch (error: any) {
    this.errorAutenticacion = true;
    if (error && error.message && error.message.includes('desactivada')) {
      await this.mostrarToast('Tu cuenta ha sido desactivada. Contacta al administrador.');
    } else {
      await this.mostrarToast('Contraseña o correo incorrecto');
    }
  }
  this.errorAutenticacion = false;
}




  async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 5000,
      color: 'warning',
      position: 'top',
      icon: 'lock-closed',
      cssClass: 'toast-cuenta-desactivada'
    });
    await toast.present();
  }
}
