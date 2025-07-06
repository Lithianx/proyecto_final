import { Injectable } from '@angular/core';
import { Firestore, collection, getDocs,addDoc,doc,updateDoc,deleteDoc, serverTimestamp } from '@angular/fire/firestore';
import { Usuario } from 'src/app/models/usuario.model';
import { Publicacion } from 'src/app/models/publicacion.model';
import { Seguir } from 'src/app/models/seguir.model';
import { TipoReporte } from 'src/app/models/tipo-reporte.model';
import { Reporte } from 'src/app/models/reporte.model';
import { GuardaPublicacion } from 'src/app/models/guarda-publicacion.model';
import { Like } from 'src/app/models/like.model';
import { Comentario } from 'src/app/models/comentario.model';
import { Mensaje } from 'src/app/models/mensaje.model';
import { Conversacion } from 'src/app/models/conversacion.model';
import { query, where } from '@angular/fire/firestore';
import { Notificacion } from 'src/app/models/notificacion.model';  




@Injectable({ providedIn: 'root' })
export class FirebaseService {
  constructor(private firestore: Firestore) {}
//usuarios
  async getUsuarios(): Promise<Usuario[]> {
    const usuariosRef = collection(this.firestore, 'Usuario');
    const snapshot = await getDocs(usuariosRef);
    const usuarios: Usuario[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data() as Usuario;
      usuarios.push({
        ...data,
        id_usuario: String(data.id_usuario),
        fecha_registro: data.fecha_registro ? new Date(data.fecha_registro) : new Date()
      });
    });
    return usuarios;
  }





//publicaciones

async getPublicaciones(): Promise<Publicacion[]> {
  const publicacionesRef = collection(this.firestore, 'Publicacion');
  const snapshot = await getDocs(publicacionesRef);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id_publicacion: doc.id,
      fecha_publicacion: data["fecha_publicacion"]?.toDate
        ? data["fecha_publicacion"].toDate()
        : new Date(data["fecha_publicacion"])
    } as Publicacion;
  });
}

async addPublicacion(publicacion: Publicacion): Promise<string> {
  const publicacionesRef = collection(this.firestore, 'Publicacion');
  // 1. Agrega la publicación sin el id real
  const docRef = await addDoc(publicacionesRef, {
    ...publicacion,
    id_publicacion: '', // Temporal o vacío
    fecha_publicacion: serverTimestamp() // Hora del servidor
  });
  // 2. Actualiza el documento con el id generado por Firestore
  await updateDoc(docRef, { id_publicacion: docRef.id });
  return docRef.id;
}

async updatePublicacion(publicacion: Publicacion): Promise<void> {
  const docRef = doc(this.firestore, 'Publicacion', publicacion.id_publicacion);
  await updateDoc(docRef, {
    ...publicacion,
    // No conviertas a string, solo pasa el Date
    fecha_publicacion: publicacion.fecha_publicacion
  });
}

async removePublicacion(id: string): Promise<void> {
  const docRef = doc(this.firestore, 'Publicacion', id);
  await deleteDoc(docRef);
}



///SEGUIR///
// Obtiene todos los seguimientos
async getSeguimientos(): Promise<Seguir[]> {
  const ref = collection(this.firestore, 'Seguir');
  const snapshot = await getDocs(ref);
  return snapshot.docs.map(doc => doc.data() as Seguir);
}

// Agrega un seguimiento
async addSeguimiento(seguimiento: Seguir): Promise<void> {
  const seguimientosRef = collection(this.firestore, 'Seguir');
  await addDoc(seguimientosRef, seguimiento);
}

// Actualiza un seguimiento existente
async updateSeguimiento(seguimiento: Seguir): Promise<void> {
  const seguimientosRef = collection(this.firestore, 'Seguir');
  const snapshot = await getDocs(seguimientosRef);
  const docSnap = snapshot.docs.find(doc =>
    doc.data()["id_usuario_seguidor"] === seguimiento.id_usuario_seguidor &&
    doc.data()["id_usuario_seguido"] === seguimiento.id_usuario_seguido
  );
  if (docSnap) {
    const docRef = doc(this.firestore, 'Seguir', docSnap.id);
    await updateDoc(docRef, { ...seguimiento } as { [key: string]: any });
  }
}

///REPORTES///

// Obtiene todos los tipos de reporte
async getTiposReporte(): Promise<TipoReporte[]> {
  const ref = collection(this.firestore, 'TipoReporte');
  const snapshot = await getDocs(ref);
  return snapshot.docs.map(doc => ({
    id_tipo_reporte: doc.id,
    ...doc.data()
  } as TipoReporte));
}

// Obtiene todos los reportes
async getReportes(): Promise<Reporte[]> {
  const ref = collection(this.firestore, 'Reporte');
  const snapshot = await getDocs(ref);
  return snapshot.docs.map(doc => ({
    id_reporte: doc.id,
    ...doc.data()
  } as Reporte));
}

// Agrega un reporte
async addReporte(reporte: Reporte): Promise<string> {
  const reportesRef = collection(this.firestore, 'Reporte');
  const { id_reporte, ...reporteSinId } = reporte;
  const docRef = await addDoc(reportesRef, reporteSinId);
  await updateDoc(docRef, { id_reporte: docRef.id });

  return docRef.id;
}

  // Elimina un reporte por su ID
  async deleteReporte(id_reporte: string): Promise<void> {
    const docRef = doc(this.firestore, 'Reporte', id_reporte);
    await deleteDoc(docRef);
  }


//GUARDADO DE PUBLICACIONES////

// Obtiene todos los guardados
async getGuardados(): Promise<GuardaPublicacion[]> {
  const ref = collection(this.firestore, 'GuardaPublicacion');
  const snapshot = await getDocs(ref);
  return snapshot.docs.map(doc => doc.data() as GuardaPublicacion);
}

// Agrega un guardado
async addGuardado(guardado: GuardaPublicacion): Promise<void> {
  const ref = collection(this.firestore, 'GuardaPublicacion');
  await addDoc(ref, { ...guardado });
}

// Actualiza un guardado existente
async updateGuardado(guardado: GuardaPublicacion): Promise<void> {
  const ref = collection(this.firestore, 'GuardaPublicacion');
  const snapshot = await getDocs(ref);
  const docSnap = snapshot.docs.find(doc =>
    doc.data()["id_usuario"] === guardado.id_usuario &&
    doc.data()["id_publicacion"] === guardado.id_publicacion
  );
  if (docSnap) {
    const docRef = doc(this.firestore, 'GuardaPublicacion', docSnap.id);
    await updateDoc(docRef, { ...guardado });
  }
}


// Elimina todos los guardados relacionados a una publicación
async removeGuardadosByPublicacion(id_publicacion: string): Promise<void> {
  const ref = collection(this.firestore, 'GuardaPublicacion');
  const q = query(ref, where('id_publicacion', '==', id_publicacion));
  const snapshot = await getDocs(q);
  for (const docSnap of snapshot.docs) {
    await deleteDoc(doc(this.firestore, 'GuardaPublicacion', docSnap.id));
  }
}
async eliminarGuardado(id_usuario: string, id_publicacion: string): Promise<void> {
  const ref = collection(this.firestore, 'GuardaPublicacion');
  const q = query(ref,
    where('id_usuario', '==', id_usuario),
    where('id_publicacion', '==', id_publicacion)
  );
  const snapshot = await getDocs(q);
  for (const docSnap of snapshot.docs) {
    await deleteDoc(doc(this.firestore, 'GuardaPublicacion', docSnap.id));
  }
}


async existeGuardado(id_usuario: string, id_publicacion: string): Promise<boolean> {
  const guardadosRef = collection(this.firestore, 'GuardaPublicacion');
  const q = query(guardadosRef, where('id_usuario', '==', id_usuario), where('id_publicacion', '==', id_publicacion));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}


/// LIKES PUBLICACIONES Y COMENTARIOS ///


// Obtiene todos los likes de publicaciones
async getLikesPublicaciones(): Promise<Like[]> {
  const ref = collection(this.firestore, 'Like');
  const snapshot = await getDocs(ref);
  return snapshot.docs.map(doc => doc.data() as Like);
}

// Agrega un like a una publicación
async addLikePublicacion(like: Like): Promise<void> {
  const ref = collection(this.firestore, 'Like');
  await addDoc(ref, { ...like });
}

// Obtiene todos los likes de comentarios
async getLikesComentarios(): Promise<Like[]> {
  const ref = collection(this.firestore, 'Like');
  const snapshot = await getDocs(ref);
  return snapshot.docs.map(doc => doc.data() as Like);
}

// Agrega un like a un comentario
async addLikeComentario(like: Like): Promise<void> {
  const ref = collection(this.firestore, 'Like');
  await addDoc(ref, { ...like });
}

// Actualiza un like de publicación existente
async updateLikePublicacion(like: Like): Promise<void> {
  const ref = collection(this.firestore, 'Like');
  const snapshot = await getDocs(ref);
  const docSnap = snapshot.docs.find(doc =>
    doc.data()["id_usuario"] === like.id_usuario &&
    doc.data()["id_publicacion"] === like.id_publicacion
  );
  if (docSnap) {
    const docRef = doc(this.firestore, 'Like', docSnap.id);
    await updateDoc(docRef, { ...like });
  }
}

// Actualiza un like de comentario existente
async updateLikeComentario(like: Like): Promise<void> {
  const ref = collection(this.firestore, 'Like');
  const snapshot = await getDocs(ref);
  const docSnap = snapshot.docs.find(doc =>
    doc.data()["id_usuario"] === like.id_usuario &&
    doc.data()["id_comentario"] === like.id_comentario
  );
  if (docSnap) {
    const docRef = doc(this.firestore, 'Like', docSnap.id);
    await updateDoc(docRef, { ...like });
  }
}

// Elimina todos los likes relacionados a una publicación
async removeLikesByPublicacion(id_publicacion: string): Promise<void> {
  const ref = collection(this.firestore, 'Like');
  const q = query(ref, where('id_publicacion', '==', id_publicacion));
  const snapshot = await getDocs(q);
  for (const docSnap of snapshot.docs) {
    await deleteDoc(doc(this.firestore, 'Like', docSnap.id));
  }
}


// Elimina todos los likes de comentarios relacionados a una publicación
async removeComentarioLikesByPublicacion(id_publicacion: string): Promise<void> {
  // 1. Obtén todos los comentarios de la publicación
  const comentariosRef = collection(this.firestore, 'Comentario');
  const comentariosQuery = query(comentariosRef, where('id_publicacion', '==', id_publicacion));
  const comentariosSnapshot = await getDocs(comentariosQuery);

  // 2. Para cada comentario, elimina sus likes
  for (const comentarioDoc of comentariosSnapshot.docs) {
    const id_comentario = comentarioDoc.id;
    const likesRef = collection(this.firestore, 'Like');
    const likesQuery = query(likesRef, where('id_comentario', '==', id_comentario));
    const likesSnapshot = await getDocs(likesQuery);
    for (const likeDoc of likesSnapshot.docs) {
      await deleteDoc(doc(this.firestore, 'Like', likeDoc.id));
    }
  }
}


 /* codigo antes de eliminar likes de la base de datos*/

/*
 // Dar o quitar like a un comentario
async toggleLikeComentario(idUsuario: string, idComentario: string): Promise<void> {
  const ref = collection(this.firestore, 'Like');
  const snapshot = await getDocs(ref);
  const docSnap = snapshot.docs.find(doc =>
    doc.data()["id_usuario"] === idUsuario &&
    doc.data()["id_comentario"] === idComentario
  );
  if (docSnap) {
    // Si ya existe, alterna el estado
    const docRef = doc(this.firestore, 'Like', docSnap.id);
    const estadoActual = docSnap.data()["estado_like"];
    await updateDoc(docRef, { estado_like: !estadoActual });
  } else {
    // Si no existe, crea el like
    await addDoc(ref, {
      id_usuario: idUsuario,
      id_comentario: idComentario,
      estado_like: true
    });
  }
}

// Dar o quitar like a una publicación
async toggleLikePublicacion(idUsuario: string, idPublicacion: string): Promise<void> {
  const ref = collection(this.firestore, 'Like');
  const snapshot = await getDocs(ref);
  const docSnap = snapshot.docs.find(doc =>
    doc.data()["id_usuario"] === idUsuario &&
    doc.data()["id_publicacion"] === idPublicacion
  );
  if (docSnap) {
    // Si ya existe, alterna el estado
    const docRef = doc(this.firestore, 'Like', docSnap.id);
    const estadoActual = docSnap.data()["estado_like"];
    await updateDoc(docRef, { estado_like: !estadoActual });
  } else {
    // Si no existe, crea el like
    await addDoc(ref, {
      id_usuario: idUsuario,
      id_publicacion: idPublicacion,
      estado_like: true
    });
  }
}
*/


async toggleLikeComentario(idUsuario: string, idComentario: string): Promise<void> {
  const ref = collection(this.firestore, 'Like');
  const snapshot = await getDocs(ref);
  const docSnap = snapshot.docs.find(doc =>
    doc.data()["id_usuario"] === idUsuario &&
    doc.data()["id_comentario"] === idComentario
  );
  if (docSnap) {
    // Si ya existe, elimina el like (quita el like)
    const docRef = doc(this.firestore, 'Like', docSnap.id);
    await deleteDoc(docRef);
  } else {
    // Si no existe, crea el like
    await addDoc(ref, {
      id_usuario: idUsuario,
      id_comentario: idComentario,
      estado_like: true
    });
  }
}


async toggleLikePublicacion(idUsuario: string, idPublicacion: string): Promise<void> {
  const ref = collection(this.firestore, 'Like');
  const snapshot = await getDocs(ref);
  const docSnap = snapshot.docs.find(doc =>
    doc.data()["id_usuario"] === idUsuario &&
    doc.data()["id_publicacion"] === idPublicacion
  );
  if (docSnap) {
    // Si ya existe, elimina el like (quita el like)
    const docRef = doc(this.firestore, 'Like', docSnap.id);
    await deleteDoc(docRef);
  } else {
    // Si no existe, crea el like
    await addDoc(ref, {
      id_usuario: idUsuario,
      id_publicacion: idPublicacion,
      estado_like: true
    });
  }
}






//COMENTARIOS///

// Obtiene todos los comentarios
async getComentarios(): Promise<Comentario[]> {
  const ref = collection(this.firestore, 'Comentario');
  const snapshot = await getDocs(ref);
  return snapshot.docs.map(doc => {
  const data = doc.data();
  return {
    ...data,
    id_comentario: doc.id,
    fecha_comentario: data["fecha_comentario"]?.toDate
      ? data["fecha_comentario"].toDate()
      : new Date(data["fecha_comentario"])
  } as Comentario;
});
}

// Agrega un comentario
async addComentario(comentario: Comentario): Promise<string> {
  const comentariosRef = collection(this.firestore, 'Comentario');
  const { id_comentario, ...comentarioSinId } = comentario;
  // Usa la hora del servidor
  const docRef = await addDoc(comentariosRef, {
    ...comentarioSinId,
    id_comentario: '', // Temporal
    fecha_comentario: serverTimestamp()
  });
  await updateDoc(docRef, { id_comentario: docRef.id });
  return docRef.id;
}

// Actualiza un comentario existente
async updateComentario(comentario: Comentario): Promise<void> {
  const docRef = doc(this.firestore, 'Comentario', comentario.id_comentario);
  await updateDoc(docRef, { ...comentario });
}

// Elimina un comentario
async removeComentario(id_comentario: string): Promise<void> {
  const docRef = doc(this.firestore, 'Comentario', id_comentario);
  await deleteDoc(docRef);
}

// Elimina todos los comentarios relacionados a una publicación
async removeComentariosByPublicacion(id_publicacion: string): Promise<void> {
  const ref = collection(this.firestore, 'Comentario');
  const q = query(ref, where('id_publicacion', '==', id_publicacion));
  const snapshot = await getDocs(q);
  for (const docSnap of snapshot.docs) {
    await deleteDoc(doc(this.firestore, 'Comentario', docSnap.id));
  }
}

//MENSAJES Y CONVERESACIONES///

// Obtiene todos los mensajes
async getMensajes(): Promise<Mensaje[]> {
  const ref = collection(this.firestore, 'Mensaje');
  const snapshot = await getDocs(ref);
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    id_mensaje: doc.id,
    fecha_envio: doc.data()["fecha_envio"]?.toDate ? doc.data()["fecha_envio"].toDate() : new Date(doc.data()["fecha_envio"])
  } as Mensaje));
}

// Agrega un mensaje
async addMensaje(mensaje: Mensaje) {
  const mensajesRef = collection(this.firestore, 'Mensaje');
  return await addDoc(mensajesRef, mensaje); // Retorna DocumentReference
}

// Actualiza un mensaje
async updateMensaje(mensaje: Mensaje) {
  const mensajeRef = doc(this.firestore, 'Mensaje', mensaje.id_mensaje);
  await updateDoc(mensajeRef, { ...mensaje });
}

// Obtiene todas las conversaciones
async getConversaciones(): Promise<Conversacion[]> {
  const ref = collection(this.firestore, 'Conversacion');
  const snapshot = await getDocs(ref);
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    id_conversacion: doc.id,
    fecha_envio: doc.data()["fecha_envio"]?.toDate ? doc.data()["fecha_envio"].toDate() : new Date(doc.data()["fecha_envio"])
  } as Conversacion));
}

// Agrega una conversación
async addConversacion(conversacion: Conversacion): Promise<void> {
  const ref = collection(this.firestore, 'Conversacion');
  await addDoc(ref, { ...conversacion });
}


 // Agregar una notificación
  async addNotificacion(notificacion: Notificacion): Promise<string> {
    const notificacionesRef = collection(this.firestore, 'Notificacion');
    // Guardar la notificación con fecha de servidor
    const { fecha, ...rest } = notificacion; // Ignorar fecha que venga en objeto
    const docRef = await addDoc(notificacionesRef, {
      ...rest,
      fecha: serverTimestamp()
    });
    // Actualiza el documento con el id generado por Firestore
    await updateDoc(docRef, { id_notificacion: docRef.id });
    return docRef.id;
  }
  
async getTodasNotificaciones(): Promise<Notificacion[]> {
  const notificacionesRef = collection(this.firestore, 'Notificacion');
  const snapshot = await getDocs(notificacionesRef);
  return snapshot.docs.map(docSnap => {
    const data = docSnap.data();
    return {
      ...data,
      id_notificacion: docSnap.id,
      fecha: data['fecha']?.toDate ? data['fecha'].toDate() : data['fecha'] || new Date()
    } as Notificacion;
  });
}

async actualizarNotificacion(id_notificacion: string, datosActualizados: Partial<Notificacion>): Promise<void> {
  const docRef = doc(this.firestore, 'Notificacion', id_notificacion);
  await updateDoc(docRef, datosActualizados);
}

async eliminarNotificacion(idNotificacion: string): Promise<void> {
  try {
    const docRef = doc(this.firestore, 'Notificacion', idNotificacion);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error eliminando la notificación en Firebase:', error);
  }
}
}
