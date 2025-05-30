import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-evento-inscrito',
  templateUrl: './evento-inscrito.page.html',
  styleUrls: ['./evento-inscrito.page.scss'],
  standalone: false,
})
export class EventoInscritoPage implements OnInit {

  eventData: any = null;

  // Simula una lista de eventos, como los que tienes en perfil.page.ts
  eventosMock = [
    {
      id: 1,
      tournamentName: 'Campeonato de LoL',
      game: 'League of Legends',
      description: 'Competencia de alto nivel para jugadores de LoL.',
      gameMode: '5v5',
      rules: 'No hacer trampas, respetar a los otros jugadores.',
      date: '12/05/2025',
      time: '15:00',
      location: 'Auditorio Principal',
      owner: 'usuario1'
    },
    {
      id: 2,
      tournamentName: 'Torneo Valorant',
      game: 'Valorant',
      description: 'Torneo para equipos amateurs.',
      gameMode: '5v5',
      rules: 'Juego limpio, puntualidad.',
      date: '19/05/2025',
      time: '18:00',
      location: 'Sala de eSports',
      owner: 'usuario2'
    },
    {
      id: 3,
      tournamentName: 'Torneo Épico de Vóley',
      game: 'Vóley 3D',
      description: 'Un torneo para los mejores jugadores de vóley virtual.',
      gameMode: '5v5',
      rules: 'Sin trampas, buena conducta, puntualidad obligatoria.',
      date: '2025-06-15',
      time: '18:00',
      location: 'Gimnasio Central',
      owner: 'Organizador UC'
    }
  ];

  constructor(private navCtrl: NavController, private route: ActivatedRoute) {}

  ngOnInit() {
    // Obtener id del parámetro URL
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.cargarDatosEvento(id);
    }
  }

  cargarDatosEvento(id: number) {
    // Buscar evento en la lista simulada
    const evento = this.eventosMock.find(e => e.id === id);
    if (evento) {
      this.eventData = evento;
    } else {
      // Si no lo encuentra, puedes navegar atrás o mostrar mensaje
      this.navCtrl.back();
    }
  }

  volver() {
    this.navCtrl.back();
  }
}
