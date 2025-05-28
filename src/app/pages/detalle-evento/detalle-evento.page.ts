import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, GestureController } from '@ionic/angular';

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

  evento: any;

  eventos = [
    { id: 1, nombre: 'Torneo de LoL', lugar: 'Sala 1', hora: '18:00', usuario: 'PEPEX' },
    { id: 2, nombre: 'Among Us IRL', lugar: 'Patio central', hora: '16:00', usuario: 'CARLOS' },
    { id: 3, nombre: 'Tetris Battle', lugar: 'Sala 3', hora: '19:30', usuario: 'JUAN' },
    { id: 4, nombre: 'Torneo de DOTA', lugar: 'Sala 1', hora: '18:00', usuario: 'ESTEBAN666' },
    { id: 5, nombre: 'Torneo de POKEMON', lugar: 'Sala 1', hora: '18:00', usuario: 'KANGURUU' },
    { id: 6, nombre: 'UNO', lugar: 'Sala 2', hora: '18:00', usuario: 'PEPEX' },
  ];

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private gestureCtrl: GestureController
  ) {}

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.evento = this.eventos.find(e => e.id === id);
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
  }, 0); // <- clave para esperar render completo
}

  unirseAlEvento() {
    console.log('🎯 Te uniste al evento:', this.evento.nombre);
    // Aquí puedes mostrar un toast o redireccionar si quieres
  }

  volverAtras() {
    this.navCtrl.back();
  }
}