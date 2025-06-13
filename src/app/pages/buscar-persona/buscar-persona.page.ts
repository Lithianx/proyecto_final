import { Component, OnInit } from '@angular/core';

import { Usuario } from 'src/app/models/usuario.model';
import { UsuarioService } from 'src/app/services/usuario.service';
import { LocalStorageService } from 'src/app/services/local-storage-social.service';

@Component({
  selector: 'app-buscar-persona',
  templateUrl: './buscar-persona.page.html',
  styleUrls: ['./buscar-persona.page.scss'],
  standalone: false
})
export class BuscarPersonaPage implements OnInit {

  todosusuarios: Usuario[] = [];
  usuarios: Usuario[] = [];
  busquedaActiva: boolean = false;

  constructor(
    private localStorage: LocalStorageService,
    private usuarioService: UsuarioService
  ) { }

async ngOnInit() {
  const idUsuarioLogueado = await this.localStorage.getItem('id_usuario');

  this.todosusuarios = (await this.usuarioService.obtenerUsuarios())
    .filter(usuario => usuario.id_usuario !== idUsuarioLogueado);

  this.usuarios = this.todosusuarios;  // Mostrar todos excepto el logueado
}



  // Filtrado de la lista de usuarios por nombre_usuario
  handleInput(event: any): void {
    const query = event.target.value?.toLowerCase().trim();

    if (!query) {
      this.usuarios = this.todosusuarios;  // Mostrar todos si no hay búsqueda
      this.busquedaActiva = false;
      return;
    }

    this.busquedaActiva = true;

    this.usuarios = this.todosusuarios.filter(usuario =>
      usuario.nombre_usuario.toLowerCase().includes(query)
    );
  }
}
