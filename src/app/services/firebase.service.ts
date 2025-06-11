import { Injectable } from '@angular/core';
import { Firestore, collection, getDocs,addDoc,doc,updateDoc,deleteDoc } from '@angular/fire/firestore';
import { Usuario } from 'src/app/models/usuario.model';
import { Publicacion } from 'src/app/models/publicacion.model';

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

}