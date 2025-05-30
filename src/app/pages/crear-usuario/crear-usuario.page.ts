import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-crear-usuario',
  templateUrl: './crear-usuario.page.html',
  styleUrls: ['./crear-usuario.page.scss'],
  standalone: false,
})
export class CrearUsuarioPage implements OnInit {
  nombre: string = '';
  correo: string = '';
  contrasena: string = '';
  confirmaContrasena: string = '';

  nombreInvalid = false;
  correoInvalid = false;
  contrasenaInvalid = false;
  confirmaContrasenaInvalid = false;

  constructor(
    private alertController: AlertController,
    private router: Router
  ) {}

  ngOnInit() {}

  async crearCuenta() {
    // Resetear estilos de error
    this.nombreInvalid = false;
    this.correoInvalid = false;
    this.contrasenaInvalid = false;
    this.confirmaContrasenaInvalid = false;

    // --- 1. Validar que todos los campos estén completos ---
    if (!this.nombre.trim() || !this.correo.trim() || !this.contrasena.trim() || !this.confirmaContrasena.trim()) {
      if (!this.nombre.trim()) this.nombreInvalid = true;
      if (!this.correo.trim()) this.correoInvalid = true;
      if (!this.contrasena.trim()) this.contrasenaInvalid = true;
      if (!this.confirmaContrasena.trim()) this.confirmaContrasenaInvalid = true;

      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Todos los campos son obligatorios.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    // --- 2. Validar formato del correo ---
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.correo)) {
      this.correoInvalid = true;
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'El correo electrónico no tiene un formato válido.ejemplo : a@a.com',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    // --- 3. Validar contraseña ---
    if (this.contrasena.length < 6) {
      this.contrasenaInvalid = true;
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'La contraseña debe tener al menos 6 caracteres.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    if (this.contrasena !== this.confirmaContrasena) {
      this.contrasenaInvalid = true;
      this.confirmaContrasenaInvalid = true;
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Las contraseñas no coinciden.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    // --- Éxito ---
    console.log('Cuenta creada con éxito');

    const alert = await this.alertController.create({
      header: 'Éxito',
      message: 'La cuenta ha sido creada correctamente.',
      buttons: [{
        text: 'OK',
        handler: () => {
          this.router.navigate(['/login']);
        }
      }],
    });
    await alert.present();

    // Limpiar campos
    this.nombre = '';
    this.correo = '';
    this.contrasena = '';
    this.confirmaContrasena = '';
  }
}
