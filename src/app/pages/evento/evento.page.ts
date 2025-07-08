import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { EventoService } from 'src/app/services/evento.service';
import { LocalStorageEventoService } from 'src/app/services/local-storage-evento.service';
import { Evento } from 'src/app/models/evento.model';
import { Juego } from 'src/app/models/juego.model';
import { TipoJuego } from 'src/app/models/tipo-juego.model';
import { EstadoEvento } from 'src/app/models/estado-evento.model';

@Component({
  selector: 'app-evento',
  templateUrl: './evento.page.html',
  styleUrls: ['./evento.page.scss'],
  standalone: false,
})
export class EventoPage implements OnInit {
  eventos: any[] = [];
  eventosFiltrados: any[] = [];
  idUsuarioActual: string = '';
  datosCargados = false;

  juegos: Juego[] = [];
  tiposJuego: TipoJuego[] = [];
  estados: EstadoEvento[] = [];

  filtroTipoJuego: string = 'todos';
  textoBusqueda: string = '';


  constructor(
    private router: Router,
    private navCtrl: NavController,
    private eventoService: EventoService,
    private localStorageEventoService: LocalStorageEventoService
  ) { }

  async ngOnInit() {
    this.idUsuarioActual = await this.localStorageEventoService.getItem<string>('id_usuario') ?? '';
    await this.cargarReferencias();
    await this.cargarEventos();
    this.datosCargados = true;
  }

  async cargarReferencias() {
    this.juegos = await new Promise<Juego[]>((resolve) =>
      this.eventoService.getJuegos().subscribe(resolve)
    );

    this.tiposJuego = await new Promise<TipoJuego[]>((resolve) =>
      this.eventoService.getTiposJuego().subscribe(resolve)
    );

    this.estados = await new Promise<EstadoEvento[]>((resolve) =>
      this.eventoService.getEstadosEvento().subscribe(resolve)
    );
  }


  async cargarEventos() {
    this.eventoService.obtenerEventos().subscribe(async (eventos) => {
      const eventosMapeados = [];

      for (const evento of eventos) {
        await this.eventoService.actualizarEstadoEvento(evento.id);

        const juego = this.juegos.find(j => j.id_juego === evento.id_juego);
        const tipo = this.tiposJuego.find(t => t.id_tipo_juego === juego?.id_tipo_juego);
        const estado = this.estados.find(e => e.id_estado_evento === evento.id_estado_evento);

        // Obtener nombre del creador usando el nuevo método del servicio
        const creadorNombre = await this.eventoService.obtenerNombreUsuarioPorId(evento.id_creador);

        eventosMapeados.push({
          ...evento,
          nombre_juego: juego?.nombre_juego ?? 'Juego desconocido',
          tipo_juego: tipo?.nombre_tipo_juego ?? 'Tipo desconocido',
          estado_evento: estado?.descripcion ?? 'Estado desconocido',
          creador_nombre: creadorNombre
        });
      }

      // ❌ Excluir eventos finalizados
      const eventosSinFinalizados = eventosMapeados.filter(e => e.estado_evento !== 'FINALIZADO');

      this.eventos = eventosSinFinalizados;
      this.eventosFiltrados = [...eventosSinFinalizados];

    });
  }

  async doRefresh(event: any) {
    setTimeout(async () => {
      await this.cargarEventos();
      event.target.complete();
    }, 1500);
  }


  volverAtras() {
    this.navCtrl.back();
  }

  filtrarEventos(event: any) {
    this.textoBusqueda = event.target.value?.toLowerCase().trim() || '';
    this.aplicarFiltros();
  }
  aplicarFiltros() {
    this.eventosFiltrados = this.eventos.filter((evento) => {
      const coincideTexto =
        evento.nombre_juego?.toLowerCase()?.includes(this.textoBusqueda) ||
        evento.lugar?.toLowerCase()?.includes(this.textoBusqueda) ||
        evento.tipo_juego?.toLowerCase()?.includes(this.textoBusqueda) ||
        evento.creador_nombre?.toLowerCase()?.includes(this.textoBusqueda);

      const coincideTipo =
        this.filtroTipoJuego === 'todos' || evento.tipo_juego === this.filtroTipoJuego;

      return coincideTexto && coincideTipo;
    });
  }


  irADetalleEvento(evento: Evento & { id: string }) {
    if (String(evento.id_creador) === String(this.idUsuarioActual)) {
      this.router.navigate(['/sala-evento', evento.id]);
    } else {
      this.router.navigate(['/detalle-evento', evento.id]);
    }
  }
}
