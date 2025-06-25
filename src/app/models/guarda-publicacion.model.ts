import { Timestamp } from 'firebase/firestore';

export interface GuardaPublicacion {
  id_publicacion: string;
  id_usuario: string;
  fecha_guardado: Date | Timestamp;  // <-- Permitir ambos tipos
  estado_guardado: boolean;
}