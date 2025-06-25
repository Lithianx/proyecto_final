import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage-social.service';
import { GuardaPublicacion } from 'src/app/models/guarda-publicacion.model';
import { FirebaseService } from './firebase.service';
import { UtilsService } from './utils.service';
import { Timestamp } from 'firebase/firestore';  // <-- Importa Timestamp de Firebase

@Injectable({ providedIn: 'root' })
export class GuardaPublicacionService {
  private guardados: GuardaPublicacion[] = [];

  constructor(
    private localStorage: LocalStorageService,
    private firebaseService: FirebaseService,
    private utilsService: UtilsService
  ) {}

  // Función para detectar si el valor es un Timestamp de Firestore
  private esTimestamp(fecha: any): fecha is Timestamp {
    return fecha && typeof fecha.toDate === 'function';
  }

  // Obtener guardados desde almacenamiento local
  private async obtenerGuardadosLocales(): Promise<GuardaPublicacion[]> {
    return await this.localStorage.getList<GuardaPublicacion>('publicacionesGuardadas') || [];
  }

  // Carga guardados desde Firebase o local si no hay conexión
  async cargarGuardados(): Promise<void> {
    const online = await this.utilsService.checkInternetConnection();

    if (online) {
      try {
        const guardadosFirebase = await this.firebaseService.getGuardados();

        this.guardados = guardadosFirebase.map(g => ({
          ...g,
          fecha_guardado: this.esTimestamp(g.fecha_guardado)
            ? g.fecha_guardado.toDate()
            : new Date(g.fecha_guardado)
        }));

        await this.localStorage.setItem('publicacionesGuardadas', this.guardados);
      } catch (error) {
        console.error('Error al cargar guardados desde Firebase, usando local:', error);

        const guardadosLocales = await this.obtenerGuardadosLocales();
        this.guardados = guardadosLocales.map(g => ({
          ...g,
          fecha_guardado: this.esTimestamp(g.fecha_guardado)
            ? g.fecha_guardado.toDate()
            : new Date(g.fecha_guardado)
        }));
      }
    } else {
      const guardadosLocales = await this.obtenerGuardadosLocales();
      this.guardados = guardadosLocales.map(g => ({
        ...g,
        fecha_guardado: this.esTimestamp(g.fecha_guardado)
          ? g.fecha_guardado.toDate()
          : new Date(g.fecha_guardado)
      }));
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
      guardado.fecha_guardado = Timestamp.now();  // Usar Timestamp para Firestore
      if (online) {
        await this.firebaseService.updateGuardado(guardado);
      }
    } else {
      const nuevo: GuardaPublicacion = {
        id_usuario: idUsuario,
        id_publicacion: idPublicacion,
        fecha_guardado: Timestamp.now(),  // Timestamp para Firestore
        estado_guardado: true
      };
      this.guardados.push(nuevo);
      if (online) {
        await this.firebaseService.addGuardado(nuevo);
      }
    }

    await this.localStorage.setItem('publicacionesGuardadas', this.guardados);
  }

  // Verificar si un usuario ya guardó una publicación
  estaGuardada(idUsuario: string, idPublicacion: string): boolean {
    return this.guardados.some(
      g =>
        g.id_usuario === idUsuario &&
        g.id_publicacion === idPublicacion &&
        g.estado_guardado
    );
  }

  // Recargar guardados desde almacenamiento local
  async recargarDesdeLocal(): Promise<void> {
    this.guardados = await this.obtenerGuardadosLocales();
  }

  // Sincronizar guardados locales con Firebase
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

    await this.localStorage.setItem('publicacionesGuardadas', noSincronizados);
  }

  // Obtener guardados ordenados por fecha (más recientes primero)
  getGuardadosOrdenadosPorFecha(): GuardaPublicacion[] {
    const ordenados = this.guardados
      .filter(g => g.estado_guardado)
      .sort((a, b) => {
        const timeA = a.fecha_guardado instanceof Date
          ? a.fecha_guardado.getTime()
          : this.esTimestamp(a.fecha_guardado)
            ? a.fecha_guardado.toDate().getTime()
            : 0;

        const timeB = b.fecha_guardado instanceof Date
          ? b.fecha_guardado.getTime()
          : this.esTimestamp(b.fecha_guardado)
            ? b.fecha_guardado.toDate().getTime()
            : 0;

        return timeB - timeA;
      });

    console.log('Guardados ordenados por fecha (más recientes primero):');
    ordenados.forEach(g => {
      console.log(`id_publicacion: ${g.id_publicacion}, fecha_guardado: ${g.fecha_guardado}`);
    });

    return ordenados;
  }
// Eliminar guardado de una publicación para un usuario específico
async eliminarGuardado(idUsuario: string, idPublicacion: string): Promise<void> {
  try {
    await this.firebaseService.eliminarGuardado(idUsuario, idPublicacion);

    // Quitar de la lista local en memoria
    this.guardados = this.guardados.filter(
      g => !(g.id_usuario === idUsuario && g.id_publicacion === idPublicacion)
    );

    // Actualizar almacenamiento local
    await this.localStorage.setItem('publicacionesGuardadas', this.guardados);
  } catch (error) {
    console.error('Error eliminando guardado:', error);
  }
}


}
