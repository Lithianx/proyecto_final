import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventoService } from 'src/app/services/evento.service';
import { Participante } from 'src/app/models/participante.model';
import { Evento } from 'src/app/models/evento.model';

interface ParticipanteExtendido extends Participante {
  avatar?: string;
}


@Component({
  selector: 'app-evento-finalizado',
  templateUrl: './evento-finalizado.page.html',
  styleUrls: ['./evento-finalizado.page.scss'],
  standalone: false
})
export class EventoFinalizadoPage implements OnInit {
  eventoId: string = '';
  evento!: Evento & { id: string, nombre_juego?: string, creador_nombre?: string };
  participantes: ParticipanteExtendido[] = [];


  duracion: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventoService: EventoService
  ) {}

  async ngOnInit() {
    this.eventoId = this.route.snapshot.paramMap.get('id')!;

    try {
      // 🔄 Cargar evento desde Firestore
      this.evento = await this.eventoService.obtenerEventoPorId(this.eventoId);

      // 🔍 Obtener nombre del creador
      const nombreCreador = await this.eventoService.obtenerNombreUsuarioPorId(this.evento.id_creador);
      this.evento.creador_nombre = nombreCreador;

      // 👥 Cargar participantes
      this.participantes = await this.eventoService.obtenerParticipantesEvento(this.eventoId);

      // 🕒 Duración del evento
      let inicio: Date | undefined;
      let fin: Date | undefined;

      if (this.evento.timestampInicioEvento instanceof Date) {
        inicio = this.evento.timestampInicioEvento;
      } else if (this.evento.timestampInicioEvento && typeof (this.evento.timestampInicioEvento as any).toDate === 'function') {
        inicio = (this.evento.timestampInicioEvento as any).toDate();
      }

      if (this.evento.timestampFinalizacionEvento instanceof Date) {
        fin = this.evento.timestampFinalizacionEvento;
      } else if (this.evento.timestampFinalizacionEvento && typeof (this.evento.timestampFinalizacionEvento as any).toDate === 'function') {
        fin = (this.evento.timestampFinalizacionEvento as any).toDate();
      }

      console.log('⏱️ Inicio:', inicio);
      console.log('⏱️ Final:', fin);

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
    this.router.navigate(['/crear-evento']);
  }
}
