import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-detalle-evento',
  templateUrl: './detalle-evento.page.html',
  styleUrls: ['./detalle-evento.page.scss'],
  standalone: false,
})
export class DetalleEventoPage implements OnInit {

  evento: any;

  
  eventos = [
    { id: 1, nombre: 'Torneo de LoL', lugar: 'Sala 1', hora: '18:00', tipo: 'Videojuego' },
    { id: 2, nombre: 'Among Us IRL', lugar: 'Patio central', hora: '16:00', tipo: 'Juego de mesa' },
    { id: 3, nombre: 'Tetris Battle', lugar: 'Sala 3', hora: '19:30', tipo: 'Videojuego' },
    { id: 4, nombre: 'Torneo de DOTA', lugar: 'Sala 1', hora: '18:00', tipo: 'Videojuego' },
    { id: 5, nombre: 'Torneo de POKEMON', lugar: 'Sala 1', hora: '18:00', tipo: 'Juego de mesa' },
    { id: 6, nombre: 'UNO', lugar: 'Sala 2', hora: '18:00', tipo: 'Juego de mesa' },
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.evento = this.eventos.find(e => e.id === id);
  }

  unirseAlEvento() {
    console.log('Te uniste al evento:', this.evento.nombre);
    // Aquí podrías agregar lógica real, como guardar en Firebase o mostrar un modal
  }

}