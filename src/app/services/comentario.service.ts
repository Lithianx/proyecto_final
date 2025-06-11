
import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage-social.service';
import { Comentario } from 'src/app/models/comentario.model';

@Injectable({ providedIn: 'root' })
export class ComentarioService {
  private comentariosEnMemoria: Comentario[] = [];

  constructor(private localStorage: LocalStorageService) {}

  // Cargar comentarios en memoria (llamar en ngOnInit)
  async cargarComentarios(): Promise<void> {
    this.comentariosEnMemoria = await this.localStorage.getList<Comentario>('comentarios') || [];
  }

  // Obtener todos los comentarios en memoria
  getComentarios(): Comentario[] {
    return this.comentariosEnMemoria;
  }

  // Obtener comentarios por publicación
  getComentariosPorPublicacion(id_publicacion: number): Comentario[] {
    return this.comentariosEnMemoria
      .filter(c => c.id_publicacion === id_publicacion)
      .sort((a, b) => b.fecha_comentario.getTime() - a.fecha_comentario.getTime());
  }

  // Agregar un comentario
  async agregarComentario(comentario: Comentario): Promise<void> {
    this.comentariosEnMemoria.push(comentario);
    await this.localStorage.setItem('comentarios', this.comentariosEnMemoria);
  }

  // Actualizar un comentario existente
  async actualizarComentario(comentario: Comentario): Promise<void> {
    const idx = this.comentariosEnMemoria.findIndex(c => c.id_comentario === comentario.id_comentario);
    if (idx !== -1) {
      this.comentariosEnMemoria[idx] = comentario;
      await this.localStorage.setItem('comentarios', this.comentariosEnMemoria);
    }
  }

  // Eliminar un comentario
  async eliminarComentario(id_comentario: number): Promise<void> {
    this.comentariosEnMemoria = this.comentariosEnMemoria.filter(c => c.id_comentario !== id_comentario);
    await this.localStorage.setItem('comentarios', this.comentariosEnMemoria);
  }

  getComentariosOrdenadosPorFecha(id_publicacion: number): Comentario[] {
  return this.getComentariosPorPublicacion(id_publicacion)
    .sort((a, b) => b.fecha_comentario.getTime() - a.fecha_comentario.getTime());
}
}