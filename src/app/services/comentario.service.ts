import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage-social.service';
import { Comentario } from 'src/app/models/comentario.model';
import { FirebaseService } from './firebase.service';
import { Observable } from 'rxjs';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class ComentarioService {
  private comentariosEnMemoria: Comentario[] = [];
  comentarios$: Observable<Comentario[]>;
  constructor(
    private localStorage: LocalStorageService,
    private firebaseService: FirebaseService,
    private firestore: Firestore
  ) {
    const comentariosRef = collection(this.firestore, 'Comentario');
    this.comentarios$ = collectionData(comentariosRef, { idField: 'id_comentario' }) as Observable<Comentario[]>;
  }

  // Cargar comentarios en memoria (llamar en ngOnInit)
  async cargarComentarios(): Promise<void> {
    if (navigator.onLine) {
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
    if (navigator.onLine) {
      const id = await this.firebaseService.addComentario(comentario);
      const comentarioConId = { ...comentario, id_comentario: id };
      this.comentariosEnMemoria.push(comentarioConId);
      await this.localStorage.setItem('comentarios', this.comentariosEnMemoria);
    } else {
      const id = Date.now().toString();
      const comentarioConId = { ...comentario, id_comentario: id };
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
    if (navigator.onLine) {
      await this.firebaseService.removeComentario(id_comentario);
    }
    await this.localStorage.setItem('comentarios', this.comentariosEnMemoria);
  }

  getComentariosOrdenadosPorFecha(id_publicacion: string): Comentario[] {
    return this.getComentariosPorPublicacion(id_publicacion)
      .sort((a, b) => b.fecha_comentario.getTime() - a.fecha_comentario.getTime());
  }
}