import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventoService } from 'src/app/services/evento.service';
import { Participante } from 'src/app/models/participante.model';
import { Evento } from 'src/app/models/evento.model';

@Component({
  selector: 'app-evento-finalizado',
  templateUrl: './evento-finalizado.page.html',
  styleUrls: ['./evento-finalizado.page.scss'],
  standalone: false
})
export class EventoFinalizadoPage implements OnInit {
  eventoId: string = '';
  evento!: Evento & { id: string, nombre_juego?: string };
  participantes: Participante[] = [];
  duracion: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventoService: EventoService
  ) {}

  async ngOnInit() {
    // Obtener ID del evento desde la URL
    this.eventoId = this.route.snapshot.paramMap.get('id')!;

    // Obtener el evento desde Firestore
    try {
      this.evento = await this.eventoService.obtenerEventoPorId(this.eventoId);

      // Participantes del evento
      this.participantes = await this.eventoService.obtenerParticipantesEvento(this.eventoId);

      // Duración del evento (si hay timestamps disponibles)
      const inicio = (this.evento.timestampInicioEvento && typeof (this.evento.timestampInicioEvento as any).toDate === 'function')
        ? (this.evento.timestampInicioEvento as any).toDate()
        : this.evento.timestampInicioEvento;
      const fin = (this.evento.timestampFinalizacionEvento && typeof (this.evento.timestampFinalizacionEvento as any).toDate === 'function')
        ? (this.evento.timestampFinalizacionEvento as any).toDate()
        : (this.evento.timestampFinalizacionEvento ?? new Date());

      if (inicio && fin) {
        const ms = fin.getTime() - inicio.getTime();
        this.duracion = this.formatearDuracion(ms);
      } else {
        this.duracion = 'No disponible';
      }
    } catch (error) {
      console.error('❌ Error al cargar evento finalizado:', error);
    }
  }

  formatearDuracion(ms: number): string {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${this.pad(h)}h ${this.pad(m)}min ${this.pad(s)}s`;
  }

  pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  volverHome() {
    this.router.navigate(['/home']);
  }

  crearEvento() {
    this.router.navigate(['/crear-evento-flash']);
  }
}
