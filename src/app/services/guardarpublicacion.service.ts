import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage-social.service';
import { GuardaPublicacion } from 'src/app/models/guarda-publicacion.model';

@Injectable({ providedIn: 'root' })
export class GuardaPublicacionService {
  private guardados: GuardaPublicacion[] = [];

  constructor(private localStorage: LocalStorageService) {}

  async cargarGuardados(): Promise<void> {
    this.guardados = await this.localStorage.getList<GuardaPublicacion>('publicacionesGuardadas') || [];
  }

  // Obtener todos los guardados en memoria
  getGuardados(): GuardaPublicacion[] {
    return this.guardados;
  }

  // Guardar o quitar guardado de una publicación (ahora string)
  async toggleGuardado(idUsuario: string, idPublicacion: string): Promise<void> {
    const guardado = this.guardados.find(
      g => g.id_usuario === idUsuario && g.id_publicacion === idPublicacion
    );
    if (guardado) {
      guardado.estado_guardado = !guardado.estado_guardado;
      guardado.fecha_guardado = new Date();
    } else {
      this.guardados.push({
        id_usuario: idUsuario,
        id_publicacion: idPublicacion,
        fecha_guardado: new Date(),
        estado_guardado: true
      });
    }
    await this.localStorage.setItem('publicacionesGuardadas', this.guardados);
  }

  // Saber si el usuario ya guardó una publicación (ahora string)
  estaGuardada(idUsuario: string, idPublicacion: string): boolean {
    return !!this.guardados.find(
      g => g.id_usuario === idUsuario &&
        g.id_publicacion === idPublicacion &&
        g.estado_guardado
    );
  }
}