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
    this.usuarioService.usuarios$.subscribe(usuarios => {
      this.todosusuarios = usuarios;
      // Si hay una búsqueda activa, actualiza el filtro
      if (this.busquedaActiva && this.usuarios.length > 0) {
        const query = this.usuarios[0]?.nombre_usuario?.toLowerCase() || '';
        this.usuarios = this.todosusuarios.filter(usuario =>
          usuario.nombre_usuario.toLowerCase().includes(query)
        );
      }
    });
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
