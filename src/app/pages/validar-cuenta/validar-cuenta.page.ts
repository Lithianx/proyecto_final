import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-validar-cuenta',
  templateUrl: './validar-cuenta.page.html',
  styleUrls: ['./validar-cuenta.page.scss'],
  standalone: false,
})
export class ValidarCuentaPage {
  mensaje: string = '';
  archivos: File[] = [];

  showAlert = false;
  alertHeader = '';
  alertMessage = '';
  alertColor = ''; // Para color de alerta (verde o rojo)
  alertIcon = ''; // Para icono (tick o cruz)
  showLoading = false;

  constructor(private router: Router) {}

  onFileSelected(event: any) {
    this.archivos = Array.from(event.target.files);
    console.log('Archivos seleccionados:', this.archivos);
  }

  enviarSolicitud() {
    if (!this.mensaje || this.archivos.length === 0) {
      this.alertHeader = 'Faltan datos';
      this.alertMessage = 'Por favor complete el mensaje y suba al menos un documento.';
      this.alertColor = 'danger'; // Rojo para error
      this.alertIcon = 'close-circle'; // Icono de error
      this.showAlert = true;
      return;
    }

    this.showLoading = true;

    setTimeout(() => {
      this.showLoading = false;
      this.alertHeader = 'Solicitud enviada';
      this.alertMessage = 'Su solicitud fue enviada correctamente. Recibirá una respuesta dentro de una semana.';
      this.alertColor = 'success'; // Verde para éxito
      this.alertIcon = 'checkmark-circle'; // Icono de éxito
      this.showAlert = true;

      // Reset
      this.mensaje = '';
      this.archivos = [];
    }, 2000);
  }

  onAlertDismiss() {
    this.showAlert = false;

    if (this.alertColor === 'success') {
      this.router.navigate(['/perfil']); // Redirigir a "perfil"
    }
  }
}
