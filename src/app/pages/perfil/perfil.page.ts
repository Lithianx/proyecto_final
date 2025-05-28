import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: false,
})
export class PerfilPage implements OnInit {

  private _vistaSeleccionada: string = 'publicaciones';

  get vistaSeleccionada(): string {
    return this._vistaSeleccionada;
  }

  set vistaSeleccionada(value: string) {
    this._vistaSeleccionada = value;

    // Cierra el modal si se cambia a otra vista que no sea publicaciones
    if (value !== 'publicaciones') {
      this.mostrarModal = false;
    }
  }

  mostrarModal: boolean = false;

  constructor() {}

  ngOnInit() {}

  abrirModal() {
    console.log('Se abrió el modal');
    this.mostrarModal = true;
  }

  cerrarModal(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.mostrarModal = false;
  }
}

