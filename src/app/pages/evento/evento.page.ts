import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { EventoService } from 'src/app/services/evento.service';
import { LocalStorageEventoService } from 'src/app/services/local-storage-evento.service';
import { CacheService } from 'src/app/services/cache.service';
import { Evento } from 'src/app/models/evento.model';
import { Juego } from 'src/app/models/juego.model';
import { TipoJuego } from 'src/app/models/tipo-juego.model';
import { EstadoEvento } from 'src/app/models/estado-evento.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-evento',
  templateUrl: './evento.page.html',
  styleUrls: ['./evento.page.scss'],
  standalone: false,
})
export class EventoPage implements OnInit, OnDestroy {
  eventos: any[] = [];
  eventosFiltrados: any[] = [];
  idUsuarioActual: string = '';
  datosCargados = false;

  juegos: Juego[] = [];
  tiposJuego: TipoJuego[] = [];
  estados: EstadoEvento[] = [];

  filtroTipoJuego: string = 'todos';
  textoBusqueda: string = '';

  // 🔄 Manejo de suscripciones
  private eventosSubscription?: Subscription;
  private juegosSubs?: Subscription;
  private tiposSubs?: Subscription;
  private estadosSubs?: Subscription;

  // 🔄 Detectar si estamos en producción
  get isProduction(): boolean {
    return document.location.hostname !== 'localhost' && 
           document.location.hostname !== '127.0.0.1' &&
           !document.location.hostname.includes('192.168');
  }


  constructor(
    private router: Router,
    private navCtrl: NavController,
    private eventoService: EventoService,
    private localStorageEventoService: LocalStorageEventoService,
    private cacheService: CacheService
  ) { }

  async ngOnInit() {
    this.idUsuarioActual = await this.localStorageEventoService.getItem<string>('id_usuario') ?? '';
    
    // 🔄 Escuchar eventos de invalidación de cache
    window.addEventListener('cache-invalidated', () => {
      console.log('🔄 Cache invalidado - recargando eventos');
      this.recargarDatos();
    });

    await this.cargarReferencias();
    await this.cargarEventos();
    this.datosCargados = true;
  }

  ngOnDestroy() {
    // 🔄 Limpiar todas las suscripciones para evitar memory leaks
    if (this.eventosSubscription) {
      this.eventosSubscription.unsubscribe();
    }
    if (this.juegosSubs) {
      this.juegosSubs.unsubscribe();
    }
    if (this.tiposSubs) {
      this.tiposSubs.unsubscribe();
    }
    if (this.estadosSubs) {
      this.estadosSubs.unsubscribe();
    }
  }

  ionViewWillEnter() {
    // 🔄 Recargar datos cada vez que se entra a la página
    console.log('🔄 ionViewWillEnter - recargando eventos');
    this.cargarEventos();
  }

  async recargarDatos() {
    // 🔄 Método para recargar todos los datos
    console.log('🔄 Recargando todos los datos...');
    this.datosCargados = false;
    
    // Invalidar cache del servicio de eventos
    this.eventoService.invalidarCache();
    
    await this.cargarReferencias();
    await this.cargarEventos();
    this.datosCargados = true;
  }

  async cargarReferencias() {
    try {
      // 🔄 Limpiar suscripciones anteriores antes de crear nuevas
      if (this.juegosSubs) this.juegosSubs.unsubscribe();
      if (this.tiposSubs) this.tiposSubs.unsubscribe();
      if (this.estadosSubs) this.estadosSubs.unsubscribe();

      this.juegos = await new Promise<Juego[]>((resolve) => {
        this.juegosSubs = this.eventoService.getJuegos().subscribe(resolve);
      });

      this.tiposJuego = await new Promise<TipoJuego[]>((resolve) => {
        this.tiposSubs = this.eventoService.getTiposJuego().subscribe(resolve);
      });

      this.estados = await new Promise<EstadoEvento[]>((resolve) => {
        this.estadosSubs = this.eventoService.getEstadosEvento().subscribe(resolve);
      });
    } catch (error) {
      console.error('❌ Error cargando referencias:', error);
    }
  }


  async cargarEventos() {
    try {
      // 🔄 Limpiar suscripción anterior si existe
      if (this.eventosSubscription) {
        this.eventosSubscription.unsubscribe();
      }

      // 🔄 Crear nueva suscripción
      this.eventosSubscription = this.eventoService.obtenerEventos().subscribe(async (eventos) => {
        console.log('🔄 Recibiendo eventos desde Firebase:', eventos.length);
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
        
        console.log('✅ Eventos cargados y filtrados:', this.eventos.length);
      });
    } catch (error) {
      console.error('❌ Error cargando eventos:', error);
    }
  }

  async doRefresh(event: any) {
    console.log('🔄 Refrescando eventos...');
    try {
      // 🔄 Forzar recarga de referencias y eventos
      await this.recargarDatos();
      console.log('✅ Eventos refrescados correctamente');
    } catch (error) {
      console.error('❌ Error al refrescar eventos:', error);
    } finally {
      setTimeout(() => {
        event.target.complete();
      }, 1500);
    }
  }

  // 🔄 Método para invalidar cache manualmente (desarrollo)
  invalidarCache() {
    console.log('🔄 Invalidando cache manualmente...');
    this.cacheService.forceReload();
    this.recargarDatos();
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
