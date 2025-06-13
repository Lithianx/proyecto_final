import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage-social.service';
import { GuardaPublicacion } from 'src/app/models/guarda-publicacion.model';
import { FirebaseService } from './firebase.service';
import { UtilsService } from './utils.service';

@Injectable({ providedIn: 'root' })
export class GuardaPublicacionService {
  private guardados: GuardaPublicacion[] = [];

  constructor(
    private localStorage: LocalStorageService,
    private firebaseService: FirebaseService,
    private utilsService: UtilsService
  ) {}

  async cargarGuardados(): Promise<void> {
    const online = await this.utilsService.checkInternetConnection();
    if (online) {
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
    const online = await this.utilsService.checkInternetConnection();
    if (guardado) {
      guardado.estado_guardado = !guardado.estado_guardado;
      guardado.fecha_guardado = new Date();
      if (online) {
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
      if (online) {
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

async sincronizarGuardadosLocales(): Promise<void> {
  const online = await this.utilsService.checkInternetConnection();
  if (!online) return;

  const guardadosLocales = await this.localStorage.getList<GuardaPublicacion>('publicacionesGuardadas') || [];
  const sincronizados: GuardaPublicacion[] = [];
  const noSincronizados: GuardaPublicacion[] = [];

  for (const guardado of guardadosLocales) {
    if (!guardado.id_usuario || !guardado.id_publicacion) {
      console.error('Guardado con datos incompletos:', guardado);
      noSincronizados.push(guardado);
      continue;
    }
    try {
      const existe = await this.firebaseService.existeGuardado(guardado.id_usuario, guardado.id_publicacion);

      // Siempre actualiza el documento, aunque estado_guardado sea false
      if (existe) {
        await this.firebaseService.updateGuardado(guardado);
      } else {
        await this.firebaseService.addGuardado(guardado);
      }
      sincronizados.push(guardado);
    } catch (e) {
      noSincronizados.push(guardado);
    }
  }

  await this.localStorage.setItem('publicacionesGuardadas', noSincronizados);
}
}