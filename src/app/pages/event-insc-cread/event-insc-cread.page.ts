import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-event-insc-cread',
  templateUrl: './event-insc-cread.page.html',
  styleUrls: ['./event-insc-cread.page.scss'],
  standalone: false,
})
export class EventInscCreadPage implements OnInit {

  id!: string;
  titulo!: string;
  evento: any = null;

  constructor(private route: ActivatedRoute, private navCtrl: NavController) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.id = params.get('id')!;
      this.titulo = decodeURIComponent(params.get('titulo')!);
      this.cargarEvento(this.id);
    });
  }

  cargarEvento(id: string) {
    const eventos: { [key: string]: any } = {
      '1': {
        nombre: 'Campeonato Valorant',
        descripcion: 'Torneo regional de Valorant para equipos universitarios.',
        lugar: 'Centro de Convenciones UC',
        fecha: new Date('2025-07-10'),
        duracion: 90,
        cupos: 50
      },
      '2': {
        nombre: 'Clash Royale 1v1',
        descripcion: 'Competencia individual para jugadores de Clash Royale.',
        lugar: 'Sala Multiuso - Campus San Joaquín',
        fecha: new Date('2025-08-02'),
        duracion: 60,
        cupos: 32
      }
    };

    this.evento = eventos[id] || {
      nombre: 'Evento no encontrado',
      descripcion: 'No se encontró información para este evento.',
      lugar: '-',
      fecha: new Date(),
      duracion: 0,
      cupos: 0
    };
  }

  volver() {
    this.navCtrl.back();
  }
}
