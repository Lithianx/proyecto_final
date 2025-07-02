import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { UsuarioService } from 'src/app/services/usuario.service';

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

  mostrarContrasena = false;
  mostrarConfirmacion = false;

  aceptaTerminos = false;
  mostrarTerminos = false;

  constructor(
    private toastController: ToastController,
    private router: Router,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit() {}

  toggleMostrarContrasena() {
    this.mostrarContrasena = !this.mostrarContrasena;
  }

  toggleMostrarConfirmacion() {
    this.mostrarConfirmacion = !this.mostrarConfirmacion;
  }

  async mostrarToast(mensaje: string, color: string = 'danger') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2500,
      position: 'top',
      color: color,
      icon: color === 'danger' ? 'alert-circle' : 'checkmark-circle',
    });
    toast.present();
  }

  async crearCuenta() {
    // Validar si aceptó términos
    if (!this.aceptaTerminos) {
      await this.mostrarToast('Debes aceptar los términos y condiciones para continuar.');
      return;
    }

    // Resetear errores visuales
    this.nombreInvalid = false;
    this.correoInvalid = false;
    this.contrasenaInvalid = false;
    this.confirmaContrasenaInvalid = false;

    // Validar campos vacíos
    if (
      !this.nombre.trim() ||
      !this.correo.trim() ||
      !this.contrasena.trim() ||
      !this.confirmaContrasena.trim()
    ) {
      if (!this.nombre.trim()) this.nombreInvalid = true;
      if (!this.correo.trim()) this.correoInvalid = true;
      if (!this.contrasena.trim()) this.contrasenaInvalid = true;
      if (!this.confirmaContrasena.trim()) this.confirmaContrasenaInvalid = true;

      await this.mostrarToast('Todos los campos son obligatorios.');
      return;
    }

    // Validar correo institucional @duocuc.cl
    const correoInstitucionalRegex = /^[a-zA-Z0-9._%+-]+@duocuc\.cl$/;
    if (!correoInstitucionalRegex.test(this.correo)) {
      this.correoInvalid = true;
      await this.mostrarToast('Solo se permiten correos institucionales @duocuc.cl');
      return;
    }

    // Validar longitud de contraseña
    if (this.contrasena.length < 6) {
      this.contrasenaInvalid = true;
      await this.mostrarToast('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    // Validar coincidencia de contraseñas
    if (this.contrasena !== this.confirmaContrasena) {
      this.contrasenaInvalid = true;
      this.confirmaContrasenaInvalid = true;
      await this.mostrarToast('Las contraseñas no coinciden.');
      return;
    }

    try {
      await this.usuarioService.crearCuenta(this.nombre.trim(), this.correo.trim(), this.contrasena);

      await this.mostrarToast('Cuenta creada correctamente.', 'success');
      this.router.navigate(['/login']);

      // Limpiar campos
      this.nombre = '';
      this.correo = '';
      this.contrasena = '';
      this.confirmaContrasena = '';
      this.aceptaTerminos = false;
      this.mostrarTerminos = false;
    } catch (error) {
      this.correoInvalid = true;
      await this.mostrarToast('No se pudo crear la cuenta. El correo ya está en uso.');
    }
  }
}
