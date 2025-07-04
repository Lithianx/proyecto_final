import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController, AlertController, ToastController } from '@ionic/angular';
import { ChangeDetectorRef } from '@angular/core';
import { EventoService } from 'src/app/services/evento.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { doc, updateDoc, onSnapshot } from '@angular/fire/firestore';
import { Firestore } from '@angular/fire/firestore';
import { Participante } from 'src/app/models/participante.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sala-evento',
  templateUrl: './sala-evento.page.html',
  styleUrls: ['./sala-evento.page.scss'],
  standalone: false,
})
export class SalaEventoPage implements OnInit, OnDestroy {
  evento: any;
  jugadores: Participante[] = [];
  eventoId: string = '';
  chatAbierto = false;
  mensajes: any[] = [];
  nuevoMensaje: string = '';
  nuevosMensajesSinLeer: boolean = false;
  private mensajesSub!: Subscription;

  esParticipante = false;
  nuevoCupo: number = 0;
  mostrarPanelJugadores: boolean = false;
  mostrarPanelCupos: boolean = false;

  cargandoEvento = false;
  eventoEnCurso = false;
  tiempoTranscurrido = '00:00:00';
  private tiempoInicial = 0;
  private intervalId: any;

  usuarioActualNombre: string = '';
  usuarioActualID: string = '';
  esAnfitrion = false;
  private unsubscribeSnapshot: any;

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private cdr: ChangeDetectorRef,
    private toastCtrl: ToastController,
    private router: Router,
    private eventoService: EventoService,
    private firestore: Firestore,
    private usuarioService: UsuarioService
  ) { }

  async ngOnInit() {
    this.eventoId = this.route.snapshot.paramMap.get('id') ?? '';
    const usuario = await this.usuarioService.getUsuarioActualConectado();
    this.usuarioActualID = usuario?.id_usuario ?? '';
    this.usuarioActualNombre = usuario?.nombre_usuario ?? '';

    const eventoCompleto = await this.eventoService.obtenerEventoPorId(this.eventoId);
    this.evento = eventoCompleto;
    this.esAnfitrion = this.evento.id_creador === this.usuarioActualID;

    this.jugadores = await this.eventoService.obtenerParticipantesEvento(this.eventoId);
    this.ordenarJugadores();

    this.esParticipante = this.jugadores.some(p => p.id_usuario === this.usuarioActualID);
    this.nuevoCupo = this.evento.cupos;

    if (!this.esAnfitrion && !this.jugadores.some(p => p.id_usuario === this.usuarioActualID)) {
      await this.eventoService.registrarParticipante({
        id_usuario: this.usuarioActualID,
        id_evento: this.eventoId,
        id_participacion: '',
        estado_participante: 'ACTIVO',
        nombre_usuario: this.usuarioActualNombre
      });
    }

    this.suscribirseCambiosEvento();
    this.suscribirseAlChat();

  }

  private ordenarJugadores(): void {
    this.jugadores.sort((a, b) => {
      if (a.id_usuario === this.evento.id_creador) return -1;
      if (b.id_usuario === this.evento.id_creador) return 1;
      if (a.id_usuario === this.usuarioActualID) return -1;
      if (b.id_usuario === this.usuarioActualID) return 1;
      return a.nombre_usuario.localeCompare(b.nombre_usuario);
    });
  }


  suscribirseAlChat() {
    this.mensajesSub = this.eventoService
      .obtenerMensajesEvento(this.eventoId)
      .subscribe((msgs) => {
        this.mensajes = msgs;

        if (!this.chatAbierto) {
          this.nuevosMensajesSinLeer = true;
        }

        this.scrollChatAbajo();
      });
  }



  private suscribirseCambiosEvento() {
    const eventoRef = doc(this.firestore, 'Evento', this.eventoId);
    this.unsubscribeSnapshot = onSnapshot(eventoRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        data["fechaInicio"] = data["fechaInicio"]?.toDate?.() ?? null;
        data["timestampInicioEvento"] = data["timestampInicioEvento"]?.toDate?.() ?? null;

        this.evento = data;
        this.jugadores = await this.eventoService.obtenerParticipantesEvento(this.eventoId);
        this.ordenarJugadores();

        const estadoEnCursoID = await this.eventoService.obtenerIdEstadoPorDescripcion('EN CURSO');
        if (
          this.evento.id_estado_evento === estadoEnCursoID &&
          this.evento.timestampInicioEvento &&
          !this.eventoEnCurso
        ) {
          this.eventoEnCurso = true;
          this.tiempoInicial = new Date(this.evento.timestampInicioEvento).getTime();
          this.iniciarTemporizador();
        }

        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
    if (this.unsubscribeSnapshot) {
      this.unsubscribeSnapshot();
    }
    if (this.mensajesSub) {
      this.mensajesSub.unsubscribe();
    }
  }

  async unirmeComoParticipante() {
    if (!this.esParticipante && this.evento.cupos > 0) {
      // 1. Registrar participación
      await this.eventoService.registrarParticipante({
        id_usuario: this.usuarioActualID,
        id_evento: this.eventoId,
        id_participacion: '',
        estado_participante: 'ACTIVO',
        nombre_usuario: this.usuarioActualNombre
      });

      // 2. 🔔 Enviar mensaje al chat
      await this.eventoService.enviarMensajeEvento(this.eventoId, {
        texto: `${this.usuarioActualNombre} se ha unido al evento.`,
        tipo: 'union'
      });

      // 3. Actualizar cupo
      await updateDoc(doc(this.firestore, 'Evento', this.eventoId), {
        cupos: this.evento.cupos - 1
      });

      // 4. Refrescar jugadores
      this.jugadores = await this.eventoService.obtenerParticipantesEvento(this.eventoId);
      this.ordenarJugadores();
      this.esParticipante = true;

      // 5. Recalcular estado
      await this.eventoService.actualizarEstadoEvento(this.eventoId);
      this.cdr.detectChanges();
    }
  }

  async dejarDeParticipar() {
    await this.eventoService.eliminarParticipante(this.eventoId, this.usuarioActualID);

    // 🔔 Mensaje al chat: salida voluntaria
    await this.eventoService.enviarMensajeEvento(this.eventoId, {
      texto: `${this.usuarioActualNombre} ha salido del evento.`,
      tipo: 'sistema'
    });

    await updateDoc(doc(this.firestore, 'Evento', this.eventoId), {
      cupos: this.evento.cupos + 1
    });

    this.jugadores = await this.eventoService.obtenerParticipantesEvento(this.eventoId);
    this.ordenarJugadores();
    this.esParticipante = false;

    await this.eventoService.actualizarEstadoEvento(this.eventoId);
    this.cdr.detectChanges();
  }


  async expulsarJugador(jugadorId: string) {
    if (jugadorId === this.usuarioActualID) return;

    const jugadorExpulsado = this.jugadores.find(j => j.id_usuario === jugadorId);

    await this.eventoService.eliminarParticipante(this.eventoId, jugadorId);

    // 🔔 Mensaje al chat: expulsión
    if (jugadorExpulsado) {
      await this.eventoService.enviarMensajeEvento(this.eventoId, {
        texto: `${jugadorExpulsado.nombre_usuario} fue expulsado del evento.`,
        tipo: 'expulsion'
      });
    }

    await updateDoc(doc(this.firestore, 'Evento', this.eventoId), {
      cupos: this.evento.cupos + 1
    });

    this.jugadores = await this.eventoService.obtenerParticipantesEvento(this.eventoId);
    this.ordenarJugadores();
    await this.eventoService.actualizarEstadoEvento(this.eventoId);
    this.cdr.detectChanges();
  }


  async confirmarExpulsion(jugador: Participante) {
    const alerta = await this.alertCtrl.create({
      header: 'Expulsar jugador',
      message: `¿Estás seguro de expulsar a ${jugador.nombre_usuario}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Expulsar', handler: async () => await this.expulsarJugador(jugador.id_usuario) }
      ]
    });
    await alerta.present();
  }

  async actualizarCupos() {
    if (this.nuevoCupo >= this.jugadores.length) {
      await updateDoc(doc(this.firestore, 'Evento', this.eventoId), {
        cupos: this.nuevoCupo
      });
      this.evento.cupos = this.nuevoCupo;
      await this.eventoService.actualizarEstadoEvento(this.eventoId);
      const toast = await this.toastCtrl.create({
        message: 'Cupos actualizados ✅',
        duration: 2000,
        color: 'success',
        position: 'top',
      });
      await toast.present();
    } else {
      const toast = await this.toastCtrl.create({
        message: '❌ No puedes reducir los cupos por debajo de los participantes actuales.',
        duration: 3000,
        color: 'danger',
        position: 'top',
      });
      await toast.present();
    }
  }

  toggleChat() {
    this.chatAbierto = !this.chatAbierto;
    if (this.chatAbierto) {
      this.nuevosMensajesSinLeer = false;
    }
  }


  async enviarMensaje() {
    if (!this.nuevoMensaje.trim()) return;

    try {
      await this.eventoService.enviarMensajeEvento(this.eventoId, {
        texto: this.nuevoMensaje,
        id_usuario: this.usuarioActualID,
        nombre_usuario: this.usuarioActualNombre,
        tipo: 'mensaje'
      });
      this.nuevoMensaje = '';
    } catch (error) {
      const toast = await this.toastCtrl.create({
        message: '❌ Error al enviar mensaje',
        duration: 2000,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
    }
  }

  scrollChatAbajo() {
    setTimeout(() => {
      const chatCuerpo = document.querySelector('.chat-cuerpo');
      if (chatCuerpo) {
        chatCuerpo.scrollTop = chatCuerpo.scrollHeight;
      }
    }, 100);
  }


  async iniciarEvento() {
    if (!this.eventoEnCurso) {
      this.cargandoEvento = true;
      try {
        const estadoEnCursoID = await this.eventoService.obtenerIdEstadoPorDescripcion('EN CURSO');
        await updateDoc(doc(this.firestore, 'Evento', this.eventoId), {
          id_estado_evento: estadoEnCursoID,
          timestampInicioEvento: new Date()
        });
        this.eventoEnCurso = true;
        this.tiempoInicial = Date.now();
        this.iniciarTemporizador();
      } catch (error) {
        console.error('❌ Error al iniciar evento:', error);
      }
      this.cargandoEvento = false;
    } else {
      const alerta = await this.alertCtrl.create({
        header: 'Finalizar Evento',
        message: '¿Estás seguro que deseas finalizar este evento?',
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Finalizar',
            handler: async () => {
              this.cargandoEvento = true;
              await this.finalizarEvento();
              const toast = await this.toastCtrl.create({
                message: '✅ Evento finalizado correctamente',
                duration: 2000,
                position: 'top',
                color: 'success',
              });
              await toast.present();
              setTimeout(() => {
                this.cargandoEvento = false;
                this.navCtrl.navigateRoot('/home');
              }, 2000);
            },
          },
        ],
      });
      await alerta.present();
    }
  }

  iniciarTemporizador() {
    this.intervalId = setInterval(() => {
      const diff = Date.now() - this.tiempoInicial;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      this.tiempoTranscurrido = `${this.pad(h)}:${this.pad(m)}:${this.pad(s)}`;
      this.cdr.detectChanges();
    }, 1000);
  }

  async finalizarEvento() {
    this.eventoEnCurso = false;
    clearInterval(this.intervalId);
    this.tiempoTranscurrido = '00:00:00';

    if (this.esAnfitrion) {
      try {
        const estadoFinalizadoID = await this.eventoService.obtenerIdEstadoPorDescripcion('FINALIZADO');
        await updateDoc(doc(this.firestore, 'Evento', this.eventoId), {
          id_estado_evento: estadoFinalizadoID
        });
      } catch (error) {
        console.error('❌ Error al finalizar evento:', error);
      }
    }
  }

  pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  async confirmarSalida() {
    const alerta = await this.alertCtrl.create({
      header: '¿Salir del evento?',
      message: '¿Deseas salir del evento?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Salir',
          handler: async () => {
            try {
              await this.eventoService.eliminarParticipante(this.eventoId, this.usuarioActualID);
              await updateDoc(doc(this.firestore, 'Evento', this.eventoId), {
                cupos: (this.evento.cupos ?? 0) + 1
              });
              await this.eventoService.actualizarEstadoEvento(this.eventoId);
              const toast = await this.toastCtrl.create({
                message: 'Has salido del evento 👋',
                duration: 2000,
                color: 'warning',
                position: 'top',
              });
              await toast.present();
              await this.eventoService.enviarMensajeEvento(this.eventoId, {
                texto: `${this.usuarioActualNombre} ha salido del evento.`,
                tipo: 'sistema'
              });

              this.router.navigate(['/evento']);
            } catch (error) {
              const toast = await this.toastCtrl.create({
                message: 'Error al salir del evento',
                duration: 2000,
                color: 'danger',
                position: 'top',
              });
              await toast.present();
            }
          },
        },
      ],
    });
    await alerta.present();
  }

  doRefresh(event: any) {
    this.ngOnInit().then(() => event.target.complete());
  }
}
