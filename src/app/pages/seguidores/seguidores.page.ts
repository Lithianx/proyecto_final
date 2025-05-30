import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-seguidores',
  templateUrl: './seguidores.page.html',
  styleUrls: ['./seguidores.page.scss'],
  standalone: false,
})
export class SeguidoresPage implements OnInit {

  seguidores: { id: number; nombre: string; siguiendo: boolean }[] = [];
  seguidoresFiltrados: { id: number; nombre: string; siguiendo: boolean }[] = [];

  constructor(private router: Router) {}

ngOnInit() {
  this.seguidores = [
    { id: 1, nombre: 'mariana.fit', siguiendo: true },
    { id: 2, nombre: 'lucas.dev', siguiendo: false },
    { id: 3, nombre: 'valen_art', siguiendo: true },
    { id: 4, nombre: 'diegocode', siguiendo: false },
    { id: 5, nombre: 'camila.music', siguiendo: true },
    { id: 6, nombre: 'tomas.travel', siguiendo: false },
    { id: 7, nombre: 'fernanda_chef', siguiendo: true },
    { id: 8, nombre: 'sebaflow', siguiendo: false },
    { id: 9, nombre: 'isidora.makeup', siguiendo: true },
    { id: 10, nombre: 'matias.pro', siguiendo: false },
    { id: 11, nombre: 'josefa.writer', siguiendo: true },
    { id: 12, nombre: 'ignacio_plays', siguiendo: false },
    { id: 13, nombre: 'antonia.photo', siguiendo: true },
    { id: 14, nombre: 'andres.tech', siguiendo: false },
    { id: 15, nombre: 'constanza.books', siguiendo: true }
  ];

  this.seguidoresFiltrados = [...this.seguidores];
}


  alternarSeguimiento(usuario: any) {
    usuario.siguiendo = !usuario.siguiendo;
  }

  verPerfil(id: number) {
    this.router.navigate(['/perfil-user', id]);
  }

  buscarUsuarios(event: any) {
    const texto = event.detail.value.toLowerCase();
    this.seguidoresFiltrados = this.seguidores.filter(user =>
      user.nombre.toLowerCase().includes(texto)
    );
  }
}


