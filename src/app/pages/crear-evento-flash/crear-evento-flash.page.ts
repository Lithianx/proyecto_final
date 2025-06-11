import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Evento } from 'src/app/models/evento.model';
import { EventoService } from 'src/app/services/evento.service';
import { getAuth } from 'firebase/auth';

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
    private router: Router,
    private eventoService: EventoService,

  ) { }

  ngOnInit() {
    this.eventoForm = this.fb.group({
      tipo_evento: ['DEPORTE', Validators.required],
      nombre_evento: ['', Validators.required],
      lugar: ['', Validators.required],
      descripcion: ['', Validators.required],
      fecha_inicio: ['', Validators.required],
      fecha_termino: ['', Validators.required],
      cupos: [1, [Validators.required, Validators.min(1)]]
    });
  }

  async crearEvento() {
    if (this.eventoForm.valid) {
      const formValues = this.eventoForm.value;

      // Obtener UID del usuario autenticado
      const auth = getAuth();
      const uid = auth.currentUser?.uid ?? 'desconocido';

      const datos: Evento = {
        tipo_evento: formValues.tipo_evento,
        nombre_evento: formValues.nombre_evento,
        lugar: formValues.lugar,
        descripcion: formValues.descripcion,
        fechaInicio: new Date(formValues.fecha_inicio),
        fechaFin: new Date(formValues.fecha_termino),
        cupos: formValues.cupos,
        creado_por: uid
      };

      try {
        await this.eventoService.crearEvento(datos);

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
      } catch (error) {
        console.error('Error al guardar en Firestore', error);
        const toast = await this.toastCtrl.create({
          message: 'Error al guardar el evento',
          duration: 2000,
          color: 'danger',
          position: 'bottom',
        });
        await toast.present();
      }
    } else {
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
