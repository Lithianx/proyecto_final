import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { SeguirService } from 'src/app/services/seguir.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Usuario } from 'src/app/models/usuario.model';
import { LocalStorageService } from 'src/app/services/local-storage-social.service';

@Component({
  selector: 'app-seguidos',
  templateUrl: './seguidos.page.html',
  styleUrls: ['./seguidos.page.scss'],
  standalone: false,
})
export class SeguidosPage {
  idUsuarioActual: string = '';
  usuariosSeguidos: Usuario[] = [];
  usuariosSeguidosFiltrados: Usuario[] = [];

  constructor(
    private router: Router,
    private alertController: AlertController,
    private seguirService: SeguirService,
    private usuarioService: UsuarioService,
    private localStorageService: LocalStorageService
  ) {}

  // Se ejecuta cada vez que la página está a punto de mostrarse
  async ionViewWillEnter() {
    await this.cargarDatos();
  }

  private async cargarDatos() {
    try {
      // Obtener el id del usuario actual desde localStorage
      this.idUsuarioActual = await this.localStorageService.getItem('id_usuario');
      
      // Cargar todas las relaciones de seguimiento y usuarios
      await this.seguirService.cargarSeguimientos();
      await this.usuarioService.cargarUsuarios();

      // Obtener lista completa de usuarios
      const todosUsuarios = this.usuarioService.getUsuarios();

      // Filtrar los usuarios que el usuario actual sigue
      this.usuariosSeguidos = this.seguirService.getUsuariosSeguidos(todosUsuarios, this.idUsuarioActual);
      this.usuariosSeguidosFiltrados = [...this.usuariosSeguidos];

      console.log('✅ Datos cargados:', this.usuariosSeguidos);
    } catch (error) {
      console.error('❌ Error al cargar datos:', error);
    }
  }

  // Función para filtrar la lista de usuarios seguidos según texto buscado
  buscarUsuarios(event: any) {
    const texto = event.detail.value.toLowerCase().trim();

    if (texto === '') {
      this.usuariosSeguidosFiltrados = [...this.usuariosSeguidos];
    } else {
      this.usuariosSeguidosFiltrados = this.seguirService.filtrarUsuariosSeguidos(
        this.usuarioService.getUsuarios(),
        this.idUsuarioActual,
        texto
      );
    }
  }

  // Confirmar eliminación (dejar de seguir)
  async confirmarEliminar(index: number, user: Usuario) {
    const alert = await this.alertController.create({
      header: '¿Dejar de seguir?',
      message: `¿Quieres dejar de seguir a ${user.nombre_usuario}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.dejarDeSeguir(user.id_usuario);
          }
        }
      ]
    });
    await alert.present();
  }

  // Dejar de seguir a un usuario
  async dejarDeSeguir(idUsuarioSeguido: string) {
    await this.seguirService.toggleSeguir(this.idUsuarioActual, idUsuarioSeguido);
    await this.cargarDatos(); // Recargar datos para actualizar lista
  }

  // Navegar al perfil de un usuario
  verPerfil(id: string) {
    this.router.navigate(['/perfil-user', id]);
  }
}
