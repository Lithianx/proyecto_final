import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';  // Ajusta ruta si es necesario
import { Notificacion } from '../models/notificacion.model';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {

  constructor(private firebaseService: FirebaseService) {}

  // Crear y guardar notificación usando FirebaseService
  async crearNotificacion(
    tipoAccion: string,
    idUserHecho: string,
    idUserReceptor: string,
    idUserObjet?: string
  ) {
    try {
      const nuevaNotificacion: Notificacion = {
        tipoAccion,
        idUserHecho,
        idUserReceptor,
        idUserObjet,
        estado: false // ✅ Nueva notificación se marca como no leída
      };
      await this.firebaseService.addNotificacion(nuevaNotificacion);
    } catch (error) {
      console.error('Error al crear la notificación:', error);
    }
  }
  async getNotificacionesConDatos(idUserReceptor: string): Promise<any[]> {
  try {
    // 1. Obtener todas las notificaciones para el receptor
    const notificaciones = await this.firebaseService.getTodasNotificaciones();
    
    // Filtrar solo las notificaciones del usuario receptor
    const notificacionesFiltradas = notificaciones.filter(n => n.idUserReceptor === idUserReceptor);

    const usuarios = await this.firebaseService.getUsuarios();
    const publicaciones = await this.firebaseService.getPublicaciones();

    const notificacionesEnriquecidas = notificacionesFiltradas.map(notificacion => {
      // Buscar usuario que hizo la acción
      const usuarioHecho = usuarios.find(u => u.id_usuario === notificacion.idUserHecho);

      // Buscar publicación relacionada si existe idUserObjet
      const publicacionRelacionada = notificacion.idUserObjet
        ? publicaciones.find(p => p.id_publicacion === notificacion.idUserObjet)
        : null;

      return {
        ...notificacion,
        nombre_usuario: usuarioHecho?.nombre_usuario || 'Desconocido',
        fotoPerfil: usuarioHecho?.fotoPerfil || '',
        imagenPublicacion: publicacionRelacionada?.imagen || null
      };
    });

    return notificacionesEnriquecidas;

  } catch (error) {
    console.error('Error obteniendo notificaciones enriquecidas:', error);
    return [];
  }
}


}
