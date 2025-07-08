import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { SeguirService } from 'src/app/services/seguir.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Usuario } from 'src/app/models/usuario.model';
import { LocalStorageService } from 'src/app/services/local-storage-social.service';

@Component({
  selector: 'app-seguidores',
  templateUrl: './seguidores.page.html',
  styleUrls: ['./seguidores.page.scss'],
  standalone: false,
})
export class SeguidoresPage {
  idUsuarioActual: string = '';
  seguidores: (Usuario & { siguiendo: boolean })[] = [];
  seguidoresFiltrados: (Usuario & { siguiendo: boolean })[] = [];

  constructor(
    private router: Router,
    private alertController: AlertController,
    private seguirService: SeguirService,
    private usuarioService: UsuarioService,
    private localStorageService: LocalStorageService,
  ) {}

  async ionViewWillEnter() {
    await this.cargarDatos();
  }

  private async cargarDatos() {
    try {
      this.idUsuarioActual = await this.localStorageService.getItem('id_usuario');
      await this.seguirService.cargarSeguimientos();
      await this.usuarioService.cargarUsuarios();

      const todosUsuarios = this.usuarioService.getUsuarios();
      const seguidoresPuros = this.seguirService.getSeguidores(todosUsuarios, this.idUsuarioActual);

      this.seguidores = seguidoresPuros.map(user => ({
        ...user,
        siguiendo: this.seguirService.sigue(this.idUsuarioActual, user.id_usuario)
      }));

      this.seguidoresFiltrados = [...this.seguidores];
    } catch (error) {
      console.error('❌ Error al cargar seguidores:', error);
    }
  }

  buscarUsuarios(event: any) {
    const texto = event.detail.value.toLowerCase().trim();
    if (texto === '') {
      this.seguidoresFiltrados = [...this.seguidores];
    } else {
      this.seguidoresFiltrados = this.seguidores.filter(user =>
        user.nombre_usuario.toLowerCase().includes(texto)
      );
    }
  }

  async seguir(user: Usuario) {
    await this.seguirService.toggleSeguir(this.idUsuarioActual, user.id_usuario);
    await this.cargarDatos();
  }

  verPerfil(id: string) {
    this.router.navigate(['/perfil-user', id]);
  }
  
}
