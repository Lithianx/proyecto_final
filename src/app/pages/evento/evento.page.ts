import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Evento } from 'src/app/models/evento.model';
import { EventoService } from 'src/app/services/evento.service';
import { LocalStorageEventoService } from 'src/app/services/local-storage-evento.service';

@Component({
  selector: 'app-evento',
  templateUrl: './evento.page.html',
  styleUrls: ['./evento.page.scss'],
  standalone: false,
})
export class EventoPage implements OnInit {

  eventos: Evento[] = [];
  eventosFiltrados: Evento[] = [];

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private eventoService: EventoService,
    private localStorageEventoService: LocalStorageEventoService
  ) { }


  idUsuarioActual: string = '';
  public datosCargados = false;

  ngOnInit() {
    this.localStorageEventoService.getItem<string>('id_usuario').then(id => {
      this.idUsuarioActual = id ?? '';
      this.cargarEventos().then(() => {
        this.datosCargados = true; // ⬅️ ya están listos los datos para mostrar
      });
    });
  }


  // Refrescar cada 10 segundos
  /* setInterval(() => {
    this.cargarEventos();
  }, 10000); */

  async cargarEventos(): Promise<void> {
    return new Promise((resolve) => {
      this.eventoService.obtenerEventos().subscribe(async (eventos) => {
        const ahora = new Date();

        for (const evento of eventos) {
          await this.eventoService.actualizarEstadoEvento(evento.id);
        }

        this.eventoService.obtenerEventos().subscribe((eventosActualizados) => {
          this.eventos = eventosActualizados;
          this.eventosFiltrados = eventosActualizados.filter((e) => {
            if (e.estado === 'FINALIZADO') {
              const horasPasadas = (ahora.getTime() - e.fechaFin.getTime()) / (1000 * 60 * 60);
              return horasPasadas < 24;
            }
            return true;
          });
          resolve(); // ⬅️ resolver cuando se cargue todo
        });
      });
    });
  }

  doRefresh(event: any) {
    this.cargarEventos();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  volverAtras() {
    this.navCtrl.back();
  }

  filtrarEventos(event: any) {
    const texto = event.target.value?.toLowerCase().trim();

    if (!texto) {
      this.eventosFiltrados = [...this.eventos];
      return;
    }

    this.eventosFiltrados = this.eventos.filter(evento =>
      evento.nombre_evento.toLowerCase().includes(texto) ||
      evento.lugar.toLowerCase().includes(texto) ||
      evento.tipo_evento.toLowerCase().includes(texto)
    );
  }

  irADetalleEvento(evento: Evento) {
    if (String(evento.id_creador) === String(this.idUsuarioActual)) {
      console.log('🎯 Es el anfitrión, redirigiendo a sala');
      this.router.navigate(['/sala-evento', evento.id]);
    } else {
      console.log('👤 No es anfitrión, redirigiendo a detalle');
      this.router.navigate(['/detalle-evento', evento.id]);
    }
  }

}