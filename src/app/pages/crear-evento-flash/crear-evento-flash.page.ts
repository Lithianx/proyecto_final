import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-crear-evento-flash',
  templateUrl: './crear-evento-flash.page.html',
  styleUrls: ['./crear-evento-flash.page.scss'],
  standalone: false,
})
export class CrearEventoFlashPage implements OnInit {
  eventoForm!: FormGroup;
  fechaMinima: string = new Date().toISOString(); // Fecha mínima es hoy

  constructor(
    private fb: FormBuilder,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  ngOnInit() {
  this.eventoForm = this.fb.group({
    tipo_evento: ['DEPORTE', Validators.required],
    nombre_evento: ['', Validators.required],
    descripcion: ['', Validators.required],
    fecha_inicio: ['', Validators.required],
    fecha_termino: ['', Validators.required],
    cupos: [1, [Validators.required, Validators.min(1)]]
  });
}

  async crearEvento() {
    if (this.eventoForm.valid) {
      const datos = this.eventoForm.value;
      console.log('Evento creado:', datos);

      const toast = await this.toastCtrl.create({
        message: 'Evento creado exitosamente 🎉',
        duration: 2000,
        color: 'success',
        position: 'bottom',
      });
      await toast.present();

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

  modificarCupos(valor: number) {
    const actual = this.eventoForm.get('cupos')?.value || 1;
    const nuevo = Math.min(22, Math.max(1, actual + valor)); // Entre 1 y 22
    this.eventoForm.get('cupos')?.setValue(nuevo);
  }

  volverAtras() {
    this.navCtrl.back();
  }
}
