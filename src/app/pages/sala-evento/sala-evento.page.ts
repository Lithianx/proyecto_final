import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-sala-evento',
  templateUrl: './sala-evento.page.html',
  styleUrls: ['./sala-evento.page.scss'],
  standalone: false,
})
export class SalaEventoPage implements OnInit {

  evento: any;
  jugadores: string[] = ['Tú', 'Carlos', 'Ana'];

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
  ) {}

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.evento = this.eventos.find(e => e.id === id);
  }


  volverAtras() {
    this.navCtrl.back();
  }


}