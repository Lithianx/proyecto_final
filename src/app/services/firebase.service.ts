import { Injectable } from '@angular/core';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { Usuario } from 'src/app/models/usuario.model';

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
}