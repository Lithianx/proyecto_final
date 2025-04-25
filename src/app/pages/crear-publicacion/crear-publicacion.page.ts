import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-crear-publicacion',
  templateUrl: './crear-publicacion.page.html',
  styleUrls: ['./crear-publicacion.page.scss'],
  standalone: false,
})
export class CrearPublicacionPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

    usuario = 'Juan Pérez';
  contenido: string = '';

  publicar() {
    console.log('Publicación:', this.contenido);
    // Aquí puedes enviar el contenido a tu backend o Firebase
    this.contenido = ''; // Limpia el campo
  }

}
