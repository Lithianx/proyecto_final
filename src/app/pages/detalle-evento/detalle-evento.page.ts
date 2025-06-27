import { Component, OnInit, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, GestureController, ToastController } from '@ionic/angular';
import { EventoService } from 'src/app/services/evento.service';
import { Evento } from 'src/app/models/evento.model';
import { UsuarioService } from 'src/app/services/usuario.service';
import { LocalStorageEventoService } from 'src/app/services/local-storage-evento.service';

@Component({
  selector: 'app-detalle-evento',
  templateUrl: './detalle-evento.page.html',
  styleUrls: ['./detalle-evento.page.scss'],
  standalone: false,
})
export class DetalleEventoPage implements OnInit, AfterViewChecked {
  @ViewChild('swipeArea', { read: ElementRef }) swipeArea!: ElementRef;
  @ViewChild('swipeThumb', { read: ElementRef }) swipeThumb!: ElementRef;
  @ViewChild('swipeFill', { read: ElementRef }) swipeFill!: ElementRef;
  @ViewChild('swipeText', { read: ElementRef }) swipeText!: ElementRef;

  evento!: Evento & { id: string };
  usuarioEmailActual: string = '';
  public gestureEjecutado = false;
  private swipeInicializado = false;
  public mostrarSwipe: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private gestureCtrl: GestureController,
    private router: Router,
    private eventoService: EventoService,
    private toastCtrl: ToastController,
    private usuarioService: UsuarioService,
    private localStorageEventoService: LocalStorageEventoService
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      try {
        const eventoObtenido = await this.eventoService.obtenerEventoPorId(id);
        this.evento = eventoObtenido;

        const usuario = await this.usuarioService.getUsuarioActualConectado();
        this.usuarioEmailActual = usuario?.correo_electronico ?? '';

        const soyCreador = this.evento.id_creador === usuario?.id_usuario;

        if (soyCreador) {
          await this.localStorageEventoService.guardarDatosEvento({
            id: this.evento.id,
            nombre_evento: this.evento.nombre_evento,
            id_creador: this.evento.id_creador,
            jugadores: this.evento.jugadores || [],
            es_anfitrion: true
          });

          const toast = await this.toastCtrl.create({
            message: 'Eres el anfitrión de este evento 👑',
            duration: 1500,
            position: 'top',
            color: 'success',
          });
          await toast.present();

          setTimeout(() => {
            this.router.navigate(['/sala-evento', this.evento.id]);
          }, 1600);
          return;
        }

        // Validaciones por estado
        if (this.evento.estado === 'FINALIZADO') {
          this.gestureEjecutado = true;
          this.mostrarToast('Este evento ya finalizó ⛔️', 'danger');
          return;
        }

        if (this.evento.estado === 'EN CURSO') {
          this.gestureEjecutado = true;
          this.mostrarToast('Este evento ya está en curso 🚫', 'warning');
          return;
        }

        if (this.evento.estado === 'SIN CUPOS') {
          this.gestureEjecutado = true;
          this.mostrarToast('Este evento ya está lleno 🚫', 'danger');
          return;
        }

        if (this.evento.jugadores?.includes(this.usuarioEmailActual)) {
          this.gestureEjecutado = true;
          this.mostrarToast('Ya estás inscrito en este evento 👍', 'warning');
          return;
        }

        if (this.evento.cupos <= 0) {
          this.gestureEjecutado = true;
          this.mostrarToast('No hay cupos disponibles ❌', 'danger');
          return;
        }

        this.mostrarSwipe = true;
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
    }
  }

  ngAfterViewChecked() {
    if (
      this.evento &&
      !this.swipeInicializado &&
      this.swipeThumb &&
      this.swipeThumb.nativeElement
    ) {
      this.swipeInicializado = true;
      setTimeout(() => this.inicializarSwipe(), 50);
    }
  }

  inicializarSwipe() {
    const thumb = this.swipeThumb?.nativeElement;
    const track = this.swipeArea?.nativeElement;
    const fill = this.swipeFill?.nativeElement;
    const text = this.swipeText?.nativeElement;

    if (!thumb || !track || !fill || !text) {
      console.warn('⚠️ Elementos de swipe no encontrados');
      return;
    }

    const maxX = track.offsetWidth - thumb.offsetWidth;

    const gesture = this.gestureCtrl.create({
      el: thumb,
      gestureName: 'slide-button',
      threshold: 0,
      onMove: (ev) => {
        const delta = Math.max(0, Math.min(ev.deltaX, maxX));
        const progress = (delta / maxX) * 100;

        thumb.style.transform = `translateX(${delta}px)`;
        fill.style.width = `${progress}%`;
        text.textContent = progress > 90 ? '¡Listo!' : 'Desliza para tomar evento';

        if (delta >= maxX && !this.gestureEjecutado) {
          this.gestureEjecutado = true;
          gesture.destroy();
          this.unirseAlEvento();
        }
      },
      onEnd: () => {
        if (!this.gestureEjecutado) {
          thumb.style.transition = 'transform 0.3s ease-out';
          fill.style.transition = 'width 0.3s ease-out';
          text.textContent = 'Desliza para tomar evento';
          thumb.style.transform = 'translateX(0px)';
          fill.style.width = '0%';

          setTimeout(() => {
            thumb.style.transition = '';
            fill.style.transition = '';
          }, 300);
        }
      },
    });

    gesture.enable();
  }

  async unirseAlEvento() {
    try {
      await this.eventoService.tomarEvento(this.evento.id);
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
        message: 'Error: No se pudo unir al evento. ' + (error as any).message,
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
