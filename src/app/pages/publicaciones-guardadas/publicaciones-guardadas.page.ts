import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-publicaciones-guardadas',
  templateUrl: './publicaciones-guardadas.page.html',
  styleUrls: ['./publicaciones-guardadas.page.scss'],
  standalone: false,
})
export class PublicacionesGuardadasPage implements OnInit {

  publicacionesGuardadas = [
    { img: 'https://raw.githubusercontent.com/R-CoderDotCom/samples/main/bird.png', alt: 'Publicación 1' },
    { img: 'https://ionicframework.com/docs/img/demos/card-media.png', alt: 'Publicación 2' },
    { img: 'https://raw.githubusercontent.com/R-CoderDotCom/samples/main/bird.png', alt: 'Publicación 3' },
    { img: 'https://ionicframework.com/docs/img/demos/card-media.png', alt: 'Publicación 4' },
    { img: 'https://raw.githubusercontent.com/R-CoderDotCom/samples/main/bird.png', alt: 'Publicación 5' },
    { img: 'https://ionicframework.com/docs/img/demos/card-media.png', alt: 'Publicación 6' }
  ];

  constructor(
    private alertController: AlertController,
    private router: Router
  ) {}

  ngOnInit() {}

  async confirmarEliminar(index: number, event: Event) {
    event.stopPropagation();

    // Evitar conflicto de foco al eliminar
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    const alert = await this.alertController.create({
      header: '¿Eliminar publicación?',
      message: '¿Deseas eliminar esta publicación de guardados?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.publicacionesGuardadas.splice(index, 1);
          }
        }
      ]
    });

    await alert.present();
  }

  irADetalles() {
    this.router.navigate(['/detalles-publicacion-personal']);
  }
}
