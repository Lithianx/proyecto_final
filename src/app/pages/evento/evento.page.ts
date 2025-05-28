import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';


@Component({
  selector: 'app-evento',
  templateUrl: './evento.page.html',
  styleUrls: ['./evento.page.scss'],
  standalone: false,
})
export class EventoPage implements OnInit {

  eventos = [
    { id: 1, nombre: 'Torneo de LoL', lugar: 'Sala 1', hora: '18:00', usuario: 'PEPEX'},
    { id: 2, nombre: 'Among Us IRL', lugar: 'Patio central', hora: '16:00',usuario: 'CARLOS' },
    { id: 3, nombre: 'Tetris Battle', lugar: 'Sala 3', hora: '19:30',usuario: 'JUAN' },
    { id: 4, nombre: 'Torneo de DOTA', lugar: 'Sala 1', hora: '18:00', usuario: 'ESTEBAN666' },
    { id: 5, nombre: 'Torneo de POKEMON', lugar: 'Sala 1', hora: '18:00',usuario: 'KANGURUU' },
    { id: 6, nombre: 'UNO', lugar: 'Sala 2', hora: '18:00', usuario: 'PEPEX' },
  ];

  eventosFiltrados = [...this.eventos];
  

  constructor(public router: Router,private navCtrl: NavController) { }

  ngOnInit() {
  }

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
    this.navCtrl.back();
  }
  filtrarEventos(event: any) {
  const texto = event.target.value?.toLowerCase().trim(); // Captura el texto de búsqueda

  if (!texto) {
    this.eventosFiltrados = [...this.eventos]; // Si no hay búsqueda, muestra todo
    return;
  }

  this.eventosFiltrados = this.eventos.filter(evento =>
    evento.nombre.toLowerCase().includes(texto) ||
    evento.lugar.toLowerCase().includes(texto)
  );
}


irADetalleEvento(evento: any) {
  this.router.navigate(['/detalle-evento', evento.id]);
}



}
