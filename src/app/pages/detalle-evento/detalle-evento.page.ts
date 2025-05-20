import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-detalle-evento',
  templateUrl: './detalle-evento.page.html',
  styleUrls: ['./detalle-evento.page.scss'],
  standalone: false,
})
export class DetalleEventoPage implements OnInit {

  evento: any;

  
  eventos = [
    { id: 1, nombre: 'Torneo de LoL', lugar: 'Sala 1', hora: '18:00', tipo: 'Videojuego', descripcion: 'Torneo de League of Legends' },
    { id: 2, nombre: 'Among Us IRL', lugar: 'Patio central', hora: '16:00', tipo: 'Juego de mesa', descripcion: 'Juego de mesa de Among Us' },
    { id: 3, nombre: 'Tetris Battle', lugar: 'Sala 3', hora: '19:30', tipo: 'Videojuego',descripcion: 'Torneo de Tetris' },
    { id: 4, nombre: 'Torneo de DOTA', lugar: 'Sala 1', hora: '18:00', tipo: 'Videojuego' ,descripcion: 'Torneo de DOTA 2'},
    { id: 5, nombre: 'Torneo de POKEMON', lugar: 'Sala 1', hora: '18:00', tipo: 'Juego de mesa' ,descripcion: 'Torneo de cartas de Pokemon'},
    { id: 6, nombre: 'UNO', lugar: 'Sala 2', hora: '18:00', tipo: 'Juego de mesa' ,descripcion: 'Torneo de cartas de UNO'},
  ];

  constructor(private route: ActivatedRoute, private navCtrl: NavController) {}

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.evento = this.eventos.find(e => e.id === id);
  }

  unirseAlEvento() {
    console.log('Te uniste al evento:', this.evento.nombre);
    // Aquí podrías agregar lógica real, como guardar en Firebase o mostrar un modal
  }
  volverAtras() {
    this.navCtrl.back();
  }

}