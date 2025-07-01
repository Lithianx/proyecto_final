import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController, AlertController, ToastController } from '@ionic/angular';
import { ChangeDetectorRef } from '@angular/core';
import { EventoService } from 'src/app/services/evento.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { doc, updateDoc, onSnapshot } from '@angular/fire/firestore';
import { Firestore } from '@angular/fire/firestore';
import { Participante } from 'src/app/models/participante.model';

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
  mensaje = '';
  mensajes: { usuario: string; texto: string }[] = [];

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
  ) {}

  async ngOnInit() {
    this.eventoId = this.route.snapshot.paramMap.get('id') ?? '';
    const usuario = await this.usuarioService.getUsuarioActualConectado();
    this.usuarioActualID = usuario?.id_usuario ?? '';
    this.usuarioActualNombre = usuario?.nombre_usuario ?? '';

    const eventoCompleto = await this.eventoService.obtenerEventoPorId(this.eventoId);
    this.evento = eventoCompleto;
    this.esAnfitrion = this.evento.id_creador === this.usuarioActualID;

    this.jugadores = await this.eventoService.obtenerParticipantesEvento(this.eventoId);

    if (!this.esAnfitrion && !this.jugadores.some(p => p.id_usuario === this.usuarioActualID)) {
      await this.eventoService.registrarParticipante({
        id_usuario: this.usuarioActualID,
        id_evento: this.eventoId,
        id_participacion: '', // Se autogenera en Firestore
        estado_participante: 'ACTIVO', // O el valor por defecto que corresponda
      });
    }

    this.suscribirseCambiosEvento();
  }

  private suscribirseCambiosEvento() {
    const eventoRef = doc(this.firestore, 'Evento', this.eventoId);
    this.unsubscribeSnapshot = onSnapshot(eventoRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        data["fechaInicio"] = data["fechaInicio"]?.toDate?.() ?? null;
        this.evento = data;

        this.jugadores = await this.eventoService.obtenerParticipantesEvento(this.eventoId);
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
    if (this.unsubscribeSnapshot) {
      this.unsubscribeSnapshot();
    }
  }

  toggleChat() {
    this.chatAbierto = !this.chatAbierto;
  }

  enviarMensaje() {
    if (this.mensaje.trim()) {
      this.mensajes.push({ usuario: this.usuarioActualNombre, texto: this.mensaje });
      this.mensaje = '';
    }
  }

  async iniciarEvento() {
    if (!this.eventoEnCurso) {
      this.cargandoEvento = true;
      await updateDoc(doc(this.firestore, 'Evento', this.eventoId), {
        estado: 'EN CURSO',
      });

      this.cargandoEvento = false;
      this.eventoEnCurso = true;
      this.tiempoInicial = Date.now();
      this.iniciarTemporizador();
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
        await updateDoc(doc(this.firestore, 'Evento', this.eventoId), {
          estado: 'FINALIZADO',
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
              const nuevosParticipantes = this.jugadores.filter(p => p.id_usuario !== this.usuarioActualID);
              await this.eventoService.eliminarParticipante(this.eventoId, this.usuarioActualID);
              await updateDoc(doc(this.firestore, 'Evento', this.eventoId), {
                cupos: (this.evento.cupos ?? 0) + 1
              });

              const toast = await this.toastCtrl.create({
                message: 'Has salido del evento 👋',
                duration: 2000,
                color: 'warning',
                position: 'top',
              });
              await toast.present();

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
