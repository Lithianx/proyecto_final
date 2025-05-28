import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-crear-evento-flash',
  templateUrl: './crear-evento-flash.page.html',
  styleUrls: ['./crear-evento-flash.page.scss'],
  standalone: false,
})
export class CrearEventoFlashPage {
  eventoForm: FormGroup;
  fechaMinima: string = new Date().toISOString(); // Fecha mínima es hoy

  constructor(
    private fb: FormBuilder,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private router: Router
  ) {
    this.eventoForm = this.fb.group({
      nombre_evento: ['', Validators.required],
      descripcion: ['', Validators.required],
      tipo_evento: ['', Validators.required],
      fecha_inicio: [new Date().toISOString(), Validators.required],
      fecha_termino: [new Date().toISOString(), Validators.required],
    });
  }

  async crearEvento() {
    if (this.eventoForm.valid) {
      const datos = this.eventoForm.value;
      console.log('Evento creado:', datos);

      // Mostrar el toast
      const toast = await this.toastCtrl.create({
        message: 'Evento creado exitosamente 🎉',
        duration: 2000,
        color: 'success',
        position: 'bottom',
      });
      await toast.present();

      // Redirigir al home después del toast
      setTimeout(() => {
        this.router.navigate(['/home']);
      }, 2000);
    } else {
      console.log('Formulario inválido');

      const toast = await this.toastCtrl.create({
        message: 'Por favor completa todos los campos',
        duration: 2000,
        color: 'danger',
        position: 'bottom',
      });
      await toast.present();
    }
  }

  volverAtras() {
    this.navCtrl.back();
  }
}