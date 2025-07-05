export interface Notificacion {
  tipoAccion: string;       // Ej: "like", "comentario", "seguimiento"
  idUserHecho: string;      // ID del usuario que realizó la acción
  idUserReceptor: string;   // ID del usuario que recibe la notificación
  fecha: Date; 
  idUserObjet?: string;
  idnotificacion: string;             
}