import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage-social.service';
import { Like } from '../models/like.model';

@Injectable({ providedIn: 'root' })
export class LikeService {
  private likes: Like[] = [];

  constructor(private localStorage: LocalStorageService) {}

  // Cargar likes en memoria (llamar en ngOnInit del componente)
  async cargarLikes(): Promise<void> {
    this.likes = await this.localStorage.getList<Like>('publicacionLikes') || [];
  }

  // Obtener todos los likes en memoria
  getLikes(): Like[] {
    return this.likes;
  }

  // Dar o quitar like a una publicación
  async toggleLike(idUsuario: number, idPublicacion: number): Promise<void> {
    const like = this.likes.find(l => l.id_usuario === idUsuario && l.id_publicacion === idPublicacion);
    if (like) {
      like.estado_like = !like.estado_like;
      like.fecha_like = new Date();
    } else {
      this.likes.push({
        id_usuario: idUsuario,
        id_publicacion: idPublicacion,
        fecha_like: new Date(),
        estado_like: true
      });
    }
    await this.localStorage.setItem('publicacionLikes', this.likes);
  }

  // Contar likes de una publicación
  getLikesCount(idPublicacion: number): number {
    return this.likes.filter(l => l.id_publicacion === idPublicacion && l.estado_like).length;
  }

  // Saber si el usuario ya dio like a una publicación
  usuarioLikeo(idUsuario: number, idPublicacion: number): boolean {
    return !!this.likes.find(l =>
      l.id_usuario === idUsuario &&
      l.id_publicacion === idPublicacion &&
      l.estado_like
    );
  }
}