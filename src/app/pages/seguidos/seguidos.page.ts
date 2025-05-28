import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-seguidos',
  templateUrl: './seguidos.page.html',
  styleUrls: ['./seguidos.page.scss'],
  standalone: false,
})
export class SeguidosPage implements OnInit {

  seguidos: { id: number; nombre: string }[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.seguidos = [
      { id: 1, nombre: 'usuario_1' },
      { id: 2, nombre: 'usuario_2' },
      { id: 3, nombre: 'usuario_3' }
    ];
  }

  dejarDeSeguir(index: number) {
    this.seguidos.splice(index, 1); // Elimina al usuario de la lista
  }

  verPerfil(id: number) {
    this.router.navigate(['/perfil-user', id]);
  }

}
