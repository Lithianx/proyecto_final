import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { EventoService } from 'src/app/services/evento.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { LocalStorageEventoService } from 'src/app/services/local-storage-evento.service';
import { Evento } from 'src/app/models/evento.model';
import { firstValueFrom } from 'rxjs';
import { NotificacionesService } from 'src/app/services/notificaciones.service';
import { LocalStorageService } from '../../services/local-storage-social.service';
import { LoadingController } from '@ionic/angular';


@Component({
  selector: 'app-detalle-evento',
  templateUrl: './detalle-evento.page.html',
  styleUrls: ['./detalle-evento.page.scss'],
  standalone: false,
})
export class DetalleEventoPage implements OnInit {
  evento!: Evento & { id: string };
  nombreJuego = '';
  nombreEstado = '';
  creadorNombre = '';
  yaInscrito = false;
  puedeUnirse = false;

  cargandoUnirse: boolean = false;


  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private router: Router,
    private eventoService: EventoService,
    private toastCtrl: ToastController,
    private usuarioService: UsuarioService,
    private localStorageEventoService: LocalStorageEventoService,
    private notificacionesService: NotificacionesService,
    private localStorageService: LocalStorageService,
    private loadingCtrl: LoadingController,


  ) { }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    try {
      // 1. Obtener evento
      const eventoBase = await this.eventoService.obtenerEventoPorId(id);
      this.evento = eventoBase;

      // 2. Obtener creador
      this.creadorNombre = await this.eventoService.obtenerNombreUsuarioPorId(eventoBase.id_creador);

      // 3. Juegos y estados
      const juegos = await firstValueFrom(this.eventoService.getJuegos());
      const estados = await firstValueFrom(this.eventoService.getEstadosEvento());

      const nombreJuegoValue = juegos.find(j => j.id_juego === eventoBase.id_juego)?.nombre_juego ?? 'Juego desconocido';
      this.nombreJuego = typeof nombreJuegoValue === 'string' ? nombreJuegoValue : String(nombreJuegoValue);
      this.nombreEstado = estados.find(e => e.id_estado_evento === eventoBase.id_estado_evento)?.descripcion ?? 'Estado desconocido';

      // 4. Usuario actual y si es creador
      const usuario = await this.usuarioService.getUsuarioActualConectado();
      if (!usuario) return;

      const idUsuario = usuario.id_usuario;
      const soyCreador = eventoBase.id_creador === idUsuario;

      await this.localStorageEventoService.guardarDatosEvento({
        id: eventoBase.id,
        nombre_evento: eventoBase.nombre_evento,
        id_creador: eventoBase.id_creador,
        es_anfitrion: soyCreador,
      });

      // 5. Evaluar estado actual
      const finalizadoID = estados.find(e => e.descripcion === 'FINALIZADO')?.id_estado_evento;
      const enCursoID = estados.find(e => e.descripcion === 'EN CURSO')?.id_estado_evento;
      const sinCuposID = estados.find(e => e.descripcion === 'SIN CUPOS')?.id_estado_evento;

      const eventoNoDisponible = [finalizadoID, enCursoID, sinCuposID].includes(this.evento.id_estado_evento);
      const eventoDisponible = !eventoNoDisponible;

      // 6. Verificar si ya está inscrito
      const participantes = await this.eventoService.obtenerParticipantesEvento(eventoBase.id);
      this.yaInscrito = participantes.some(p => p.id_usuario === idUsuario);

      // 7. Evaluar si puede unirse
      this.puedeUnirse = eventoDisponible && !this.yaInscrito;

      // 8. Mostrar mensajes
      if (this.yaInscrito) {
        this.mostrarToast('Ya estás inscrito en este evento 👍', 'warning');
      } else if (!eventoDisponible) {
        this.mostrarToast('Este evento no está disponible para unirse', 'danger');
      }

    } catch (error) {
      const toast = await this.toastCtrl.create({
        message: 'Error al cargar evento',
        duration: 2000,
        color: 'danger',
        position: 'top',
      });
      await toast.present();
      this.volverAtras();
    }
  }

  async unirseAlEvento() {
    this.cargandoUnirse = true;
    const loading = await this.loadingCtrl.create({
      message: 'Uniéndote al evento...',
      spinner: 'dots',
      cssClass: 'custom-loading',
      backdropDismiss: false
    });
    await loading.present();

    try {
      const idUsuario: string | null = await this.localStorageService.getItem('id_usuario');
      if (!idUsuario) throw new Error('No se encontró el ID del usuario logueado');

      const usuario = await this.usuarioService.getUsuarioActualConectado();
      if (!usuario) throw new Error('Usuario no autenticado');

      // ✅ Verificar si ya está en otro evento no finalizado
      const eventoEnConflicto = await this.eventoService.obtenerEventoActivoDelUsuario(idUsuario);

      if (eventoEnConflicto && eventoEnConflicto.id !== this.evento.id) {
        const alerta = await this.toastCtrl.create({
          message: `❌ Ya estás inscrito en el evento "${eventoEnConflicto.nombre_evento}". Sal de ese evento para unirte a otro.`,
          duration: 3500,
          color: 'warning',
          position: 'top'
        });
        await alerta.present();
        return;
      }

      // ✅ Unirse normalmente
      await this.eventoService.tomarEvento(this.evento.id);

      await this.eventoService.registrarParticipante({
        id_evento: this.evento.id,
        id_usuario: idUsuario,
        estado_participante: 'INSCRITO',
        nombre_usuario: usuario.nombre_usuario,
      });

      await this.eventoService.actualizarEstadoEvento(this.evento.id);

      await this.notificacionesService.crearNotificacion(
        'Se ha unido a tu evento',
        idUsuario,
        this.evento.id_creador,
        this.evento.id
      );

      const toast = await this.toastCtrl.create({
        message: 'Te has unido al evento con éxito 🎉',
        duration: 2000,
        color: 'success',
        position: 'top',
      });
      await toast.present();

      this.router.navigate(['/sala-evento', this.evento.id]);

    } catch (error) {
      const toast = await this.toastCtrl.create({
        message: 'Error al unirse al evento. ' + (error as any).message,
        duration: 2500,
        color: 'danger',
        position: 'top',
      });
      await toast.present();
    } finally {
      this.cargandoUnirse = false;
      await loading.dismiss();
    }
  }



  async mostrarToast(mensaje: string, color: 'success' | 'warning' | 'danger') {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2500,
      color,
      position: 'top',
    });
    await toast.present();
  }

  volverAtras() {
    this.navCtrl.back();
  }
}
