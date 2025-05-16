import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-perfil-user',
  templateUrl: './perfil-user.page.html',
  styleUrls: ['./perfil-user.page.scss'],
  standalone: false,
})
export class PerfilUserPage implements OnInit {
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
  siguiendo: boolean = false; // Nuevo estado para seguir/dejar de seguir

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

  // Cambia entre seguir y dejar de seguir
  toggleSeguir() {
    this.siguiendo = !this.siguiendo;
    console.log(this.siguiendo ? 'Ahora sigues al usuario' : 'Has dejado de seguir al usuario');
  }
}
