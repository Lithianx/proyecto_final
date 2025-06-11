import { Injectable } from '@angular/core';
import { Firestore, collection, getDocs,addDoc,doc,updateDoc,deleteDoc } from '@angular/fire/firestore';
import { Usuario } from 'src/app/models/usuario.model';
import { Publicacion } from 'src/app/models/publicacion.model';
import { Seguir } from 'src/app/models/seguir.model';
import { TipoReporte } from 'src/app/models/tipo-reporte.model';
import { Reporte } from 'src/app/models/reporte.model';

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
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    id_publicacion: doc.id // <-- Esto es clave
  } as Publicacion));
}

async addPublicacion(publicacion: Publicacion): Promise<string> {
  const publicacionesRef = collection(this.firestore, 'Publicacion');
  const docRef = await addDoc(publicacionesRef, {
    ...publicacion,
    fecha_publicacion: publicacion.fecha_publicacion instanceof Date
      ? publicacion.fecha_publicacion.toISOString()
      : publicacion.fecha_publicacion
  });
  return docRef.id; // Devuelve el ID generado por Firestore
}

async updatePublicacion(publicacion: Publicacion): Promise<void> {
  const docRef = doc(this.firestore, 'Publicacion', publicacion.id_publicacion);
  await updateDoc(docRef, {
    ...publicacion,
    fecha_publicacion: publicacion.fecha_publicacion instanceof Date
      ? publicacion.fecha_publicacion.toISOString()
      : publicacion.fecha_publicacion
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

}