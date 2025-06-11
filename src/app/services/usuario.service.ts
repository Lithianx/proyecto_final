import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage-social.service';
import { Usuario } from 'src/app/models/usuario.model';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail
} from '@angular/fire/auth';
import {
  Firestore,
  collection,
  doc,
  setDoc,
  updateDoc
} from '@angular/fire/firestore';
import { collectionData } from '@angular/fire/firestore';
import { docData } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private usuariosEnMemoria: Usuario[] = [];

  constructor(
    private localStorage: LocalStorageService,
    private firestore: Firestore,
    private auth: Auth
  ) {}

  async loginConFirebase(correo: string, contrasena: string): Promise<any> {
    try {
      const credenciales = await signInWithEmailAndPassword(this.auth, correo, contrasena);
      return credenciales;
    } catch (error) {
      throw error;
    }
  }



 async crearCuenta(nombre: string, correo: string, contrasena: string): Promise<Usuario> {
  try {
    const signInMethods = await fetchSignInMethodsForEmail(this.auth, correo);
    if (signInMethods && signInMethods.length > 0) {
      throw new Error('El correo ya está en uso');
    }

    const cred = await createUserWithEmailAndPassword(this.auth, correo, contrasena);

    if (cred.user) {
      try {
        await sendEmailVerification(cred.user);
      } catch (error) {
        console.warn('No se pudo enviar el correo de verificación:', error);
      }

      const nuevoUsuario: Usuario = {
        id_usuario: cred.user.uid, // Aquí usamos el UID de Firebase
        nombre_usuario: nombre,
        correo_electronico: correo,
        contrasena: contrasena,
        fecha_registro: new Date(),
        estado_cuenta: true,
        estado_online: false,
        avatar: ''
      };

      await this.agregarUsuario(nuevoUsuario);

      return nuevoUsuario;
    } else {
      throw new Error('No se obtuvo usuario de Firebase');
    }
  } catch (error: any) {
    console.error('Error general en crearCuenta:', error.message || error);
    throw error;
  }
}

  async restablecerContrasena(correo: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, correo);
    } catch (error) {
      throw error;
    }
  }

  async cargarUsuarios(): Promise<void> {
    const usuariosLocal = await this.localStorage.getList<Usuario>('usuarios');
    if (usuariosLocal && usuariosLocal.length > 0) {
      this.usuariosEnMemoria = usuariosLocal;
    } else {
      this.usuariosEnMemoria = [
        {
          id_usuario: 'techguru',
          nombre_usuario: 'techguru',
          correo_electronico: 'techguru@correo.com',
          fecha_registro: new Date('2024-01-01T00:00:00.000Z'),
          contrasena: '',
          avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
          estado_cuenta: true,
          estado_online: true
        },
        {
          id_usuario: 'techguru',
          nombre_usuario: 'catlover',
          correo_electronico: 'catlover@correo.com',
          fecha_registro: new Date('2024-01-01T00:00:00.000Z'),
          contrasena: '',
          avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
          estado_cuenta: true,
          estado_online: true
        },
        {
          id_usuario: 'techguru',
          nombre_usuario: 'pan_con_queso',
          correo_electronico: 'pan_con_queso@correo.com',
          fecha_registro: new Date('2024-01-01T00:00:00.000Z'),
          contrasena: '',
          avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
          estado_cuenta: true,
          estado_online: true
        }
      ];

      await this.localStorage.setItem('usuarios', this.usuariosEnMemoria);
    }
  }

  getUsuarios(): Usuario[] {
    return this.usuariosEnMemoria;
  }

  async setUsuarios(usuarios: Usuario[]): Promise<void> {
    this.usuariosEnMemoria = usuarios;
    await this.localStorage.setItem('usuarios', usuarios);
  }

  getUsuarioPorId(id_usuario: string): Usuario | undefined {
    return this.usuariosEnMemoria.find(u => u.id_usuario === id_usuario);
  }
  async agregarUsuario(usuario: Usuario): Promise<void> {
    this.usuariosEnMemoria.push(usuario);
    const userRef = doc(this.firestore, 'Usuario', usuario.id_usuario.toString());
    await setDoc(userRef, usuario);
  }

  async actualizarUsuario(usuario: Usuario): Promise<void> {
    const idx = this.usuariosEnMemoria.findIndex(u => u.id_usuario === usuario.id_usuario);
    if (idx !== -1) {
      this.usuariosEnMemoria[idx] = usuario;
      await this.localStorage.setItem('usuarios', this.usuariosEnMemoria);

      const userRef = doc(this.firestore, 'Usuario', usuario.id_usuario.toString());
      await updateDoc(userRef, { ...usuario });
    }
  }
}
