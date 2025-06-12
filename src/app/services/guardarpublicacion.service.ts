import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage-social.service';
import { GuardaPublicacion } from 'src/app/models/guarda-publicacion.model';
import { FirebaseService } from './firebase.service';

@Injectable({ providedIn: 'root' })
export class GuardaPublicacionService {
  private guardados: GuardaPublicacion[] = [];

  constructor(
    private localStorage: LocalStorageService,
    private firebaseService: FirebaseService
  ) {}

  async cargarGuardados(): Promise<void> {
    if (navigator.onLine) {
      try {
        this.guardados = await this.firebaseService.getGuardados();
        await this.localStorage.setItem('publicacionesGuardadas', this.guardados);
      } catch {
        this.guardados = await this.localStorage.getList<GuardaPublicacion>('publicacionesGuardadas') || [];
      }
    } else {
      this.guardados = await this.localStorage.getList<GuardaPublicacion>('publicacionesGuardadas') || [];
    }
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
      if (navigator.onLine) {
        await this.firebaseService.updateGuardado(guardado);
      }
    } else {
      const nuevo: GuardaPublicacion = {
        id_usuario: idUsuario,
        id_publicacion: idPublicacion,
        fecha_guardado: new Date(),
        estado_guardado: true
      };
      this.guardados.push(nuevo);
      if (navigator.onLine) {
        await this.firebaseService.addGuardado(nuevo);
      }
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