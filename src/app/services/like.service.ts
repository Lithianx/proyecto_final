import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Like } from '../models/like.model';
import { FirebaseService } from './firebase.service';

@Injectable({ providedIn: 'root' })
export class LikeService {
  likesComentarios$: Observable<Like[]>;
  likesPublicaciones$: Observable<Like[]>;

  constructor(
    private firebaseService: FirebaseService,
    private firestore: Firestore
  ) {
    const likesComentariosRef = collection(this.firestore, 'Like');
    this.likesComentarios$ = collectionData(likesComentariosRef, { idField: 'id_like' }) as Observable<Like[]>;

    const likesPublicacionesRef = collection(this.firestore, 'Like');
    this.likesPublicaciones$ = collectionData(likesPublicacionesRef, { idField: 'id_like' }) as Observable<Like[]>;
  }

  // Dar o quitar like a un comentario
  async toggleLikeComentario(idUsuario: string, idComentario: string): Promise<void> {
    await this.firebaseService.toggleLikeComentario(idUsuario, idComentario);
  }

  // Dar o quitar like a una publicación
  async toggleLike(idUsuario: string, idPublicacion: string): Promise<void> {
    await this.firebaseService.toggleLikePublicacion(idUsuario, idPublicacion);
  }
}