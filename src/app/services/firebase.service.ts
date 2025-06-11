import { Injectable } from '@angular/core';
import { Firestore, collection, getDocs,addDoc } from '@angular/fire/firestore';
import { Usuario } from 'src/app/models/usuario.model';
import { Publicacion } from 'src/app/models/publicacion.model';

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  constructor(private firestore: Firestore) {}

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

  async addPublicacion(publicacion: Publicacion): Promise<void> {
    const publicacionesRef = collection(this.firestore, 'Publicacion');
    await addDoc(publicacionesRef, {
      ...publicacion,
      fecha_publicacion: publicacion.fecha_publicacion instanceof Date
        ? publicacion.fecha_publicacion.toISOString()
        : publicacion.fecha_publicacion
    });
  }

}