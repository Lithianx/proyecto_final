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
    this.todosusuarios = await this.usuarioService.getUsuarios();
  }


  // Filtrado de la lista de chats por el nombre del participante
  handleInput(event: any): void {
    const query = event.target.value?.toLowerCase().trim();

    this.busquedaActiva = !!query; // true si hay texto, false si está vacío

    if (!query) {
      this.usuarios = [];
      return;
    }

    this.usuarios = this.todosusuarios.filter(usuario =>
      usuario.nombre_usuario.toLowerCase().includes(query)
    );
  }

}
