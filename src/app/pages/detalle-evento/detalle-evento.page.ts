import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, GestureController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { EventoService } from 'src/app/services/evento.service';
import { Evento } from 'src/app/models/evento.model';

@Component({
  selector: 'app-detalle-evento',
  templateUrl: './detalle-evento.page.html',
  styleUrls: ['./detalle-evento.page.scss'],
  standalone: false,
})
export class DetalleEventoPage implements OnInit, AfterViewInit {
  @ViewChild('swipeArea', { read: ElementRef }) swipeArea!: ElementRef;
  @ViewChild('swipeThumb', { read: ElementRef }) swipeThumb!: ElementRef;
  @ViewChild('swipeFill', { read: ElementRef }) swipeFill!: ElementRef;
  @ViewChild('swipeText', { read: ElementRef }) swipeText!: ElementRef;

  evento!: Evento & { id: string };

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private gestureCtrl: GestureController,
    private router: Router,
    private eventoService: EventoService,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      try {
        const eventoObtenido = await this.eventoService.obtenerEventoPorId(id);
        this.evento = eventoObtenido as Evento & { id: string };
      } catch (error) {
        console.error('❌ Error al cargar evento:', error);
        const toast = await this.toastCtrl.create({
          message: 'Error al cargar evento',
          duration: 2000,
          color: 'danger',
          position: 'bottom',
        });
        await toast.present();
        this.volverAtras();
      }
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const thumb = this.swipeThumb?.nativeElement;
      const track = this.swipeArea?.nativeElement;
      const fill = this.swipeFill?.nativeElement;
      const text = this.swipeText?.nativeElement;

      if (!thumb || !track || !fill || !text) return;

      const maxX = track.offsetWidth - thumb.offsetWidth;

      const gesture = this.gestureCtrl.create({
        el: thumb,
        threshold: 0,
        gestureName: 'slide-button',
        onMove: (ev) => {
          const delta = Math.max(0, Math.min(ev.deltaX, maxX));
          const progress = (delta / maxX) * 100;

          thumb.style.transform = `translateX(${delta}px)`;
          fill.style.width = `${progress}%`;
          text.textContent = progress > 90 ? '¡Listo!' : 'Desliza para tomar evento';

          if (delta >= maxX) {
            this.unirseAlEvento();
            gesture.destroy(); // evita múltiples ejecuciones
          }
        },
        onEnd: () => {
          thumb.style.transition = 'transform 0.3s ease-out';
          fill.style.transition = 'width 0.3s ease-out';
          text.textContent = 'Desliza para tomar evento';
          thumb.style.transform = 'translateX(0px)';
          fill.style.width = '0%';

          setTimeout(() => {
            thumb.style.transition = '';
            fill.style.transition = '';
          }, 300);
        },
      });

      gesture.enable();
    }, 0);
  }

  async unirseAlEvento() {
    try {
      await this.eventoService.tomarEvento(this.evento.id);
      const toast = await this.toastCtrl.create({
        message: 'Te has unido al evento con éxito 🎉',
        duration: 2000,
        color: 'success',
        position: 'bottom',
      });
      await toast.present();
      this.router.navigate(['/sala-evento', this.evento.id]);
    } catch (error) {
      const toast = await this.toastCtrl.create({
        message: 'Error: No se pudo unir al evento. ' + (error as any).message,
        duration: 2500,
        color: 'danger',
        position: 'bottom',
      });
      await toast.present();
    }
  }

  volverAtras() {
    this.navCtrl.back();
  }
}
