export interface Notificacion {
  tipoAccion: string;           // Ej: "like", "comentario", "seguimiento"
  idUserHecho: string;          // Usuario que realiza la acción
  idUserReceptor: string;       // Usuario que recibe la notificación
  fecha?: Date;                 // Se asigna con serverTimestamp()
  idUserObjet?: string;         // Objeto relacionado (opcional)
  id_notificacion?: string;     // ID generado por Firestore
  estado: boolean;              // ✅ Estado: true = leída, false = nueva (por defecto)
}
