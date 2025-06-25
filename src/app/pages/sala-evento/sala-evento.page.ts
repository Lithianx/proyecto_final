import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController, AlertController, ToastController } from '@ionic/angular';
import { ChangeDetectorRef } from '@angular/core';
import { EventoService } from 'src/app/services/evento.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import {
  doc,
  updateDoc,
  arrayUnion,
  deleteDoc,
  onSnapshot
} from '@angular/fire/firestore';
import { Firestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-sala-evento',
  templateUrl: './sala-evento.page.html',
  styleUrls: ['./sala-evento.page.scss'],
  standalone: false,
})
export class SalaEventoPage implements OnInit, OnDestroy {
  evento: any;
  jugadores: any[] = [];
  eventoId: string = '';
  chatAbierto = false;
  mensaje = '';
  mensajes: { usuario: string; texto: string }[] = [];

  cargandoEvento = false;
  eventoEnCurso = false;
  tiempoTranscurrido = '00:00:00';
  private tiempoInicial = 0;
  private intervalId: any;

  usuarioActual: string = '';
  private unsubscribeSnapshot: any;

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private alertController: AlertController,
    private cdr: ChangeDetectorRef,
    private toastCtrl: ToastController,
    private router: Router,
    private eventoService: EventoService,
    private firestore: Firestore,
    private usuarioService: UsuarioService
  ) { }

  async ngOnInit() {
    this.eventoId = this.route.snapshot.paramMap.get('id') ?? '';
    const currentUser = await this.usuarioService.getUsuarioActualConectado();
    this.usuarioActual = currentUser?.nombre_usuario ?? '';

    const eventoRef = doc(this.firestore, 'eventos', this.eventoId);

    // 📡 Escuchar cambios en tiempo real
    this.unsubscribeSnapshot = onSnapshot(eventoRef, async (snapshot) => {
      if (snapshot.exists()) {
        const eventoData = snapshot.data();

        // ✅ Convertir fechas a tipo Date para el date pipe
        eventoData["fechaInicio"] = eventoData["fechaInicio"]?.toDate?.() ?? null;
        eventoData["fechaFin"] = eventoData["fechaFin"]?.toDate?.() ?? null;

        this.evento = eventoData;
        await this.eventoService.actualizarEstadoEvento(this.eventoId);


        // ✅ Actualizar lista de jugadores
        this.jugadores = (eventoData["jugadores"] || []).map((nombre: string) => ({ nombre }));

        // ✅ Agregar usuario si no está registrado aún
        const yaRegistrado = eventoData["jugadores"]?.includes(this.usuarioActual);
        const eventoFinalizado = eventoData["estado"] === 'FINALIZADO';

        if (!yaRegistrado && !eventoFinalizado) {
          await updateDoc(eventoRef, {
            jugadores: arrayUnion(this.usuarioActual),
          });
        }
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
      this.mensajes.push({ usuario: this.usuarioActual, texto: this.mensaje });
      this.mensaje = '';
    }
  }

  async iniciarEvento() {
    if (!this.eventoEnCurso) {
      this.cargandoEvento = true;

      const eventoRef = doc(this.firestore, 'eventos', this.eventoId);

      // ⏱️ Iniciar temporizador y actualizar estado
      setTimeout(async () => {
        try {
          await updateDoc(eventoRef, { estado: 'EN_CURSO' });
          console.log('🟡 Estado actualizado a EN_CURSO');
        } catch (error) {
          console.error('❌ Error al actualizar estado a EN_CURSO:', error);
        }

        this.cargandoEvento = false;
        this.eventoEnCurso = true;
        this.tiempoInicial = Date.now();
        this.iniciarTemporizador();
      }, 2000);
    } else {
      const alerta = await this.alertController.create({
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
      const ahora = Date.now();
      const diff = ahora - this.tiempoInicial;
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

    if (this.usuarioActual === this.evento.creado_por) {
      try {
        const eventoRef = doc(this.firestore, 'eventos', this.eventoId);
        await updateDoc(eventoRef, {
          estado: 'FINALIZADO'
        });
        console.log('✅ Evento marcado como FINALIZADO');
      } catch (error) {
        console.error('❌ Error al eliminar el evento:', error);
      }
    }
  }

  pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  async confirmarSalida() {
    const alert = await this.alertController.create({
      header: 'Confirmar salida',
      message: '¿Estás seguro que quieres salir del evento?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Sí, salir',
          handler: async () => {
            try {
              const eventoRef = doc(this.firestore, 'eventos', this.eventoId);
              const eventoData = this.evento;

              const jugadoresActualizados = eventoData.jugadores.filter((j: string) => j !== this.usuarioActual);
              const nuevosCupos = (eventoData.cupos || 0) + 1;

              await updateDoc(eventoRef, {
                jugadores: jugadoresActualizados,
                cupos: nuevosCupos,
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

    await alert.present();
  }

  doRefresh(event: any) {
    this.ngOnInit().then(() => event.target.complete());
  }

  filtrarEventos(event: any) {
    // lógica futura
  }
}
