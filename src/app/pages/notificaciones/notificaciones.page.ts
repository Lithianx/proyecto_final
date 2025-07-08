import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { LocalStorageService } from 'src/app/services/local-storage-social.service';
import { NotificacionesService } from 'src/app/services/notificaciones.service';
import { Notificacion } from 'src/app/models/notificacion.model';

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.page.html',
  styleUrls: ['./notificaciones.page.scss'],
  standalone: false,
})
export class NotificacionesPage implements OnInit {

  idUsuarioLogeado: string = '';
  notificaciones: (Notificacion & {
    nombre_usuario?: string;
    fotoPerfil?: string;
  })[] = [];

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private localStorageService: LocalStorageService,
    private notificacionesService: NotificacionesService
  ) {}

  async ngOnInit() {
    const id = await this.localStorageService.getItem('id_usuario');

    if (typeof id === 'string') {
      this.idUsuarioLogeado = id;
      console.log('✅ ID del usuario logeado:', this.idUsuarioLogeado);

      await this.cargarNotificaciones();

    } else {
      console.warn('⚠️ No hay id_usuario válido en el localStorage');
    }
  }

async cargarNotificaciones() {
  try {
    // Cambiado a getNotificacionesConDatos para incluir globales
    const notis = await this.notificacionesService.getNotificacionesConDatos(this.idUsuarioLogeado);

    // orden y demás código queda igual...
    notis.sort((a, b) => {
      const fechaA = a.fecha ? (a.fecha.toDate ? a.fecha.toDate() : a.fecha) : new Date(0);
      const fechaB = b.fecha ? (b.fecha.toDate ? b.fecha.toDate() : b.fecha) : new Date(0);

      return fechaB.getTime() - fechaA.getTime();
    });

    this.notificaciones = notis;
    console.log('🔔 Notificaciones enriquecidas ordenadas:', this.notificaciones);

    await this.notificacionesService.marcarNotificacionesComoLeidas(this.idUsuarioLogeado);

  } catch (error) {
    console.error('❌ Error al cargar notificaciones enriquecidas:', error);
  }
}

  volver() {
    this.navCtrl.back();
  }

  obtenerTiempoRelativo(fecha: any): string {
  if (!fecha) return 'Fecha no disponible';

  let fechaObj: Date;

  // Si viene de Firestore Timestamp
  if (fecha.toDate && typeof fecha.toDate === 'function') {
    fechaObj = fecha.toDate();
  } else if (fecha instanceof Date) {
    fechaObj = fecha;
  } else {
    // En caso venga como string o número
    fechaObj = new Date(fecha);
  }

  if (isNaN(fechaObj.getTime())) {
    return 'Fecha inválida';
  }

  const ahora = Date.now();
  const diferencia = ahora - fechaObj.getTime();

  const minutos = Math.floor(diferencia / (1000 * 60));
  if (minutos < 1) return 'Justo ahora';
  if (minutos < 60) return `Hace ${minutos} min`;

  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `Hace ${horas} h`;

  const dias = Math.floor(horas / 24);
  return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
}

  verPerfil(id: string) {
    this.router.navigate(['/perfil-user', id]);
  }

}
