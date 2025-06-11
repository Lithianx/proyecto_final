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

  async obtenerUltimoIdUsuario(): Promise<number> {
    if (this.usuariosEnMemoria.length === 0) return 0;
    return Math.max(...this.usuariosEnMemoria.map(u => u.id_usuario));
  }

  async crearCuenta(nombre: string, correo: string, contrasena: string): Promise<Usuario> {
    try {
      const signInMethods = await fetchSignInMethodsForEmail(this.auth, correo);
      if (signInMethods && signInMethods.length > 0) {
        throw new Error('El correo ya está en uso');
      }

      let cred;
      try {
        cred = await createUserWithEmailAndPassword(this.auth, correo, contrasena);
      } catch (error) {
        console.error('Error en createUserWithEmailAndPassword:', error);
        throw new Error('No se pudo crear el usuario en Firebase');
      }

      if (cred.user) {
        try {
          await sendEmailVerification(cred.user);
        } catch (error) {
          console.warn('No se pudo enviar el correo de verificación:', error);
        }
      }

      const ultimoId = await this.obtenerUltimoIdUsuario();
      const nuevoId = ultimoId + 1;

      const nuevoUsuario: Usuario = {
        id_usuario: nuevoId,
        nombre_usuario: nombre,
        correo_electronico: correo,
        contrasena: contrasena,
        fecha_registro: new Date(),
        estado_cuenta: true,
        estado_online: false,
        avatar: ''
      };

      try {
        await this.agregarUsuario(nuevoUsuario);
      } catch (error) {
        console.error('Error al agregar usuario en Firestore:', error);
        throw new Error('No se pudo guardar el usuario en Firestore');
      }

      return nuevoUsuario;
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
          id_usuario: 1,
          nombre_usuario: 'techguru',
          correo_electronico: 'techguru@correo.com',
          fecha_registro: new Date('2024-01-01T00:00:00.000Z'),
          contrasena: '',
          avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
          estado_cuenta: true,
          estado_online: true
        },
        {
          id_usuario: 2,
          nombre_usuario: 'catlover',
          correo_electronico: 'catlover@correo.com',
          fecha_registro: new Date('2024-01-01T00:00:00.000Z'),
          contrasena: '',
          avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
          estado_cuenta: true,
          estado_online: true
        },
        {
          id_usuario: 3,
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

  getUsuarioPorId(id_usuario: number): Usuario | undefined {
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