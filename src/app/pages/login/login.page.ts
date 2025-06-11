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
      const credenciales = await this.usuarioService.loginConFirebase(this.correo, this.contrasena);
      console.log('Usuario autenticado:', credenciales.user.email);
      this.router.navigate(['/home']);
    } catch (error: any) {
      this.errorAutenticacion = true;   
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
