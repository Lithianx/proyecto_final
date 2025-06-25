import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Evento } from 'src/app/models/evento.model';
import { EventoService } from 'src/app/services/evento.service';
import { getAuth } from 'firebase/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { LocalStorageService } from 'src/app/services/local-storage-social.service'; // ✅ Importar correctamente

interface UsuarioFirestore {
  nombre_usuario: string;
  [key: string]: any;
}

@Component({
  selector: 'app-crear-evento-flash',
  templateUrl: './crear-evento-flash.page.html',
  styleUrls: ['./crear-evento-flash.page.scss'],
  standalone: false,
})
export class CrearEventoFlashPage implements OnInit {
  eventoForm!: FormGroup;
  fechaMinima: string = new Date().toISOString();

  constructor(
    private fb: FormBuilder,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private router: Router,
    private eventoService: EventoService,
    private firestore: Firestore,
    private localStorageService: LocalStorageService // ✅ Usar servicio correcto
  ) {}

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
    if (!this.eventoForm.valid) {
      const toast = await this.toastCtrl.create({
        message: 'Por favor completa todos los campos',
        duration: 2000,
        color: 'danger',
        position: 'bottom',
      });
      await toast.present();
      return;
    }

    const formValues = this.eventoForm.value;

    // 🔐 Obtener ID del usuario desde el servicio de Local Storage
    const idUsuario = await this.localStorageService.getItem<string>('id_usuario');
    if (!idUsuario || typeof idUsuario !== 'string') {
      console.warn('⚠️ id_usuario no encontrado en LocalStorageService');
      return;
    }

    // 🔍 Obtener nombre del usuario desde Firestore
    const auth = getAuth();
    const user = auth.currentUser;

    let nombreUsuario = 'desconocido';
    if (user) {
      try {
        const docRef = doc(this.firestore, 'Usuario', user.uid);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          const data = snapshot.data() as UsuarioFirestore;
          nombreUsuario = data.nombre_usuario || 'sin nombre';
          console.log('[DEBUG] Nombre obtenido:', nombreUsuario);
        } else {
          console.warn('⚠️ Documento del usuario no encontrado en Firestore');
        }
      } catch (error) {
        console.error('⚠️ Error al obtener el nombre del usuario:', error);
      }
    }

    const datos: Evento = {
      id_creador: idUsuario,
      tipo_evento: formValues.tipo_evento,
      nombre_evento: formValues.nombre_evento,
      lugar: formValues.lugar,
      descripcion: formValues.descripcion,
      fechaInicio: new Date(formValues.fecha_inicio),
      fechaFin: new Date(formValues.fecha_termino),
      cupos: formValues.cupos,
      creado_por: nombreUsuario,
      estado: 'DISPONIBLE'
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
      setTimeout(() => this.router.navigate(['/home']), 2000);
    } catch (error) {
      console.error('❌ Error al guardar en Firestore', error);
      const toast = await this.toastCtrl.create({
        message: 'Error al guardar el evento',
        duration: 2000,
        color: 'danger',
        position: 'bottom',
      });
      await toast.present();
    }
  }

  modificarCupos(valor: number) {
    const actual = this.eventoForm.get('cupos')?.value || 1;
    const nuevo = Math.min(22, Math.max(1, actual + valor));
    this.eventoForm.get('cupos')?.setValue(nuevo);
  }

  volverAtras() {
    this.navCtrl.back();
  }
}
