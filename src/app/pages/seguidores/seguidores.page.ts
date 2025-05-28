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

  constructor(private router: Router) {} // ✅ Aquí se inyecta correctamente

  ngOnInit() {
    this.seguidores = [
      { id: 1, nombre: 'Alejandro', siguiendo: false },
      { id: 2, nombre: 'Cristian', siguiendo: true },
      { id: 3, nombre: 'Felipe', siguiendo: false }
    ];
  }

  alternarSeguimiento(usuario: any) {
    usuario.siguiendo = !usuario.siguiendo;
  }

verPerfil(id: number) {
  this.router.navigate(['/perfil-user', id]);
}

}
