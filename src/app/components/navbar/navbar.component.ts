import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/usuario.model';

const ADMIN_EMAILS = ['fi.gutierrez@duocuc.cl']; // <-- tus correos admin


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: false,
})
export class NavbarComponent  implements OnInit {
  usuarioActual: Usuario | null = null;
  rutaActual: string = '';
  constructor(
    private router: Router,
    private actionSheetCtrl: ActionSheetController,
    private usuarioService: UsuarioService
  ) {
    this.router.events.subscribe(() => {
      this.rutaActual = this.router.url;
    });
  }

  async ngOnInit() {
    this.usuarioActual = await this.usuarioService.getUsuarioActualConectado();
  }

  irBuscar() {
    this.router.navigate(['/buscar-persona']);
  }
  irEvento() {
    this.router.navigate(['/evento']);
  }
  irHome() {
    this.router.navigate(['/home']);
  }
  irChat() {
    this.router.navigate(['/lista-chat']);
  }

async mostrarMenu() {
  const esAdmin = this.usuarioActual && ADMIN_EMAILS.includes(this.usuarioActual.correo_electronico);

  const buttons = [
    {
      text: 'Crear Publicación',
      icon: 'add-circle-outline',
      handler: () => {
        this.router.navigate(['/crear-publicacion']);
      }
    },
    {
      text: 'Crear Evento',
      icon: 'flash-outline',
      handler: () => {
        this.router.navigate(['/crear-evento-flash']);
      }
    },
            {
          text: 'Ver Reportes',
          icon: 'code-slash-outline',
          handler: () => {
          this.router.navigate(['/admin-reporte']);
          }
       },
    {
      text: 'Cancelar',
      icon: 'close',
      role: 'cancel'
    }
  ];

  const actionSheet = await this.actionSheetCtrl.create({
    header: 'Opciones',
    cssClass: 'custom-action-sheet',
    buttons
  });
  await actionSheet.present();
}

}
