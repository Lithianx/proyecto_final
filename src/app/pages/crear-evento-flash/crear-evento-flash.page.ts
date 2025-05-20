import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-crear-evento-flash',
  templateUrl: './crear-evento-flash.page.html',
  styleUrls: ['./crear-evento-flash.page.scss'],
  standalone: false,
})
export class CrearEventoFlashPage {
  eventoForm: FormGroup;
  fechaMinima: string = new Date().toISOString(); // Fecha mínima es hoy

  constructor(private fb: FormBuilder, private navCtrl: NavController) {
    this.eventoForm = this.fb.group({
      nombre_evento: ['', Validators.required],
      descripcion: ['', Validators.required],
      tipo_evento: ['', Validators.required],
      fecha_inicio: [new Date().toISOString(), Validators.required], // ← válido
      fecha_termino: [new Date().toISOString(), Validators.required],
    });
  }

  crearEvento() {
    if (this.eventoForm.valid) {
      const datos = this.eventoForm.value;
      console.log('Evento creado:', datos);
    } else {
      console.log('Formulario inválido');
    }
  }

  volverAtras() {
    this.navCtrl.back();
  }
}

