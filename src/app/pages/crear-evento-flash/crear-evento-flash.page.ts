import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-crear-evento-flash',
  templateUrl: './crear-evento-flash.page.html',
  styleUrls: ['./crear-evento-flash.page.scss'],
  standalone: false,
})
export class CrearEventoFlashPage implements OnInit {

  eventoForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.eventoForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: [''],
      tipo: ['', Validators.required],
      lugar: ['', Validators.required],
      horaInicio: ['', Validators.required],
      duracion: ['', Validators.required],
      cupos: [null],
      privacidad: ['publico', Validators.required]
    });
  }

  crearEvento() {
    if (this.eventoForm.valid) {
      const evento = this.eventoForm.value;
      console.log('Evento creado:', evento);
      // Aquí en el futuro se puede guardar en Firebase o API
    } else {
      console.log('Formulario inválido');
      this.eventoForm.markAllAsTouched();
    }
  }

  get f() {
    return this.eventoForm.controls;
  }

  cupos: number = 1;
  incrementCupos() {
    this.cupos++;
    this.eventoForm.get('cupos')?.setValue(this.cupos);
  }

  decrementCupos() {
    if (this.cupos > 1) {
      this.cupos--;
      this.eventoForm.get('cupos')?.setValue(this.cupos);
    }
  }
  volverAtras() {
    console.log('Volviendo atrás...');
    // Aquí puedes agregar lógica para navegar hacia atrás
    window.history.back();
  }
}








