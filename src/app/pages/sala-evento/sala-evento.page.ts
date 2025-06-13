import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, ToastController } from '@ionic/angular';
import { ChangeDetectorRef } from '@angular/core';
import { EventoService } from 'src/app/services/evento.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { doc, getDoc, updateDoc, arrayUnion } from '@angular/fire/firestore';
import { Firestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-sala-evento',
  templateUrl: './sala-evento.page.html',
  styleUrls: ['./sala-evento.page.scss'],
  standalone: false,
})
export class SalaEventoPage implements OnInit {
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

  usuarioActual: string = ''; // <- importante para validar quién puede iniciar

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
  ) {}

  async ngOnInit() {
    this.eventoId = this.route.snapshot.paramMap.get('id') ?? '';
    const docRef = doc(this.firestore, 'eventos', this.eventoId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      this.evento = docSnap.data();
      this.evento.id = this.eventoId;

      // Cargar lista de jugadores si existe
      this.jugadores = this.evento.jugadores || [];

      const currentUser = await this.usuarioService.getUsuarioActualConectado();

      if (currentUser && currentUser.nombre_usuario) {
        this.usuarioActual = currentUser.nombre_usuario;

        // Si no es el creador, lo agregamos como jugador
        if (this.usuarioActual !== this.evento.usuario) {
          if (!this.jugadores.includes(this.usuarioActual)) {
            this.jugadores.push(this.usuarioActual);
            await updateDoc(docRef, {
              jugadores: arrayUnion(this.usuarioActual),
            });
          }
        } else {
          // Si es el creador y no está en la lista, lo añadimos
          if (!this.jugadores.includes(this.usuarioActual)) {
            this.jugadores.push(this.usuarioActual);
          }
        }
      }
    }
  }

  toggleChat() {
    this.chatAbierto = !this.chatAbierto;
  }

  enviarMensaje() {
    if (this.mensaje.trim()) {
      this.mensajes.push({ usuario: 'Tú', texto: this.mensaje });

      setTimeout(() => {
        this.mensajes.push({ usuario: 'Carlos', texto: 'Entendido!' });
      }, 1000);

      this.mensaje = '';
    }
  }

  async iniciarEvento() {
    if (!this.eventoEnCurso) {
      this.cargandoEvento = true;

      setTimeout(() => {
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
              this.finalizarEvento();
              const toast = await this.toastCtrl.create({
                message: '✅ Evento finalizado',
                duration: 2000,
                position: 'bottom',
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

  finalizarEvento() {
    this.eventoEnCurso = false;
    clearInterval(this.intervalId);
    this.tiempoTranscurrido = '00:00:00';
  }

  pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  async confirmarSalida() {
    const alert = await this.alertController.create({
      header: 'Confirmar salida',
      message: '¿Estás seguro que quieres salir del evento?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Sí, salir',
          handler: () => {
            this.router.navigate(['/home']);
          },
        },
      ],
    });
    await alert.present();
  }
}
