import { Injectable } from '@angular/core';
import { Mensaje } from '../models/mensaje.model';
import { Usuario } from '../models/usuario.model';
import { Conversacion } from '../models/conversacion.model';
import { Publicacion } from '../models/publicacion.model';
import { LocalStorageService } from './local-storage-social.service';
import { FirebaseService } from './firebase.service';

import { Firestore, collection, collectionData, query, where, getDocs, addDoc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComunicacionService {
  mensajes$: Observable<Mensaje[]>;
  conversaciones$: Observable<Conversacion[]>;

  constructor(
    private localStorage: LocalStorageService,
    private firebaseService: FirebaseService,
    private firestore: Firestore
  ) {
    const mensajesRef = collection(this.firestore, 'Mensaje');
    this.mensajes$ = collectionData(mensajesRef, { idField: 'id_mensaje' }) as Observable<Mensaje[]>;

    const conversacionesRef = collection(this.firestore, 'Conversacion');
    this.conversaciones$ = collectionData(conversacionesRef, { idField: 'id_conversacion' }) as Observable<Conversacion[]>;
  }

  // Filtrar mensajes por conversación (en el componente, tras suscribirse)
  filtrarMensajesPorConversacion(mensajes: Mensaje[], id_conversacion: string): Mensaje[] {
    return mensajes.filter(m => String(m.id_conversacion) === id_conversacion);
  }

  // Filtrar conversaciones por nombre de usuario
  filtrarConversacionesPorNombre(
    conversaciones: Conversacion[],
    usuarios: Usuario[],
    query: string
  ): Conversacion[] {
    return conversaciones.filter(conv => {
      const usuario = usuarios.find(
        u => u.id_usuario === conv.id_usuario_emisor || u.id_usuario === conv.id_usuario_receptor
      );
      return usuario ? usuario.nombre_usuario.toLowerCase().includes(query) : false;
    });
  }

  // Obtener el último mensaje de una conversación
  getUltimoMensajeDeConversacion(mensajes: Mensaje[], id_conversacion: string): Mensaje | undefined {
    return mensajes
      .filter(m => String(m.id_conversacion) === id_conversacion)
      .sort((a, b) => {
        const fechaA = a.fecha_envio instanceof Date
          ? a.fecha_envio.getTime()
          : (typeof a.fecha_envio === 'object' && a.fecha_envio !== null && 'toDate' in a.fecha_envio
              ? (a.fecha_envio as { toDate: () => Date }).toDate().getTime()
              : new Date(a.fecha_envio as string).getTime());
        const fechaB = b.fecha_envio instanceof Date
          ? b.fecha_envio.getTime()
          : (typeof b.fecha_envio === 'object' && b.fecha_envio !== null && 'toDate' in b.fecha_envio
              ? (b.fecha_envio as { toDate: () => Date }).toDate().getTime()
              : new Date(b.fecha_envio as string).getTime());
        return fechaB - fechaA;
      })[0];
  }

  // Enviar mensaje (agrega a Firestore)
async enviarMensaje(mensaje: Mensaje) {
  // Agrega el mensaje sin id_mensaje (Firestore genera el ID)
  const mensajesRef = collection(this.firestore, 'Mensaje');
  const docRef = await addDoc(mensajesRef, { ...mensaje, id_mensaje: '' });

  // Actualiza el campo id_mensaje con el ID generado por Firestore
  await updateDoc(docRef, { id_mensaje: docRef.id });
}

  // Marcar mensajes como vistos (actualiza en Firestore)
async marcarMensajesComoVistos(mensajes: Mensaje[], _id_conversacion: string, _idUsuarioActual: string) {
  // Solo marca como vistos los mensajes recibidos en el array
  for (const m of mensajes) {
    await this.firebaseService.updateMensaje({ ...m, estado_visto: true });
  }
}


  // Agregar conversación (agrega a Firestore)
async agregarConversacion(conversacion: Conversacion) {
  // Agrega la conversación sin id_conversacion (Firestore genera el ID)
  const conversacionesRef = collection(this.firestore, 'Conversacion');
  const docRef = await addDoc(conversacionesRef, { ...conversacion, id_conversacion: '' });

  // Actualiza el campo id_conversacion con el ID generado por Firestore
  await updateDoc(docRef, { id_conversacion: docRef.id });
}
  // Enviar mensaje multimedia
  async enviarMensajeMultimedia(
    tipo: 'imagen' | 'video' | 'audio',
    base64: string,
    idConversacion: string,
    idUsuario: string
  ) {
    const mensaje: Mensaje = {
      id_mensaje: new Date().getTime().toString(),
      id_conversacion: idConversacion,
      id_usuario_emisor: idUsuario,
      contenido: `[${tipo}] ${base64}`,
      fecha_envio: new Date(),
      estado_visto: false,
    };
    await this.enviarMensaje(mensaje);
  }

  // Respuestas automáticas
  async enviarRespuestaAutomatica(idConversacion: string, idUsuario: string, contenido: string = '¡Entendido!') {
    const respuesta: Mensaje = {
      id_mensaje: new Date().getTime().toString(),
      id_conversacion: idConversacion,
      id_usuario_emisor: idUsuario,
      contenido,
      fecha_envio: new Date(),
      estado_visto: false
    };
    await this.enviarMensaje(respuesta);
  }



async obtenerOcrearConversacionPrivada(idUsuario1: string, idUsuario2: string): Promise<string> {
  const conversacionesRef = collection(this.firestore, 'Conversacion');
  // Busca conversación donde los usuarios sean emisor/receptor en cualquier orden
  const q = query(
    conversacionesRef,
    where('id_usuario_emisor', 'in', [idUsuario1, idUsuario2]),
    where('id_usuario_receptor', 'in', [idUsuario1, idUsuario2])
  );
  const snapshot = await getDocs(q);

  // Filtra en memoria para asegurar que los dos usuarios son los únicos participantes
  const conversacionExistente = snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() as any }))
    .find(conv =>
      (conv.id_usuario_emisor === idUsuario1 && conv.id_usuario_receptor === idUsuario2) ||
      (conv.id_usuario_emisor === idUsuario2 && conv.id_usuario_receptor === idUsuario1)
    );

  if (conversacionExistente) {
    return conversacionExistente.id;
  } else {
    // No existe, crea una nueva
    const nuevaConversacion = {
      id_usuario_emisor: idUsuario1,
      id_usuario_receptor: idUsuario2,
      fecha_envio: new Date()
    };
    const docRef = await addDoc(conversacionesRef, nuevaConversacion);

        // Actualiza el campo id_conversacion con el ID generado por Firestore
    await updateDoc(docRef, { id_conversacion: docRef.id });
    
    return docRef.id;
  }
}



async enviarPublicacion(publicacion: Publicacion, id_conversacion: string, id_usuario_emisor: string) {
  const mensaje: Mensaje = {
    id_mensaje: '', // Se generará en Firestore
    id_conversacion: id_conversacion,
    id_usuario_emisor: id_usuario_emisor,
    contenido: JSON.stringify(publicacion), // Puedes guardar el objeto como string o solo el id
    fecha_envio: new Date(),
    estado_visto: false
  };
  await this.enviarMensaje(mensaje);
}

}