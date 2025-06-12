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

    const credenciales = await this.usuarioService.loginConFirebase(this.correo, this.contrasena);
    console.log('Credenciales obtenidas:', credenciales);

    if (credenciales.user && !credenciales.user.emailVerified) {
      console.warn('Correo no verificado');
      await this.mostrarToast('Verifica tu correo antes de iniciar sesión');
      await credenciales.user.sendEmailVerification(); // Opcional: reenviar verificación
      return;
    }

    const uid = credenciales.user.uid;
    console.log('UID del usuario:', uid);

    const datosUsuario = await this.usuarioService.obtenerUsuarioDesdeFirestore(uid);
    console.log('Datos obtenidos de Firestore:', datosUsuario);

    if (datosUsuario) {
      await this.usuarioService.setUsuarios([datosUsuario]); // guarda en memoria y localStorage
      console.log('Usuario cargado en memoria y localStorage');
    } else {
      console.warn('No se encontraron datos del usuario en Firestore');
      await this.mostrarToast('No se encontraron datos del usuario');
      return;
    }

    console.log('Navegando a la página de inicio...');
    this.router.navigate(['/home']);
    
  } catch (error: any) {
    this.errorAutenticacion = true;
    console.error('Error en inicio de sesión:', error);
    this.mostrarToast('Contraseña o correo incorrecto');
  }
}




  async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color: 'danger',
      position: 'top',
      icon: 'alert-circle'
    });
    await toast.present();
  }
}
