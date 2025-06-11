import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { ChangeDetectorRef } from '@angular/core';
import { ToastController } from '@ionic/angular';


@Component({
  selector: 'app-sala-evento',
  templateUrl: './sala-evento.page.html',
  styleUrls: ['./sala-evento.page.scss'],
  standalone: false,
})
export class SalaEventoPage implements OnInit {

  evento: any;
  jugadores: string[] = ['Tú', 'Carlos', 'Ana', 'Juan', 'Esteban', 'Pepe', 'Kanguru', 'Lucho', 'Marta', 'Sofia'];

  eventos = [
    { id: 1, nombre: 'Torneo de LoL', lugar: 'Sala 1', hora: '18:00', usuario: 'PEPEX' },
    { id: 2, nombre: 'Among Us IRL', lugar: 'Patio central', hora: '16:00', usuario: 'CARLOS' },
    { id: 3, nombre: 'Tetris Battle', lugar: 'Sala 3', hora: '19:30', usuario: 'JUAN' },
    { id: 4, nombre: 'Torneo de DOTA', lugar: 'Sala 1', hora: '18:00', usuario: 'ESTEBAN666' },
    { id: 5, nombre: 'Torneo de POKEMON', lugar: 'Sala 1', hora: '18:00', usuario: 'KANGURUU' },
    { id: 6, nombre: 'UNO', lugar: 'Sala 2', hora: '18:00', usuario: 'PEPEX' },
  ];

  constructor(private route: ActivatedRoute,
    private navCtrl: NavController,
    private alertController: AlertController,
    private cdr: ChangeDetectorRef,
    private toastCtrl: ToastController,
    private router: Router
  ) { }

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.evento = this.eventos.find(e => e.id === id);
  }


  chatAbierto: boolean = false;
  mensaje: string = '';
  mensajes: { usuario: string, texto: string }[] = [];

  toggleChat() {
    this.chatAbierto = !this.chatAbierto;
  }

  enviarMensaje() {
    if (this.mensaje.trim()) {
      this.mensajes.push({ usuario: 'Tú', texto: this.mensaje });

      // Simula respuesta
      setTimeout(() => {
        this.mensajes.push({ usuario: 'Carlos', texto: 'oki uwu' });
      }, 1000);

      this.mensaje = '';
    }
  }

  cargandoEvento: boolean = false;
  eventoEnCurso: boolean = false;
  tiempoTranscurrido: string = '00:00:00';
  private tiempoInicial: number = 0;
  private intervalId: any;

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
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Finalizar',
          handler: async () => {
            this.cargandoEvento = true;
            this.finalizarEvento();

            // Mostrar el toast
            const toast = await this.toastCtrl.create({
              message: '✅ saliste del evento', 
              duration: 2000,
              position: 'bottom',
              color: 'success',
              animated: true
            });
            await toast.present();

            // Redirigir después de mostrar el toast
            setTimeout(() => {
              this.cargandoEvento = false;
              this.navCtrl.navigateRoot('/home');
            }, 2000); // esperar lo mismo que dura el toast
          }
        }
      ]
    });

    await alerta.present();
  }
}

  iniciarTemporizador() {
  this.intervalId = setInterval(() => {
    const ahora = Date.now();
    const diferencia = ahora - this.tiempoInicial;

    const horas = Math.floor(diferencia / 3600000);
    const minutos = Math.floor((diferencia % 3600000) / 60000);
    const segundos = Math.floor((diferencia % 60000) / 1000);

    this.tiempoTranscurrido =
      `${this.pad(horas)}:${this.pad(minutos)}:${this.pad(segundos)}`;

    this.cdr.detectChanges(); // 👈 fuerza actualización de vista
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



  async mostrarToastFinalizado() {
  const toast = await this.toastCtrl.create({
    message: '✅ Evento finalizado con éxito',
    duration: 2000,
    position: 'bottom',
    color: 'success',
    animated: true
  });

  await toast.present();
}

async confirmarSalida() {
  const alert = await this.alertController.create({
    header: 'Confirmar salida',
    message: '¿Estás seguro que quieres salir del evento?',
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel',
        cssClass: 'secondary'
      },
      {
        text: 'Sí, salir',
        handler: () => {
          this.router.navigate(['/home']);
        }
      }
    ]
  });

  await alert.present();
}



}