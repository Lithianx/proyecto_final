import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage-social.service';
import { Comentario } from 'src/app/models/comentario.model';
import { FirebaseService } from './firebase.service';
import { Observable } from 'rxjs';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { UtilsService } from './utils.service';
import { PublicacionService } from './publicacion.service';

@Injectable({ providedIn: 'root' })
export class ComentarioService {
  private comentariosEnMemoria: Comentario[] = [];
  comentarios$: Observable<Comentario[]>;
  constructor(
    private localStorage: LocalStorageService,
    private firebaseService: FirebaseService,
    private firestore: Firestore,
    private utilsService: UtilsService,
    private publicacionService: PublicacionService
  ) {
    const comentariosRef = collection(this.firestore, 'Comentario');
    this.comentarios$ = collectionData(comentariosRef, { idField: 'id_comentario' }) as Observable<Comentario[]>;
  }

  // Cargar comentarios en memoria (llamar en ngOnInit)
  async cargarComentarios(): Promise<void> {
    const online = await this.utilsService.checkInternetConnection();
    if (online) {
      try {
        this.comentariosEnMemoria = await this.firebaseService.getComentarios();
        await this.localStorage.setItem('comentarios', this.comentariosEnMemoria);
      } catch {
        this.comentariosEnMemoria = await this.localStorage.getList<Comentario>('comentarios') || [];
      }
    } else {
      this.comentariosEnMemoria = await this.localStorage.getList<Comentario>('comentarios') || [];
    }
  }

  // Obtener todos los comentarios en memoria
  getComentarios(): Comentario[] {
    return this.comentariosEnMemoria;
  }

  // Obtener comentarios por publicación (id_publicacion ahora string)
  getComentariosPorPublicacion(id_publicacion: string): Comentario[] {
    return this.comentariosEnMemoria
      .filter(c => c.id_publicacion === id_publicacion)
      .sort((a, b) => b.fecha_comentario.getTime() - a.fecha_comentario.getTime());
  }

  // Agregar un comentario
  async agregarComentario(comentario: Comentario): Promise<void> {
    const online = await this.utilsService.checkInternetConnection();
    if (online) {
      const id = await this.firebaseService.addComentario(comentario);
      const comentarioConId = { ...comentario, id_comentario: id };
      this.comentariosEnMemoria.push(comentarioConId);
      await this.localStorage.setItem('comentarios', this.comentariosEnMemoria);
    } else {
    const id = Date.now().toString();
    const comentarioConId = {
      ...comentario,
      id_comentario: id,
      fecha_comentario: new Date() // Solo local/offline
    };
    this.comentariosEnMemoria.push(comentarioConId);
    await this.localStorage.setItem('comentarios', this.comentariosEnMemoria);
  }
  }

  // Actualizar un comentario existente
  async actualizarComentario(comentario: Comentario): Promise<void> {
    const idx = this.comentariosEnMemoria.findIndex(c => c.id_comentario === comentario.id_comentario);
    if (idx !== -1) {
      this.comentariosEnMemoria[idx] = comentario;
      if (navigator.onLine) {
        await this.firebaseService.updateComentario(comentario);
      }
      await this.localStorage.setItem('comentarios', this.comentariosEnMemoria);
    }
  }

  // Eliminar un comentario (id_comentario ahora string)
  async eliminarComentario(id_comentario: string): Promise<void> {
    this.comentariosEnMemoria = this.comentariosEnMemoria.filter(c => c.id_comentario !== id_comentario);
    const online = await this.utilsService.checkInternetConnection();
    if (online) {
      await this.firebaseService.removeComentario(id_comentario);
    }
    await this.localStorage.setItem('comentarios', this.comentariosEnMemoria);
  }

  getComentariosOrdenadosPorFecha(id_publicacion: string): Comentario[] {
    return this.getComentariosPorPublicacion(id_publicacion)
      .sort((a, b) => b.fecha_comentario.getTime() - a.fecha_comentario.getTime());
  }



// Sincronizar comentarios locales pendientes con Firebase
async sincronizarComentariosLocales(): Promise<void> {
  const online = await this.utilsService.checkInternetConnection();
  if (!online) return;

  // Obtén todos los comentarios locales
  const comentariosLocales = await this.localStorage.getList<Comentario>('comentarios') || [];
  const sincronizados: Comentario[] = [];
  const noSincronizados: Comentario[] = [];

  for (const comentario of comentariosLocales) {
    // Si el id_comentario es numérico (creado offline), intenta sincronizar
    if (!comentario.id_comentario || !isNaN(Number(comentario.id_comentario))) {
      try {
        // Verifica si la publicación existe antes de sincronizar
        const publicacion = await this.publicacionService.getPublicacionById(comentario.id_publicacion);
        if (!publicacion) {
          console.error(`No se pudo sincronizar el comentario porque la publicación con id ${comentario.id_publicacion} no existe.`);
          noSincronizados.push(comentario);
          continue;
        }
        const id = await this.firebaseService.addComentario(comentario);
        comentario.id_comentario = id;
        sincronizados.push(comentario);
      } catch (error) {
        noSincronizados.push(comentario);
      }
    } else {
      // Ya sincronizado previamente
      sincronizados.push(comentario);
    }
  }

  // Guarda solo los no sincronizados para el próximo intento
  await this.localStorage.setItem('comentarios', [...noSincronizados, ...sincronizados]);
}
}