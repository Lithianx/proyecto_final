import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { EventoService } from 'src/app/services/evento.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { LocalStorageEventoService } from 'src/app/services/local-storage-evento.service';
import { Evento } from 'src/app/models/evento.model';
import { firstValueFrom } from 'rxjs';

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
  yaInscrito = false;
  puedeUnirse = false;

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private router: Router,
    private eventoService: EventoService,
    private toastCtrl: ToastController,
    private usuarioService: UsuarioService,
    private localStorageEventoService: LocalStorageEventoService
  ) { }

  async ngOnInit() {
    console.log('🔍 Iniciando detalle del evento...');
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      console.error('❌ No se proporcionó ID de evento');
      return;
    }

    try {
      // Cargar evento
      const evento = await this.eventoService.obtenerEventoPorId(id);
      this.evento = evento;
      console.log('🧪 id_estado_evento actual:', this.evento.id_estado_evento);

      // Obtener juegos y estados
      const juegos = await firstValueFrom(this.eventoService.getJuegos());
      const estados = await firstValueFrom(this.eventoService.getEstadosEvento());
      console.log('✅ Estados obtenidos:', estados);

      this.nombreJuego = String(juegos.find(j => j.id_juego === evento.id_juego)?.nombre_juego ?? 'Juego desconocido');
      console.log('📋 ID estado del evento:', evento.id_estado_evento);
      console.log('📋 Estados disponibles:', estados);
      this.nombreEstado = estados.find(e => e.id_estado_evento === evento.id_estado_evento)?.descripcion ?? 'Estado desconocido';
      console.log('🔍 ID de estado recibido en evento:', evento.id_estado_evento);
      console.log('📋 Estados disponibles:', estados.map(e => e.id_estado_evento));
      console.log('💬 Estado del evento:', this.nombreEstado);

      // Usuario actual
      const usuario = await this.usuarioService.getUsuarioActualConectado();
      if (!usuario) {
        console.error('❌ Usuario no autenticado');
        return;
      }

      const idUsuario = usuario.id_usuario;
      const soyCreador = evento.id_creador === idUsuario;
      console.log('👤 Usuario:', idUsuario, '| ¿Es creador?', soyCreador);

      await this.localStorageEventoService.guardarDatosEvento({
        id: evento.id,
        nombre_evento: evento.nombre_evento,
        id_creador: evento.id_creador,
        es_anfitrion: soyCreador,
      });

      const finalizadoID = estados.find(e => e.descripcion === 'FINALIZADO')?.id_estado_evento;
      const enCursoID = estados.find(e => e.descripcion === 'EN CURSO')?.id_estado_evento;
      const sinCuposID = estados.find(e => e.descripcion === 'SIN CUPOS')?.id_estado_evento;
      const disponibleID = estados.find(e => e.descripcion === 'DISPONIBLE')?.id_estado_evento;

      console.log('🧪 ID estado actual:', this.evento.id_estado_evento);
      console.log('🧪 FINALIZADO ID:', finalizadoID);
      console.log('🧪 EN CURSO ID:', enCursoID);
      console.log('🧪 SIN CUPOS ID:', sinCuposID);
      console.log('🧪 DISPONIBLE ID:', disponibleID);

      // Evaluar disponibilidad
      const eventoNoDisponible = [finalizadoID, enCursoID, sinCuposID].includes(this.evento.id_estado_evento);
      const eventoDisponible = !eventoNoDisponible;



      // Verificar si ya está inscrito
      const participantes = await this.eventoService.obtenerParticipantesEvento(evento.id);
      this.yaInscrito = participantes.some(p => p.id_usuario === idUsuario);
      console.log('👥 Participantes:', participantes.map(p => p.id_usuario));
      console.log('🧍‍♂️ ¿Ya inscrito?', this.yaInscrito);

      // Evaluar si puede unirse
      this.puedeUnirse = eventoDisponible && !this.yaInscrito;
      console.log('✅ ¿Puede unirse?', this.puedeUnirse);

      // Mensajes
      if (this.yaInscrito) {
        this.mostrarToast('Ya estás inscrito en este evento 👍', 'warning');
      } else if (!eventoDisponible) {
        this.mostrarToast('Este evento no está disponible para unirse', 'danger');
      }

    } catch (error) {
      console.error('❌ Error al cargar evento:', error);
      const toast = await this.toastCtrl.create({
        message: 'Error al cargar evento',
        duration: 2000,
        color: 'danger',
        position: 'top',
      });
      await toast.present();
      this.volverAtras();
    }

    console.log('🎯 Evaluación final - puedeUnirse:', this.puedeUnirse);
    console.log('🎯 yaInscrito:', this.yaInscrito);
    console.log('🎯 id_estado_evento:', this.evento.id_estado_evento);
  }

  async unirseAlEvento() {
    try {
      const usuario = await this.usuarioService.getUsuarioActualConectado();
      if (!usuario) throw new Error('Usuario no autenticado');

      await this.eventoService.tomarEvento(this.evento.id);

      await this.eventoService.registrarParticipante({
        id_evento: this.evento.id,
        id_usuario: usuario.id_usuario,
        estado_participante: 'INSCRITO',
        nombre_usuario: usuario.nombre_usuario,
      });

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
