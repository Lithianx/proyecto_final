import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage-social.service';
import { Seguir } from 'src/app/models/seguir.model';
import { Usuario } from 'src/app/models/usuario.model';
import { FirebaseService } from './firebase.service';

@Injectable({ providedIn: 'root' })
export class SeguirService {
  private seguimientosEnMemoria: Seguir[] = [];

  constructor(private localStorage: LocalStorageService,
    private firebaseService: FirebaseService
  ) {}

  // Cargar seguimientos en memoria desde Firebase o localStorage
  async cargarSeguimientos(): Promise<void> {
    try {
      const seguimientos = await this.firebaseService.getSeguimientos();
      this.seguimientosEnMemoria = seguimientos;
      await this.localStorage.setItem('seguimientos', seguimientos);
    } catch (error) {
      // Si falla Firebase, usa localStorage
      const seguimientos = await this.localStorage.getList<Seguir>('seguimientos') || [];
      this.seguimientosEnMemoria = seguimientos;
    }
  }

  // Obtener todos los seguimientos en memoria
  getSeguimientos(): Seguir[] {
    return this.seguimientosEnMemoria;
  }

  // Seguir o dejar de seguir a un usuario (ahora string)
async toggleSeguir(idSeguidor: string, idSeguido: string): Promise<void> {
  const seguimiento = this.seguimientosEnMemoria.find(
    s => s.id_usuario_seguidor === idSeguidor && s.id_usuario_seguido === idSeguido
  );
  if (seguimiento) {
    seguimiento.estado_seguimiento = !seguimiento.estado_seguimiento;
    if (navigator.onLine) {
      await this.firebaseService.updateSeguimiento(seguimiento);
    }
  } else {
    const nuevo = {
      id_usuario_seguidor: idSeguidor,
      id_usuario_seguido: idSeguido,
      estado_seguimiento: true
    };
    this.seguimientosEnMemoria.push(nuevo);
    if (navigator.onLine) {
      await this.firebaseService.addSeguimiento(nuevo);
    }
  }
  await this.localStorage.setItem('seguimientos', this.seguimientosEnMemoria);
}

  // Saber si el usuario ya sigue a otro usuario (ahora string)
  sigue(idSeguidor: string, idSeguido: string): boolean {
    return !!this.seguimientosEnMemoria.find(
      s => s.id_usuario_seguidor === idSeguidor &&
        s.id_usuario_seguido === idSeguido &&
        s.estado_seguimiento
    );
  }

  // Obtiene los usuarios que el usuario actual sigue (ahora string)
  getUsuariosSeguidos(usuarios: Usuario[], idUsuario: string): Usuario[] {
    const idsSeguidos = this.seguimientosEnMemoria
      .filter(s => s.id_usuario_seguidor === idUsuario && s.estado_seguimiento)
      .map(s => s.id_usuario_seguido);

    return usuarios.filter(u => idsSeguidos.includes(u.id_usuario));
  }

  // Filtra usuarios seguidos por nombre (ahora string)
  filtrarUsuariosSeguidos(usuarios: Usuario[], usuarioActualId: string, searchTerm: string): Usuario[] {
    const seguidos = this.getUsuariosSeguidos(usuarios, usuarioActualId);
    return seguidos.filter(user =>
      user.nombre_usuario.toLowerCase().includes(searchTerm)
    );
  }
}