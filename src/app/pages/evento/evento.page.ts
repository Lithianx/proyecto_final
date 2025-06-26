import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Evento } from 'src/app/models/evento.model';
import { EventoService } from 'src/app/services/evento.service';

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
    private eventoService: EventoService
  ) { }

  ngOnInit() {
    this.cargarEventos();

    // Refrescar cada 10 segundos
    setInterval(() => {
      this.cargarEventos();
    }, 10000); // 10 segundos
  }

  cargarEventos() {
    this.eventoService.obtenerEventos().subscribe(async (eventos) => {
      const ahora = new Date();

      // Actualizar estado de cada evento antes de mostrar
      for (const evento of eventos) {
        await this.eventoService.actualizarEstadoEvento(evento.id);
      }

      // Volver a obtener los eventos ya con estado actualizado
      this.eventoService.obtenerEventos().subscribe((eventosActualizados) => {
        this.eventos = eventosActualizados;
        this.eventosFiltrados = eventosActualizados.filter((e) => {
          if (e.estado === 'FINALIZADO') {
            const horasPasadas = (ahora.getTime() - e.fechaFin.getTime()) / (1000 * 60 * 60);
            return horasPasadas < 24;
          }
          return true;
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
    this.router.navigate(['/detalle-evento', evento.id]);
  }
}