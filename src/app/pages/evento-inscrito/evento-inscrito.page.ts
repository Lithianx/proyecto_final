import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-evento-inscrito',
  templateUrl: './evento-inscrito.page.html',
  styleUrls: ['./evento-inscrito.page.scss'],
  standalone: false,
})
export class EventoInscritoPage implements OnInit {

  eventData = {
    tournamentName: 'Torneo Épico de Vóley',
    game: 'Vóley 3D',
    description: 'Un torneo para los mejores jugadores de vóley virtual.',
    gameMode: '5v5',
    rules: 'Sin trampas, buena conducta, puntualidad obligatoria.',
    date: '2025-06-15',
    time: '18:00',
    location: 'Gimnasio Central',
    owner: 'Organizador UC'
  };

  constructor(private navCtrl: NavController) { }

  ngOnInit() {}

  volver() {
    this.navCtrl.back();
  }
}
