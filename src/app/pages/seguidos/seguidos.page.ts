import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-seguidos',
  templateUrl: './seguidos.page.html',
  styleUrls: ['./seguidos.page.scss'],
  standalone: false,
})
export class SeguidosPage implements OnInit {

  seguidos: { id: number; nombre: string }[] = [];
  seguidosFiltrados: { id: number; nombre: string }[] = [];

  constructor(
    private router: Router,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.seguidos = [
      { id: 1, nombre: 'luna.blogs' },
      { id: 2, nombre: 'nico.dev' },
      { id: 3, nombre: 'sophie.travel' },
      { id: 4, nombre: 'ale.gamer' },
      { id: 5, nombre: 'daniela.design' },
      { id: 6, nombre: 'marco.music' },
      { id: 7, nombre: 'lucia.coffee' },
      { id: 8, nombre: 'felipe_runs' },
      { id: 9, nombre: 'javi.tech' },
      { id: 10, nombre: 'valentina.lens' }
    ];
    this.seguidosFiltrados = [...this.seguidos];
  }

  buscarUsuarios(event: any) {
    const texto = event.detail.value.toLowerCase();
    this.seguidosFiltrados = texto.trim() === ''
      ? [...this.seguidos]
      : this.seguidos.filter(user => user.nombre.toLowerCase().includes(texto));
  }

  async confirmarEliminar(index: number, usuario: { id: number; nombre: string }) {
    const alert = await this.alertController.create({
      header: '¿Dejar de seguir?',
      message: `¿Quieres dejar de seguir a ${usuario.nombre}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.dejarDeSeguir(index);
          }
        }
      ]
    });
    await alert.present();
  }

  dejarDeSeguir(index: number) {
    this.seguidos.splice(index, 1);
    this.seguidosFiltrados = [...this.seguidos];
  }

  verPerfil(id: number) {
    this.router.navigate(['/perfil-user', id]);
  }
}
