import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { EventoService } from 'src/app/services/evento.service';
import { LocalStorageService } from '../../services/local-storage-social.service';
import { firstValueFrom } from 'rxjs';

// Define una interfaz mínima para Evento
interface Evento {
  id: string;
  nombre_evento?: string;
  estado_evento?: string;
  nombre_juego?: string;
  lugar?: string;
  fechaInicio?: Date | string;
  cupos?: number;
  creador_nombre?: string;
  // agrega más campos según necesites
}

@Component({
  selector: 'app-historial-eventos',
  templateUrl: './historial-eventos.page.html',
  styleUrls: ['./historial-eventos.page.scss'],
  standalone: false,
})
export class HistorialEventosPage implements OnInit {

  @ViewChild('publicacionesNav', { read: ElementRef }) publicacionesNav!: ElementRef;

  eventosinscritos_finaliazado = [ /* ... */ ]; // igual que antes
  eventosCreados_finaliazado = [ /* ... */ ]; // igual que antes

  mostrarModal: boolean = false;
  searchTerm: string = '';
  private _vistaSeleccionada: string = 'eventos-inscritos';
  eventosCreadosDesdeFirebase: Evento[] = [];

  constructor(
    private eventoService: EventoService,
    private localStorageService: LocalStorageService,
    private router: Router
  ) {}

ngOnInit() {
  this.segmentChanged({ detail: { value: this.vistaSeleccionada } });
  // No llamar cargarDatosUsuario() aquí
}

async ionViewWillEnter() {
  await this.cargarDatosUsuario();
}

private async cargarDatosUsuario() {
  try {
    const id_usuario: string | null = await this.localStorageService.getItem('id_usuario');
    if (!id_usuario) {
      console.warn('No hay id_usuario en localStorage');
      return;
    }

    // Cargar eventos creados finalizados
    await this.cargarEventosCreadosFinalizados(id_usuario);

    // Cargar eventos inscritos finalizados
    await this.cargarEventosInscritos(id_usuario);

  } catch (error) {
    console.error('Error obteniendo id_usuario desde localStorage', error);
  }
}

  // Nuevo método para cargar solo eventos creados finalizados con datos completos
  async cargarEventosCreadosFinalizados(idUsuario: string) {
    try {
      const eventos = await this.eventoService.obtenerEventosPorCreador(idUsuario);
      const juegos = await firstValueFrom(this.eventoService.getJuegos());
      const estados = await firstValueFrom(this.eventoService.getEstadosEvento());

      const idEstadoFinalizado = estados.find(e => e.descripcion === 'FINALIZADO')?.id_estado_evento;
      if (!idEstadoFinalizado) {
        console.warn('No se encontró estado FINALIZADO');
        this.eventosCreadosDesdeFirebase = [];
        return;
      }

      const eventosFinalizadosMapeados = [];

      for (const evento of eventos) {
        if (evento.id_estado_evento !== idEstadoFinalizado) continue;

        const juego = juegos.find(j => j.id_juego === evento.id_juego);
        const estado = estados.find(e => e.id_estado_evento === evento.id_estado_evento);
        const creadorNombre = await this.eventoService.obtenerNombreUsuarioPorId(evento.id_creador);

        eventosFinalizadosMapeados.push({
          ...evento,
          nombre_juego: juego?.nombre_juego ?? 'Juego desconocido',
          estado_evento: estado?.descripcion ?? 'Estado desconocido',
          creador_nombre: creadorNombre
        });
      }

      this.eventosCreadosDesdeFirebase = eventosFinalizadosMapeados;

      console.log('Eventos creados finalizados cargados:', this.eventosCreadosDesdeFirebase);

    } catch (error) {
      console.error('Error al cargar eventos creados finalizados:', error);
      this.eventosCreadosDesdeFirebase = [];
    }
  }

  ionViewDidEnter() {
    this.applySliderTransform(this.vistaSeleccionada);
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
    this.vistaSeleccionada = value;
    this.applySliderTransform(value);
  }

  applySliderTransform(value: string) {
    const segmentElement = this.publicacionesNav?.nativeElement as HTMLElement;
    if (!segmentElement) {
      console.warn('Elemento publicacionesNav no encontrado');
      return;
    }
    let position = 0;
    switch (value) {
      case 'eventos-inscritos':
        position = 3;
        break;
      case 'eventos-creados':
        position = 320 / 3;
        break;
      default:
        position = 3;
    }
    const adjustedPosition = position - 1;
    segmentElement.style.setProperty('--slider-transform', `translateX(${adjustedPosition}%)`);
  }

  onSearchChange(event: any) {
    this.searchTerm = event.detail.value;
  }

  get eventosInscritosFiltrados() {
    if (!this.searchTerm) {
      return this.eventosinscritos_finaliazado;
    }
    const term = this.searchTerm.toLowerCase();
    return this.eventosinscritos_finaliazado.filter(evento =>
      evento.nombre.toLowerCase().includes(term)
    );
  }

  get eventosCreadosFiltrados() {
    const base = this.eventosCreadosDesdeFirebase.length > 0
      ? this.eventosCreadosDesdeFirebase
      : this.eventosCreados_finaliazado;

    if (!this.searchTerm) {
      return base;
    }
    const term = this.searchTerm.toLowerCase();
    return base.filter(evento =>
      evento.nombre_evento?.toLowerCase().includes(term) || 
      evento.nombre?.toLowerCase().includes(term)
    );
  }

  async cargarEventosCreados(idUsuario: string) {
    try {
      const eventos = await this.eventoService.obtenerEventosPorCreadorYEstado(idUsuario);
      console.log('🔥 Eventos recibidos desde Firebase:');
      console.table(eventos);
      this.eventosCreadosDesdeFirebase = eventos;
    } catch (error) {
      console.error('❌ Error cargando eventos creados:', error);
    }
  }

  irASalaEvento(evento: Evento) {
    this.router.navigate(['/evento-finalizado', evento.id]);
  }

private async cargarEventosInscritos(idUsuario: string) {
  try {
    const eventos = await this.eventoService.obtenerEventosDesdeParticipacionesUsuario(idUsuario);

    // Obtenemos para cada evento el nombre del creador y armamos el nuevo array
    const eventosConNombreCreador = await Promise.all(
      eventos.map(async (evento) => {
        const creadorNombre = await this.eventoService.obtenerNombreUsuarioPorId(evento.id_creador || '');
        return {
          ...evento,
          creador_nombre: creadorNombre || 'Desconocido'
        };
      })
    );

    this.eventosinscritos_finaliazado = eventosConNombreCreador;

    console.log(`✅ Eventos inscritos finalizados recibidos: ${eventos.length}`);
    console.table(this.eventosinscritos_finaliazado);

  } catch (error) {
    console.error('❌ Error cargando eventos inscritos finalizados:', error);
    this.eventosinscritos_finaliazado = [];
  }
}


}
