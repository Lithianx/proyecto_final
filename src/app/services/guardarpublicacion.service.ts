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

  // Método privado para obtener guardados desde el almacenamiento local
  private async obtenerGuardadosLocales(): Promise<GuardaPublicacion[]> {
    return await this.localStorage.getList<GuardaPublicacion>('publicacionesGuardadas') || [];
  }

  // Carga los guardados desde Firebase si hay conexión, si no, desde local
  async cargarGuardados(): Promise<void> {
    const online = await this.utilsService.checkInternetConnection();
    if (online) {
      try {
        this.guardados = await this.firebaseService.getGuardados();
        await this.localStorage.setItem('publicacionesGuardadas', this.guardados);
      } catch (error) {
        console.error('Error al cargar guardados desde Firebase, usando local:', error);
        this.guardados = await this.obtenerGuardadosLocales();
      }
    } else {
      this.guardados = await this.obtenerGuardadosLocales();
    }
  }

  // Obtener todos los guardados en memoria
  getGuardados(): GuardaPublicacion[] {
    return this.guardados;
  }

  // Guardar o quitar guardado de una publicación
  async toggleGuardado(idUsuario: string, idPublicacion: string): Promise<void> {
    if (!idUsuario || !idPublicacion) {
      console.warn('ID de usuario o publicación inválido');
      return;
    }

    const online = await this.utilsService.checkInternetConnection();
    const guardado = this.guardados.find(
      g => g.id_usuario === idUsuario && g.id_publicacion === idPublicacion
    );

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

  // Saber si el usuario ya guardó una publicación
  estaGuardada(idUsuario: string, idPublicacion: string): boolean {
    return this.guardados.some(
      g =>
        g.id_usuario === idUsuario &&
        g.id_publicacion === idPublicacion &&
        g.estado_guardado
    );
  }

  // Recarga los guardados desde local (por si quieres refrescar la lista sin conexión)
  async recargarDesdeLocal(): Promise<void> {
    this.guardados = await this.obtenerGuardadosLocales();
  }

  // Sincroniza publicaciones guardadas locales con Firebase
  async sincronizarGuardadosLocales(): Promise<void> {
    const online = await this.utilsService.checkInternetConnection();
    if (!online) return;

    const guardadosLocales = await this.obtenerGuardadosLocales();
    const sincronizados: GuardaPublicacion[] = [];
    const noSincronizados: GuardaPublicacion[] = [];

    for (const guardado of guardadosLocales) {
      if (!guardado.id_usuario || !guardado.id_publicacion) {
        console.error('Guardado con datos incompletos:', guardado);
        noSincronizados.push(guardado);
        continue;
      }

      try {
        const existe = await this.firebaseService.existeGuardado(
          guardado.id_usuario,
          guardado.id_publicacion
        );

        if (existe) {
          await this.firebaseService.updateGuardado(guardado);
        } else {
          await this.firebaseService.addGuardado(guardado);
        }

        sincronizados.push(guardado);
      } catch (e) {
        console.error('Error al sincronizar guardado:', guardado, e);
        noSincronizados.push(guardado);
      }
    }

    // Solo se mantienen en local los que no se pudieron sincronizar
    await this.localStorage.setItem('publicacionesGuardadas', noSincronizados);
  }
  
}
