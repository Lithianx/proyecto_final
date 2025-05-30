import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-historial-eventos',
  templateUrl: './historial-eventos.page.html',
  styleUrls: ['./historial-eventos.page.scss'],
  standalone: false,
})
export class HistorialEventosPage implements OnInit {
  // Listas originales
  eventosinscritos_finaliazado = [
    {
      id: 1,
      nombre: 'Campeonato de LoL',
      fecha: '12/05/2025',
      juego: 'League of Legends',
      creador: 'usuario1',
    },
    {
      id: 2,
      nombre: 'Torneo Valorant',
      fecha: '19/05/2025',
      juego: 'Valorant',
      creador: 'usuario2',
    },
  ];

  eventosCreados_finaliazado = [
    {
      id: 1,
      nombre: 'Campeonato de LoL',
      fecha: '12/05/2025',
      juego: 'League of Legends',
    },
    {
      id: 2,
      nombre: 'Torneo Valorant',
      fecha: '19/05/2025',
      juego: 'Valorant',
    },
  ];

  mostrarModal: boolean = false;

  private _vistaSeleccionada: string = 'eventos-inscritos';

  searchTerm: string = '';

  constructor() {}

  ngOnInit() {
    this.segmentChanged({ detail: { value: this.vistaSeleccionada } });
  }

  get vistaSeleccionada(): string {
    return this._vistaSeleccionada;
  }

  set vistaSeleccionada(value: string) {
    this._vistaSeleccionada = value;
    if (value !== 'eventos-inscritos') {
      this.mostrarModal = false;
    }
  }

  segmentChanged(event: any) {
    const value = event.detail.value;
    const segmentElement = document.querySelector('.publicaciones-nav') as HTMLElement;

    let position = 0;

    switch (value) {
      case 'eventos-inscritos':
        position = 5;
        break;
      case 'eventos-creados':
        position = 105;
        break;
      default:
        position = 5;
        break;
    }

    const adjustedPosition = position - 1;

    if (segmentElement) {
      segmentElement.style.setProperty('--slider-transform', `translateX(${adjustedPosition}%)`);
    }
  }

  // Filtro para eventos inscritos
  get eventosInscritosFiltrados() {
    if (!this.searchTerm) {
      return this.eventosinscritos_finaliazado;
    }
    const term = this.searchTerm.toLowerCase();
    return this.eventosinscritos_finaliazado.filter(evento =>
      evento.nombre.toLowerCase().includes(term)
    );
  }

  // Filtro para eventos creados
  get eventosCreadosFiltrados() {
    if (!this.searchTerm) {
      return this.eventosCreados_finaliazado;
    }
    const term = this.searchTerm.toLowerCase();
    return this.eventosCreados_finaliazado.filter(evento =>
      evento.nombre.toLowerCase().includes(term)
    );
  }

  // Método para actualizar el filtro cuando cambie el valor del searchbar
  onSearchChange(event: any) {
    this.searchTerm = event.detail.value;
  }
}
