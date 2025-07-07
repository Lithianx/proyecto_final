import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router'; // <== IMPORTANTE
import { ActionSheetController } from '@ionic/angular';
import { NotificacionesService } from 'src/app/services/notificaciones.service';
import { LocalStorageService } from 'src/app/services/local-storage-social.service';

@Component({
  selector: 'app-encabezado',
  templateUrl: './encabezado.component.html',
  styleUrls: ['./encabezado.component.scss'],
  standalone: false,
})
export class EncabezadoComponent implements OnInit {
  rutaActual: string = '';
  hayNotificacionesSinLeer: boolean = false;
  idUsuarioLogeado: string = '';

  constructor(
    private router: Router,
    private actionSheetCtrl: ActionSheetController,
    private notificacionesService: NotificacionesService,
    private localStorageService: LocalStorageService
  ) {
    // ✅ Escuchar eventos de navegación para actualizar el estado
    this.router.events.subscribe(async (event) => {
      if (event instanceof NavigationEnd) {
        this.rutaActual = event.urlAfterRedirects;

        // Solo actualizamos si ya tenemos el ID
        if (this.idUsuarioLogeado) {
          this.hayNotificacionesSinLeer = await this.notificacionesService.hayNotificacionesSinLeer(this.idUsuarioLogeado);
        }
      }
    });
  }

  async ngOnInit() {
    const id = await this.localStorageService.getItem('id_usuario');

    if (typeof id === 'string') {
      this.idUsuarioLogeado = id;
      console.log('✅ ID del usuario logeado:', this.idUsuarioLogeado);

      // ✅ Carga inicial de notificaciones
      this.hayNotificacionesSinLeer = await this.notificacionesService.hayNotificacionesSinLeer(this.idUsuarioLogeado);

    } else {
      console.warn('⚠️ No hay id_usuario válido en el localStorage');
    }
  }

  irEvento() {
    this.router.navigate(['/perfil']);
  }

  irNotificaciones() {
    this.router.navigate(['/notificaciones']);
  }
}
