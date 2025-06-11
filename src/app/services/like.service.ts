import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage-social.service';
import { Like } from '../models/like.model';

@Injectable({ providedIn: 'root' })
export class LikeService {
  private likes: Like[] = [];
  private likesComentarios: Like[] = [];

  constructor(private localStorage: LocalStorageService) {}

  // Cargar likes de publicaciones en memoria
  async cargarLikes(): Promise<void> {
    this.likes = await this.localStorage.getList<Like>('publicacionLikes') || [];
  }

  // Cargar likes de comentarios en memoria
  async cargarLikesComentarios(): Promise<void> {
    this.likesComentarios = await this.localStorage.getList<Like>('comentarioLikes') || [];
  }

  // Obtener todos los likes de publicaciones en memoria
  getLikes(): Like[] {
    return this.likes;
  }

  // Obtener todos los likes de comentarios en memoria
  getLikesComentarios(): Like[] {
    return this.likesComentarios;
  }

  // Dar o quitar like a una publicación (ahora string)
  async toggleLike(idUsuario: string, idPublicacion: string): Promise<void> {
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

  // Dar o quitar like a un comentario (ahora string)
  async toggleLikeComentario(idUsuario: string, idComentario: string): Promise<void> {
    const like = this.likesComentarios.find(l => l.id_usuario === idUsuario && l.id_comentario === idComentario);
    if (like) {
      like.estado_like = !like.estado_like;
      like.fecha_like = new Date();
    } else {
      this.likesComentarios.push({
        id_usuario: idUsuario,
        id_comentario: idComentario,
        fecha_like: new Date(),
        estado_like: true
      });
    }
    await this.localStorage.setItem('comentarioLikes', this.likesComentarios);
  }

  // Contar likes de una publicación (ahora string)
  getLikesCount(idPublicacion: string): number {
    return this.likes.filter(l => l.id_publicacion === idPublicacion && l.estado_like).length;
  }

  // Contar likes de un comentario (ahora string)
  getLikesCountComentario(idComentario: string): number {
    return this.likesComentarios.filter(l => l.id_comentario === idComentario && l.estado_like).length;
  }

  // Saber si el usuario ya dio like a una publicación (ahora string)
  usuarioLikeo(idUsuario: string, idPublicacion: string): boolean {
    return !!this.likes.find(l =>
      l.id_usuario === idUsuario &&
      l.id_publicacion === idPublicacion &&
      l.estado_like
    );
  }

  // Saber si el usuario ya dio like a un comentario (ahora string)
  usuarioLikeoComentario(idUsuario: string, idComentario: string): boolean {
    return !!this.likesComentarios.find(l =>
      l.id_usuario === idUsuario &&
      l.id_comentario === idComentario &&
      l.estado_like
    );
  }
}