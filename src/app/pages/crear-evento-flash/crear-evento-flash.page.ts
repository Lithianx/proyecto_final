import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

import { EventoService } from 'src/app/services/evento.service';
import { LocalStorageService } from 'src/app/services/local-storage-social.service';
import { FiltroPalabraService } from 'src/app/services/filtropalabra.service';
import { NotificacionesService } from 'src/app/services/notificaciones.service';

import { getAuth } from 'firebase/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

import { TipoJuego } from 'src/app/models/tipo-juego.model';
import { Juego } from 'src/app/models/juego.model';
import { Evento } from 'src/app/models/evento.model';

@Component({
  selector: 'app-crear-evento-flash',
  templateUrl: './crear-evento-flash.page.html',
  styleUrls: ['./crear-evento-flash.page.scss'],
  standalone: false,
})
export class CrearEventoFlashPage implements OnInit {
  eventoForm!: FormGroup;
  fechaMinima: string = new Date().toISOString();
  fechaSeleccionada: string = '';

  tiposJuego: TipoJuego[] = [];
  juegos: Juego[] = [];
  juegosFiltrados: Juego[] = [];

  tipoSeleccionado: string = '';

  constructor(
    private fb: FormBuilder,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private router: Router,
    private eventoService: EventoService,
    private firestore: Firestore,
    private localStorageService: LocalStorageService,
    private filtroPalabraService: FiltroPalabraService,
    private notificacionesService: NotificacionesService  // <-- Inyectar servicio
  ) { }

  ngOnInit() {
    const ahora = new Date();
    const offsetMs = ahora.getTimezoneOffset() * 60000;
    const chileTime = new Date(ahora.getTime() - offsetMs);
    this.fechaMinima = chileTime.toISOString();

    this.eventoForm = this.fb.group({
      nombre_evento: ['', Validators.required],
      id_juego: ['', Validators.required],
      id_tipo_juego: ['', Validators.required],
      lugar: ['', Validators.required],
      descripcion: ['', Validators.required],
      fechaInicio: ['', Validators.required],
      cupos: [2, [Validators.required, Validators.min(1)]],
    });

    this.cargarTiposJuego();
    this.cargarJuegos();
  }

  cargarTiposJuego() {
    this.eventoService.getTiposJuego().subscribe((tipos) => {
      this.tiposJuego = tipos;
      if (tipos.length > 0) {
        this.eventoForm.get('id_tipo_juego')?.setValue(tipos[0].id_tipo_juego);
        this.filtrarJuegos();
      }
    });
  }

  cargarJuegos() {
    this.eventoService.getJuegos().subscribe((juegos) => {
      this.juegos = juegos;
      this.filtrarJuegos();
    });
  }

  filtrarJuegos() {
    const idTipo = this.eventoForm.get('id_tipo_juego')?.value;
    this.juegosFiltrados = this.juegos.filter(j => j.id_tipo_juego === idTipo);
    this.eventoForm.get('id_juego')?.setValue('');
  }

  async crearEvento() {
    if (!this.eventoForm.valid) {
      const toast = await this.toastCtrl.create({
        message: 'Por favor completa todos los campos',
        duration: 2000,
        color: 'danger',
        position: 'top',
      });
      await toast.present();
      return;
    }

    const formValues = this.eventoForm.value;
    // Validación de palabras vetadas
    const camposAValidar = [
      { campo: 'nombre del evento', valor: formValues.nombre_evento },
      { campo: 'lugar', valor: formValues.lugar },
      { campo: 'descripción', valor: formValues.descripcion }
    ];

    for (const campo of camposAValidar) {
      if (this.filtroPalabraService.contienePalabraVetada(campo.valor)) {
        const toast = await this.toastCtrl.create({
          message: `🚫 El ${campo.campo} contiene palabras no permitidas.`,
          duration: 2500,
          color: 'warning',
          position: 'top',
        });
        await toast.present();
        return;
      }
    }

    const idUsuario = await this.localStorageService.getItem<string>('id_usuario');
    if (!idUsuario || typeof idUsuario !== 'string') {
      console.warn('⚠️ id_usuario no encontrado en LocalStorageService');
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;

    let nombreUsuario = 'desconocido';
    if (user) {
      try {
        const docRef = doc(this.firestore, 'Usuario', user.uid);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const data = snapshot.data() as any;
          nombreUsuario = data.nombre_usuario || 'sin nombre';
        }
      } catch (error) {
        console.error('❌ Error obteniendo usuario:', error);
      }
    }

    const idEstado = await this.eventoService.obtenerIdEstadoPorDescripcion('DISPONIBLE');
    if (!idEstado) {
      console.error('❌ No se encontró el estado DISPONIBLE');
      return;
    }

    if (!formValues.fechaInicio || isNaN(new Date(formValues.fechaInicio).getTime())) {
      const toast = await this.toastCtrl.create({
        message: 'Selecciona una fecha válida',
        duration: 2000,
        color: 'danger',
        position: 'top',
      });
      await toast.present();
      return;
    }

    const evento: Evento = {
      id_creador: idUsuario,
      nombre_evento: formValues.nombre_evento,
      id_juego: formValues.id_juego,
      id_estado_evento: idEstado,
      lugar: formValues.lugar,
      descripcion: formValues.descripcion,
      fechaInicio: new Date(formValues.fechaInicio),
      cupos: formValues.cupos,
    };

    try {
      await this.eventoService.crearEvento(evento);

      // Crear notificación global
      await this.notificacionesService.crearNotificacion(
        'Ha creado un evento', // tipoAccion
        idUsuario,             // idUserHecho (usuario logeado)
        'global'               // idUserReceptor (id para notificaciones globales)
      );

      const toast = await this.toastCtrl.create({
        message: '✅ Evento creado exitosamente',
        duration: 2000,
        color: 'success',
        position: 'top',
      });
      await toast.present();
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('❌ Error al guardar el evento:', error);
      const toast = await this.toastCtrl.create({
        message: '❌ Error al guardar el evento',
        duration: 2000,
        color: 'danger',
        position: 'top',
      });
      await toast.present();
    }
  }

  modificarCupos(valor: number) {
    const actual = this.eventoForm.get('cupos')?.value || 2;
    const nuevo = Math.min(50, Math.max(2, actual + valor));
    this.eventoForm.get('cupos')?.setValue(nuevo);
  }

  onCuposChange(event: any) {
    let valor = parseInt(event.detail.value, 10);
    if (isNaN(valor)) valor = 2;
    const nuevo = Math.min(50, Math.max(2, valor));
    this.eventoForm.get('cupos')?.setValue(nuevo);
  }

  volverAtras() {
    this.navCtrl.back();
  }

  setFecha(valor: string) {
    if (valor) {
      this.eventoForm.get('fechaInicio')?.setValue(valor);
    }
  }
}
