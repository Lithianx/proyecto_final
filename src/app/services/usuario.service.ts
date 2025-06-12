import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage-social.service';
import { Usuario } from 'src/app/models/usuario.model';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail,
  User,
  onAuthStateChanged
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  setDoc,
  updateDoc
} from '@angular/fire/firestore';

import { FirebaseService } from './firebase.service';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private usuariosEnMemoria: Usuario[] = [];

  constructor(
    private localStorage: LocalStorageService,
    private firestore: Firestore,
    private auth: Auth,
    private firebaseService: FirebaseService
  ) { }


  // Login híbrido: online (Firebase Auth) y offline (localStorage)
  async login(correo: string, contrasena: string): Promise<Usuario | null> {
    if (navigator.onLine) {
      try {
        const credenciales = await signInWithEmailAndPassword(this.auth, correo, contrasena);
        await this.cargarUsuarios();
        const usuario = this.getUsuarios().find(u => u.correo_electronico === correo);
        if (usuario) {
          await this.localStorage.setItem('usuarioActual', usuario);
        }
        return usuario ?? null;
      } catch (error) {
        throw error;
      }
    } else {
      // Login offline: busca en localStorage
      await this.cargarUsuarios();
      const usuario = this.getUsuarios().find(
        u => u.correo_electronico === correo && u.contrasena === contrasena
      );
      if (usuario) {
        await this.localStorage.setItem('usuarioActual', usuario);
      }
      return usuario ?? null;
    }
  }


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
          avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg'
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



  // Obtener usuario actual conectado (online/offline)
  async getUsuarioActualConectado(): Promise<Usuario | null> {
    if (navigator.onLine) {
      return new Promise((resolve) => {
        onAuthStateChanged(this.auth, async (user: User | null) => {
          if (user && user.email) {
            await this.cargarUsuarios();
            const usuarios = this.getUsuarios();
            const usuarioEncontrado = usuarios.find(u => u.correo_electronico === user.email);
            if (usuarioEncontrado) {
              await this.localStorage.setItem('usuarioActual', usuarioEncontrado);
            }
            resolve(usuarioEncontrado ?? null);
          } else {
            resolve(null);
          }
        });
      });
    } else {
      // Offline: busca el último usuario logueado en localStorage
      const usuarioActual = await this.localStorage.getItem<Usuario>('usuarioActual');
      return usuarioActual ?? null;
    }
  }





  async cargarUsuarios(): Promise<void> {
    try {
      const usuarios = await this.firebaseService.getUsuarios();
      this.usuariosEnMemoria = usuarios;
      await this.localStorage.setItem('usuarios', usuarios);
    } catch (error) {
      console.error('Error al cargar usuarios desde Firebase:', error);
    }
    const usuariosLocal = await this.localStorage.getList<Usuario>('usuarios');
    if (usuariosLocal && usuariosLocal.length > 0) {
      this.usuariosEnMemoria = usuariosLocal.map(u => ({
        ...u,
        id_usuario: String(u.id_usuario),
        fecha_registro: u.fecha_registro ? new Date(u.fecha_registro) : new Date()
      }));
    } else {
      this.usuariosEnMemoria = [];
      await this.localStorage.setItem('usuarios', []);
    }
  }

  getUsuarios(): Usuario[] {
    return this.usuariosEnMemoria;
  }

  async setUsuarios(usuarios: Usuario[]): Promise<void> {
    this.usuariosEnMemoria = usuarios.map(u => ({
      ...u,
      id_usuario: String(u.id_usuario),
      fecha_registro: u.fecha_registro ? new Date(u.fecha_registro) : new Date()
    }));
    await this.localStorage.setItem('usuarios', this.usuariosEnMemoria);
  }


  getUsuarioPorId(id_usuario: string): Usuario | undefined {
    return this.usuariosEnMemoria.find(u => u.id_usuario === id_usuario);
  }
  async agregarUsuario(usuario: Usuario): Promise<void> {
    usuario.id_usuario = String(usuario.id_usuario);
    this.usuariosEnMemoria.push(usuario);
    const userRef = doc(this.firestore, 'Usuario', usuario.id_usuario);
    await setDoc(userRef, usuario);
    await this.localStorage.setItem('usuarios', this.usuariosEnMemoria);
  }



  async actualizarUsuario(usuario: Usuario): Promise<void> {
    usuario.id_usuario = String(usuario.id_usuario);
    const idx = this.usuariosEnMemoria.findIndex(u => u.id_usuario === usuario.id_usuario);
    if (idx !== -1) {
      this.usuariosEnMemoria[idx] = usuario;
      await this.localStorage.setItem('usuarios', this.usuariosEnMemoria);

      const userRef = doc(this.firestore, 'Usuario', usuario.id_usuario);
      await updateDoc(userRef, { ...usuario });
    }
  }

  // Cerrar sesión y limpiar usuario actual local
  async logout(): Promise<void> {
    if (navigator.onLine) {
      await this.auth.signOut();
    }
    await this.localStorage.removeItem('usuarioActual');
  }

}