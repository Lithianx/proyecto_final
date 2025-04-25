import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: false,
})
export class NavbarComponent  implements OnInit {

  rutaActual: string = '';
  constructor(private router: Router, private actionSheetCtrl: ActionSheetController) {
    this.router.events.subscribe(() => {
      this.rutaActual = this.router.url;
    });
  }

  ngOnInit() {}

  irTorneo() {
    this.router.navigate(['/perfil']);
  }
  irEvento() {
    this.router.navigate(['/perfil']);
  }
  irHome() {
    this.router.navigate(['/home']);
  }
  irChat() {
    this.router.navigate(['/lista-chat']);
  }

  mostrarMenu() {
    this.actionSheetCtrl.create({
      header: 'Opciones',
      buttons: [
        {
          text: 'Crear Publicación',
          icon: 'add-circle-outline',
          handler: () => {
            this.router.navigate(['/crear-publicacion']);
          }
        },
        {
          text: 'Crear Torneo',
          icon: 'trophy-outline',
          handler: () => {
            this.router.navigate(['/crear-torneo']);
          }
        },
        {
          text: 'Crear Evento',
          icon: 'flash-outline',
          handler: () => {
            this.router.navigate(['/crear-evento']);
          }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    }).then(actionSheet => actionSheet.present());
  }

}
