import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
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
  idUsuarioLogeado: string | null = null;

  constructor(
    private router: Router,
    private actionSheetCtrl: ActionSheetController,
    private notificacionesService: NotificacionesService,
    private localStorageService: LocalStorageService
  ) {
    // Escuchar eventos de navegación para actualizar el estado
    this.router.events.subscribe(async (event) => {
      if (event instanceof NavigationEnd) {
        this.rutaActual = event.urlAfterRedirects;

        // Cargar idUsuario si no está cargado aún
        if (!this.idUsuarioLogeado) {
          this.idUsuarioLogeado = await this.localStorageService.getItem('id_usuario');
        }

        if (this.idUsuarioLogeado) {
          this.hayNotificacionesSinLeer = await this.notificacionesService.hayNotificacionesSinLeer(this.idUsuarioLogeado);
        } else {
          this.hayNotificacionesSinLeer = false;
        }
      }
    });
  }

  async ngOnInit() {
    this.idUsuarioLogeado = await this.localStorageService.getItem('id_usuario');
    if (this.idUsuarioLogeado) {
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
