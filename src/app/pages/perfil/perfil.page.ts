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

  ngOnInit() {
    // Inicializamos el deslizador con el valor por defecto
    this.segmentChanged({ detail: { value: this.vistaSeleccionada } });
  }

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

  // Función para mover el deslizador animado según la opción seleccionada
segmentChanged(event: any) {
  const value = event.detail.value;
  const segmentElement = document.querySelector('.publicaciones-nav') as HTMLElement;

  let position = 0; // valor para translateX en %

  switch (value) {
    case 'publicaciones':
      position = 5;
      break;
    case 'eventos-inscritos':
      position = 340 / 3; // ~33.33%
      break;
    case 'eventos-creados':
      position = (330 / 3) * 2; // ~66.66%
      break;
  }

  // Ajusta la posición para que se mueva correctamente con margen:
  // Como el ancho del deslizador es un poco menor, puede que necesites mover un poco menos.
  // Puedes probar restando un pequeño % para que quede centrado en el botón:
  const adjustedPosition = position - 1; // ajustar valor si es necesario

  segmentElement.style.setProperty('--slider-transform', `translateX(${adjustedPosition}%)`);
}

}
