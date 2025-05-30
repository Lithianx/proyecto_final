import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-seguidos',
  templateUrl: './seguidos.page.html',
  styleUrls: ['./seguidos.page.scss'],
  standalone: false,
})
export class SeguidosPage implements OnInit {

  seguidos: { id: number; nombre: string }[] = [];
  seguidosFiltrados: { id: number; nombre: string }[] = [];

  constructor(private router: Router, private actionSheetCtrl: ActionSheetController) {}

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


  // Filtra seguidos según texto buscado
  buscarUsuarios(event: any) {
    const texto = event.detail.value.toLowerCase();
    if (texto.trim() === '') {
      this.seguidosFiltrados = [...this.seguidos];
    } else {
      this.seguidosFiltrados = this.seguidos.filter(user =>
        user.nombre.toLowerCase().includes(texto)
      );
    }
  }

  // Mostrar modal para confirmar eliminación
  async confirmarEliminar(index: number) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: '¿Eliminar este seguido?',
      cssClass: 'custom-action-sheet',
      buttons: [
        {
          text: 'Eliminar',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.dejarDeSeguir(index);
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  dejarDeSeguir(index: number) {
    this.seguidos.splice(index, 1);
    this.seguidosFiltrados = [...this.seguidos]; // Actualiza la lista filtrada también
  }

  verPerfil(id: number) {
    this.router.navigate(['/perfil-user', id]);
  }
}
