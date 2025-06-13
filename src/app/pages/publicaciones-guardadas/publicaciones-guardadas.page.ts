import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

import { GuardaPublicacionService } from 'src/app/services/guardarpublicacion.service';
import { PublicacionService } from 'src/app/services/publicacion.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { LocalStorageService } from 'src/app/services/local-storage-social.service';

import { Publicacion } from 'src/app/models/publicacion.model';
import { Usuario } from 'src/app/models/usuario.model';

@Component({
  selector: 'app-publicaciones-guardadas',
  templateUrl: './publicaciones-guardadas.page.html',
  styleUrls: ['./publicaciones-guardadas.page.scss'],
  standalone: false,
})
export class PublicacionesGuardadasPage {
  publicacionesGuardadas: Publicacion[] = [];
  publicacionesFiltradas: Publicacion[] = [];
  usuarios: Usuario[] = [];

  usuarioActual!: Usuario;

  constructor(
    private alertController: AlertController,
    private router: Router,
    private localStorageService: LocalStorageService,
    private guardaPublicacionService: GuardaPublicacionService,
    private publicacionService: PublicacionService,
    private usuarioService: UsuarioService
  ) {}

  // 🔁 Se ejecuta cada vez que se entra a la página
  async ionViewWillEnter() {
    await this.guardaPublicacionService.cargarGuardados();
    await this.cargarUsuarios();
    await this.cargarPublicacionesGuardadas();
  }

  private async cargarUsuarios() {
    try {
      this.usuarios = await this.usuarioService.getUsuarios();
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      this.usuarios = [];
    }
  }

  private async cargarPublicacionesGuardadas(): Promise<void> {
    const id_usuario = await this.localStorageService.getItem('id_usuario');

    if (!id_usuario || typeof id_usuario !== 'string') {
      console.error('id_usuario no está disponible o no es string');
      return;
    }

    try {
      this.usuarioActual = await this.usuarioService.getUsuarioPorId(id_usuario);
      if (!this.usuarioActual) {
        console.error('No se encontró el usuario actual');
        return;
      }

      const todasPublicaciones = await this.publicacionService.getPublicaciones();

      const publicacionesGuardadas: Publicacion[] = todasPublicaciones.filter(pub =>
        this.guardaPublicacionService.estaGuardada(id_usuario, pub.id_publicacion)
      );

      this.publicacionesGuardadas = publicacionesGuardadas;
      this.publicacionesFiltradas = [...publicacionesGuardadas];
    } catch (error) {
      console.error('Error al cargar publicaciones guardadas:', error);
    }
  }

  getUsuarioDePublicacion(id_usuario: string): Usuario | undefined {
    return this.usuarios.find(u => u.id_usuario === id_usuario);
  }

  async confirmarEliminar(index: number, event: Event): Promise<void> {
    event.stopPropagation();
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    const alert = await this.alertController.create({
      header: '¿Eliminar publicación?',
      message: '¿Deseas eliminar esta publicación de guardados?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: async () => {
            const publicacion = this.publicacionesFiltradas[index];
            if (!this.usuarioActual || !this.usuarioActual.id_usuario) {
              console.error('Usuario actual no disponible');
              return;
            }

            await this.guardaPublicacionService.toggleGuardado(
              this.usuarioActual.id_usuario,
              publicacion.id_publicacion
            );

            // Actualiza las listas en la interfaz
            this.publicacionesFiltradas.splice(index, 1);
            const idxOriginal = this.publicacionesGuardadas.findIndex(
              p => p.id_publicacion === publicacion.id_publicacion
            );
            if (idxOriginal > -1) {
              this.publicacionesGuardadas.splice(idxOriginal, 1);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  comentario(publicacion: Publicacion) {
    this.router.navigate(['/comentario', publicacion.id_publicacion]);
  }
}
