import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage-social.service';
import { Publicacion } from '../models/publicacion.model';
import { Seguir } from '../models/seguir.model';

@Injectable({ providedIn: 'root' })
export class PublicacionService {
  constructor(private localStorage: LocalStorageService) { }

  // Obtiene publicaciones según conexión (y con precarga si no hay)
  async getPublicaciones(): Promise<Publicacion[]> {
    let publicaciones: Publicacion[] | null = null;
    // if (navigator.onLine) {
    //   publicaciones = await this.firebaseService.getPublicaciones();
    // }
    if (!publicaciones) {
      publicaciones = await this.localStorage.getList<Publicacion>('publicaciones');
    }
    if (!publicaciones || publicaciones.length === 0) {
      publicaciones = this.getPublicacionesPorDefecto();
      await this.localStorage.setItem('publicaciones', publicaciones);
    }
    // Ordenar por fecha descendente
    publicaciones.sort((a, b) => new Date(b.fecha_publicacion).getTime() - new Date(a.fecha_publicacion).getTime());
    return publicaciones;
  }

  // Publicaciones simuladas por defecto
  private getPublicacionesPorDefecto(): Publicacion[] {
    return [
      {
        id_publicacion: '1',
        id_usuario: '1',
        contenido: '¡Esa victoria fue épica! 🎮💥',
        imagen: 'https://raw.githubusercontent.com/R-CoderDotCom/samples/main/bird.png',
        fecha_publicacion: new Date('2024-05-01T15:30:00')
      },
      {
        id_publicacion: '2',
        id_usuario: '2',
        contenido: '¡Acabamos de ganar una partida en squad! 🏆🎮',
        imagen: '',
        fecha_publicacion: new Date('2024-06-01T12:00:00')
      },
      {
        id_publicacion: '3',
        id_usuario: '3',
        contenido: '¡Acabamos de ganar una partida en squad! 🏆🎮',
        imagen: 'https://ionicframework.com/docs/img/demos/card-media.png',
        fecha_publicacion: new Date('2023-06-01T09:00:00')
      }
    ];
  }

  // Obtiene publicación por ID según conexión (id ahora string)
  async getPublicacionById(id: string): Promise<Publicacion | undefined> {
    const publicaciones = await this.getPublicaciones();
    return publicaciones.find(p => p.id_publicacion === id);
  }

  // Agrega publicación según conexión
  async addPublicacion(publicacion: Publicacion) {
    if (navigator.onLine) {
      // await this.firebaseService.addPublicacion(publicacion);
      await this.localStorage.addToList<Publicacion>('publicaciones', publicacion);
    } else {
      await this.localStorage.addToList<Publicacion>('publicaciones_personal', publicacion);
    }
  }

  // Edita publicación según conexión
  async updatePublicacion(publicacion: Publicacion) {
    if (navigator.onLine) {
      // const publicaciones = await this.firebaseService.updatePublicacion(publicacion);
      const publicaciones = await this.localStorage.getList<Publicacion>('publicaciones') || [];
      const actualizadas = publicaciones.map(p =>
        p.id_publicacion === publicacion.id_publicacion ? { ...publicacion } : p
      );
      await this.localStorage.setItem('publicaciones', actualizadas);
    } else {
      await this.updatePublicacionPersonal(publicacion);
    }
  }

  // Elimina publicación según conexión
  async removePublicacion(id: string) {
    if (navigator.onLine) {
      // const publicaciones = await this.firebaseService.removePublicacion(id);
      const publicaciones = await this.localStorage.getList<Publicacion>('publicaciones') || [];
      const filtradas = publicaciones.filter(p => p.id_publicacion !== id);
      await this.localStorage.setItem('publicaciones', filtradas);
    } else {
      await this.removePublicacionPersonal(id);
    }
  }

  async getNextId(): Promise<string> {
    const publicaciones = await this.getPublicaciones();
    if (publicaciones.length > 0) {
      const maxId = Math.max(...publicaciones.map(p => Number(p.id_publicacion)));
      return (maxId + 1).toString();
    }
    return '1';
  }

  // Publicaciones personales (creadas offline, no sincronizadas)
  async getPublicacionesPersonal(): Promise<Publicacion[]> {
    const publicaciones = await this.localStorage.getList<Publicacion>('publicaciones_personal') || [];
    // Ordenar por fecha descendente
    return publicaciones.sort((a, b) => new Date(b.fecha_publicacion).getTime() - new Date(a.fecha_publicacion).getTime());
  }

  async addPublicacionPersonal(publicacion: Publicacion) {
    if (navigator.onLine) {
      // await this.firebaseService.addPublicacion(publicacion);
      await this.localStorage.addToList<Publicacion>('publicaciones_personal', publicacion);
    } else {
      await this.localStorage.addToList<Publicacion>('publicaciones_personal', publicacion);
    }
  }

  async updatePublicacionPersonal(publicacion: Publicacion) {
    // if (navigator.onLine) {
    //   await this.firebaseService.updatePublicacion(publicacion);
    // } else {
      const publicaciones = await this.getPublicacionesPersonal();
      const actualizadas = publicaciones.map(p =>
        p.id_publicacion === publicacion.id_publicacion ? { ...publicacion } : p
      );
      await this.localStorage.setItem('publicaciones_personal', actualizadas);
    // }
  }

  // Elimina publicación personal según conexión
  async removePublicacionPersonal(id: string) {
    if (navigator.onLine) {
      // await this.firebaseService.removePublicacion(id);
    } else {
      const publicaciones = await this.getPublicacionesPersonal();
      const filtradas = publicaciones.filter(p => p.id_publicacion !== id);
      await this.localStorage.setItem('publicaciones_personal', filtradas);
    }
  }

  async getNextPersonalId(): Promise<string> {
    const publicaciones = await this.getPublicacionesPersonal();
    if (publicaciones.length > 0) {
      const maxId = Math.max(...publicaciones.map(p => Number(p.id_publicacion)));
      return (maxId + 1).toString();
    }
    return '1';
  }

  // Sincroniza publicaciones personales cuando haya internet
  async sincronizarPublicacionesPersonales() {
    const personales = await this.getPublicacionesPersonal();
    for (const pub of personales) {
      // await this.firebaseService.addPublicacion(pub);
      await this.localStorage.addToList<Publicacion>('publicaciones', pub);
    }
    await this.localStorage.setItem('publicaciones_personal', []);
  }

  getPublicacionesDeSeguidos(publicaciones: Publicacion[], seguimientos: Seguir[], idUsuario: string): Publicacion[] {
    const idsSeguidos = seguimientos
      .filter(s => s.id_usuario_seguidor === idUsuario && s.estado_seguimiento)
      .map(s => s.id_usuario_seguido);
    return publicaciones
      .filter(pub => idsSeguidos.includes(pub.id_usuario))
      .sort((a, b) => new Date(b.fecha_publicacion).getTime() - new Date(a.fecha_publicacion).getTime());
  }

  getPublicacionesFiltradas(
    publicaciones: Publicacion[],
    seguimientos: Seguir[],
    usuarioActualId: string,
    filtro: 'publico' | 'seguidos'
  ): Publicacion[] {
    if (filtro === 'publico') {
      return publicaciones;
    } else {
      return this.getPublicacionesDeSeguidos(publicaciones, seguimientos, usuarioActualId);
    }
  }
}