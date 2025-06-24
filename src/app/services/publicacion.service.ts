import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage-social.service';
import { Publicacion } from '../models/publicacion.model';
import { Seguir } from '../models/seguir.model';
import { FirebaseService } from './firebase.service';
import { Firestore, collection, collectionData, serverTimestamp } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { UtilsService } from './utils.service';

@Injectable({ providedIn: 'root' })
export class PublicacionService {
  publicaciones$: Observable<Publicacion[]>;
  constructor(private localStorage: LocalStorageService,
    private firebaseService: FirebaseService,
    private firestore: Firestore,
    private utilsService: UtilsService
  ) {
    const publicacionesRef = collection(this.firestore, 'Publicacion');
    this.publicaciones$ = collectionData(publicacionesRef, { idField: 'id_publicacion' }) as Observable<Publicacion[]>;
  }

  // Obtiene publicaciones según conexión (y con precarga si no hay)
  async getPublicaciones(): Promise<Publicacion[]> {
    let publicaciones: Publicacion[] | null = null;
    const online = await this.utilsService.checkInternetConnection();
    if (online) {
      publicaciones = await this.firebaseService.getPublicaciones();
    }
    if (!publicaciones) {
      publicaciones = await this.localStorage.getList<Publicacion>('publicaciones');
    }
    if (!publicaciones || publicaciones.length === 0) {
      publicaciones = [];
    }
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
  const online = await this.utilsService.checkInternetConnection();
  if (online) {
    // No agregues fecha_publicacion aquí, la pone el servidor
    const id = await this.firebaseService.addPublicacion(publicacion);
    const publicacionConId = { ...publicacion, id_publicacion: id };
    await this.localStorage.addToList<Publicacion>('publicaciones', publicacionConId);
    return id;
  } else {
    const id = Date.now().toString();
    const publicacionConId = {
      ...publicacion,
      id_publicacion: id,
      fecha_publicacion: new Date() // Solo local/offline
    };
    await this.localStorage.addToList<Publicacion>('publicaciones_personal', publicacionConId);
    return id;
  }
}

  // Edita publicación según conexión
  async updatePublicacion(publicacion: Publicacion) {
    const online = await this.utilsService.checkInternetConnection();
    if (online) {
      await this.firebaseService.updatePublicacion(publicacion);
      const publicaciones = await this.localStorage.getList<Publicacion>('publicaciones') || [];
      const actualizadas = publicaciones.map(p =>
        p.id_publicacion === publicacion.id_publicacion ? { ...publicacion } : p
      );
      await this.localStorage.setItem('publicaciones', actualizadas);

      const personales = await this.getPublicacionesPersonal();
      const filtradas = personales.filter(p => p.id_publicacion !== publicacion.id_publicacion);
      await this.localStorage.setItem('publicaciones_personal', filtradas);
    } else {
      await this.updatePublicacionPersonal(publicacion);
    }
  }

  // Elimina publicación según conexión
  async removePublicacion(id: string) {
    const online = await this.utilsService.checkInternetConnection();
    if (online) {
      await this.firebaseService.removePublicacion(id);
      await this.firebaseService.removeGuardadosByPublicacion(id);
      await this.firebaseService.removeLikesByPublicacion(id);
      await this.firebaseService.removeComentariosByPublicacion(id);
      await this.firebaseService.removeComentarioLikesByPublicacion(id);

      const publicaciones = await this.localStorage.getList<Publicacion>('publicaciones') || [];
      const filtradas = publicaciones.filter(p => p.id_publicacion !== id);
      await this.localStorage.setItem('publicaciones', filtradas);

      await this.localStorage.removeItemsByField('publicacionesGuardadas', 'id_publicacion', id);
      await this.localStorage.removeItemsByField('publicacionLikes', 'id_publicacion', id);
      await this.localStorage.removeItemsByField('comentarioLikes', 'id_publicacion', id);
      await this.localStorage.removeItemsByField('comentarios', 'id_publicacion', id);
    } else {
      await this.removePublicacionPersonal(id);
      await this.localStorage.removeItemsByField('publicacionesGuardadas', 'id_publicacion', id);
      await this.localStorage.removeItemsByField('publicacionLikes', 'id_publicacion', id);
      await this.localStorage.removeItemsByField('comentarioLikes', 'id_publicacion', id);
      await this.localStorage.removeItemsByField('comentarios', 'id_publicacion', id);
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
    const online = await this.utilsService.checkInternetConnection();
    if (!online) return;

    const personales = await this.getPublicacionesPersonal();
    const sincronizadas: Publicacion[] = [];
    const noSincronizadas: Publicacion[] = [];

    for (const pub of personales) {
      try {
        const id = await this.firebaseService.addPublicacion(pub);
        pub.id_publicacion = id;
        await this.localStorage.addToList<Publicacion>('publicaciones', pub);
        sincronizadas.push(pub);
      } catch (e) {
        // Si falla, la dejamos para intentar después
        noSincronizadas.push(pub);
      }
    }
    // Solo elimina las que sí se sincronizaron
    await this.localStorage.setItem('publicaciones_personal', noSincronizadas);
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