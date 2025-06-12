import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage-social.service';
import { Publicacion } from '../models/publicacion.model';
import { Seguir } from '../models/seguir.model';
import { FirebaseService } from './firebase.service';

@Injectable({ providedIn: 'root' })
export class PublicacionService {
  constructor(private localStorage: LocalStorageService,
    private firebaseService: FirebaseService
  ) { }

  // Obtiene publicaciones según conexión (y con precarga si no hay)
  async getPublicaciones(): Promise<Publicacion[]> {
    let publicaciones: Publicacion[] | null = null;
    if (navigator.onLine) {
      publicaciones = await this.firebaseService.getPublicaciones();
    }
    if (!publicaciones) {
      publicaciones = await this.localStorage.getList<Publicacion>('publicaciones');
    }
    if (!publicaciones || publicaciones.length === 0) {
      publicaciones = [];
    }
    // Ordenar por fecha descendente
    publicaciones.sort((a, b) => new Date(b.fecha_publicacion).getTime() - new Date(a.fecha_publicacion).getTime());
    return publicaciones;
  }

                        ////ONLINE//////

  // Obtiene publicación por ID según conexión
  async getPublicacionById(id: string): Promise<Publicacion | undefined> {
    const publicaciones = await this.getPublicaciones();
    return publicaciones.find(p => p.id_publicacion === id);
  }

  // Agrega publicación según conexión
async addPublicacion(publicacion: Publicacion) {
  if (navigator.onLine) {
    const id = await this.firebaseService.addPublicacion(publicacion);
    // Asigna el id generado por Firebase antes de guardar en localStorage
    const publicacionConId = { ...publicacion, id_publicacion: id };
    await this.localStorage.addToList<Publicacion>('publicaciones', publicacionConId);
    return id;
  } else {
    const id = Date.now().toString();
    const publicacionConId = { ...publicacion, id_publicacion: id };
    await this.localStorage.addToList<Publicacion>('publicaciones_personal', publicacionConId);
    return id;
  }
}

  // Edita publicación según conexión
  async updatePublicacion(publicacion: Publicacion) {
    if (navigator.onLine) {
      await this.firebaseService.updatePublicacion(publicacion);
      // Actualiza también el localStorage para mantener la caché sincronizada
      const publicaciones = await this.localStorage.getList<Publicacion>('publicaciones') || [];
      const actualizadas = publicaciones.map(p =>
        p.id_publicacion === publicacion.id_publicacion ? { ...publicacion } : p
      );
      await this.localStorage.setItem('publicaciones', actualizadas);

      // Si la publicación estaba en publicaciones_personal (pendiente de sincronizar), elimínala
      const personales = await this.getPublicacionesPersonal();
      const filtradas = personales.filter(p => p.id_publicacion !== publicacion.id_publicacion);
      await this.localStorage.setItem('publicaciones_personal', filtradas);
    } else {
      // Si no hay conexión, guarda el cambio en publicaciones_personal para sincronizar después
      await this.updatePublicacionPersonal(publicacion);
    }
  }

  // Elimina publicación según conexión
  async removePublicacion(id: string) {
    if (navigator.onLine) {
      await this.firebaseService.removePublicacion(id);
      // Actualiza el localStorage principal
      const publicaciones = await this.localStorage.getList<Publicacion>('publicaciones') || [];
      const filtradas = publicaciones.filter(p => p.id_publicacion !== id);
      await this.localStorage.setItem('publicaciones', filtradas);

      // También elimina de publicaciones_personal si existía pendiente de sincronizar
      const personales = await this.getPublicacionesPersonal();
      const personalesFiltradas = personales.filter(p => p.id_publicacion !== id);
      await this.localStorage.setItem('publicaciones_personal', personalesFiltradas);
    } else {
      await this.removePublicacionPersonal(id);
    }
  }

                        ////OFFLINE//////

  // Publicaciones personales (creadas offline, no sincronizadas)
  async getPublicacionesPersonal(): Promise<Publicacion[]> {
    const publicaciones = await this.localStorage.getList<Publicacion>('publicaciones_personal') || [];
    // Ordenar por fecha descendente
    return publicaciones.sort((a, b) => new Date(b.fecha_publicacion).getTime() - new Date(a.fecha_publicacion).getTime());
  }


  async updatePublicacionPersonal(publicacion: Publicacion) {
    const publicaciones = await this.getPublicacionesPersonal();
    const actualizadas = publicaciones.map(p =>
      p.id_publicacion === publicacion.id_publicacion ? { ...publicacion } : p
    );
    await this.localStorage.setItem('publicaciones_personal', actualizadas);
  }

  // Elimina publicación personal según conexión
  async removePublicacionPersonal(id: string) {
    const publicaciones = await this.getPublicacionesPersonal();
    const filtradas = publicaciones.filter(p => p.id_publicacion !== id);
    await this.localStorage.setItem('publicaciones_personal', filtradas);
  }






  // Sincroniza publicaciones personales cuando haya internet
  async sincronizarPublicacionesPersonales() {
    if (!navigator.onLine) return;

    const personales = await this.getPublicacionesPersonal();
    for (const pub of personales) {
      // Sube la publicación a Firebase y obtiene el nuevo ID
      const id = await this.firebaseService.addPublicacion(pub);
      // Actualiza el id_publicacion con el generado por Firebase
      pub.id_publicacion = id;
      // Guarda en el localStorage principal
      await this.localStorage.addToList<Publicacion>('publicaciones', pub);
    }
    // Limpia las publicaciones personales pendientes
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