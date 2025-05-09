import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-evento',
  templateUrl: './evento.page.html',
  styleUrls: ['./evento.page.scss'],
  standalone: false,
})
export class EventoPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  eventos = [
    {
      nombre: 'Torneo de LoL',
      lugar: 'Sala 1',
      hora: '18:00',
      tipo: 'Videojuego',
    },
    {
      nombre: 'Among Us IRL',
      lugar: 'Patio central',
      hora: '16:00',
      tipo: 'Juego de mesa',
    },
    {
      nombre: 'Tetris Battle',
      lugar: 'Sala 3',
      hora: '19:30',
      tipo: 'Videojuego',
    },
    {
      nombre: 'Torneo de DOTA',
      lugar: 'Sala 1',
      hora: '18:00',
      tipo: 'Videojuego',
    },
    {
      nombre: 'Torneo de POKEMON',
      lugar: 'Sala 1',
      hora: '18:00',
      tipo: 'Juego de mesa',
    },
    {
      nombre: 'UNO',
      lugar: 'Sala 2',
      hora: '18:00',
      tipo: 'Juego de mesa',
    },
  ];
  unirse(evento: any) {
    console.log('Te uniste al evento:', evento.nombre);
    // Aquí puedes agregar lógica real más adelante
  }
  
  verDetalles(evento: any) {
    console.log('Detalles del evento:', evento);
    // Puedes abrir un modal o ir a otra página
  }
doRefresh(event: any) {
    console.log('Recargando publicaciones...');
    setTimeout(() => {
      // Aquí podrías actualizar los datos, por ejemplo, desde Firebase
      this.ngOnInit(); // Recarga los posts como ejemplo
      event.target.complete(); // Detiene el refresher
      console.log('Recarga completada');
    }, 1500); // Simula un tiempo de espera
  }
  volverAtras() {
    console.log('Volviendo atrás...');
    // Aquí puedes agregar lógica para navegar hacia atrás
    window.history.back();
  }

}
