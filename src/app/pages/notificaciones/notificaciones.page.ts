import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular'; // ✅ Importar NavController

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.page.html',
  styleUrls: ['./notificaciones.page.scss'],
  standalone: false,
})
export class NotificacionesPage implements OnInit {

notificaciones = [
  {
    usuario: 'Ana López',
    imagen: 'https://randomuser.me/api/portraits/women/1.jpg',
    accion: 'le dio me gusta a tu publicación.',
    timestamp: new Date(new Date().getTime() - 5 * 60 * 1000) // hace 5 minutos
  },
  {
    usuario: 'Lucía Torres',
    imagen: 'https://randomuser.me/api/portraits/women/3.jpg',
    accion: 'compartió tu publicación.',
    timestamp: new Date(new Date().getTime() - 60 * 60 * 1000) // hace 1 hora
  },
  {
    usuario: 'Miguel Rivera',
    imagen: 'https://randomuser.me/api/portraits/men/4.jpg',
    accion: 'comenzó a seguirte.',
    timestamp: new Date(new Date().getTime() - 24 * 60 * 60 * 1000) // hace 1 día
  }
];

  constructor(private navCtrl: NavController) { } // ✅ Inyectar NavController

  ngOnInit() { }

  volver() {
    this.navCtrl.back(); // ✅ Ahora funciona correctamente
  }
  obtenerTiempoRelativo(fecha: Date): string {
  const ahora = new Date().getTime();
  const diferencia = ahora - new Date(fecha).getTime();

  const minutos = Math.floor(diferencia / (1000 * 60));
  if (minutos < 1) return 'Justo ahora';
  if (minutos < 60) return `Hace ${minutos} min`;

  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `Hace ${horas} h`;

  const dias = Math.floor(horas / 24);
  return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
}
}
