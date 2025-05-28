import { Component, OnInit } from '@angular/core';

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

  constructor() { }

  ngOnInit() { }

}
