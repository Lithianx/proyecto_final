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
  onAuthStateChanged,
  updatePassword
} from '@angular/fire/auth';

import {
  Firestore,
  doc,
  setDoc,
  updateDoc,
  collectionData,
  collection,
  getDoc
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { FirebaseService } from './firebase.service';
import { UtilsService } from './utils.service';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private usuariosEnMemoria: Usuario[] = [];
  usuarios$: Observable<Usuario[]>;

  constructor(
    private localStorage: LocalStorageService,
    private firestore: Firestore,
    private auth: Auth,
    private firebaseService: FirebaseService,
    private utilsService: UtilsService
  ) {
    const usuariosRef = collection(this.firestore, 'Usuario');
    this.usuarios$ = collectionData(usuariosRef, { idField: 'id_usuario' }) as Observable<Usuario[]>;
  }

  /**
   * Inicia sesión usando autenticación híbrida.
   * Si hay conexión, usa Firebase Auth. Si no, busca en localStorage.
   */
  async login(correo: string, contrasena: string): Promise<Usuario | null> {
    const online = await this.utilsService.checkInternetConnection();
    if (online) {
      try {
        const credenciales = await signInWithEmailAndPassword(this.auth, correo, contrasena);
        await this.cargarUsuarios();
        const usuario = this.getUsuarios().find(u => u.correo_electronico === correo);
        if (usuario) {
          const usuarioMinimo = {
            id_usuario: usuario.id_usuario,
            nombre_usuario: usuario.nombre_usuario,
            avatar: usuario.avatar,
            rol: usuario.rol,
            correo_electronico: usuario.correo_electronico,
            sub_name: usuario.sub_name,
            descripcion: usuario.descripcion
             
          };
          await this.localStorage.setItem('usuarioActual', usuarioMinimo);
          await this.localStorage.setItem('id_usuario', usuario.id_usuario);
        }
        return usuario ?? null;
      } catch (error) {
        throw error;
      }
    } else {
      // Offline: buscar usuario en localStorage
      await this.cargarUsuarios();
      const usuario = this.getUsuarios().find(
        u => u.correo_electronico === correo && u.contrasena === contrasena
      );
      if (usuario) {
        const usuarioMinimo = {
          id_usuario: usuario.id_usuario,
          nombre_usuario: usuario.nombre_usuario,
          avatar: usuario.avatar,
          rol: usuario.rol,
          correo_electronico: usuario.correo_electronico,
          sub_name: usuario.sub_name,
          descripcion: usuario.descripcion
        };
        await this.localStorage.setItem('usuarioActual', usuarioMinimo);
        await this.localStorage.setItem('id_usuario', usuario.id_usuario);
      }
      return usuario ?? null;
    }
  }

  /**
   * Inicia sesión solamente usando Firebase Auth (modo online).
   */
  async loginConFirebase(correo: string, contrasena: string): Promise<any> {
    try {
      return await signInWithEmailAndPassword(this.auth, correo, contrasena);
    } catch (error) {
      throw error;
    }
  }

  async isLoggedIn(): Promise<boolean> {
    const usuario = await this.localStorage.getItem<Usuario>('usuarioActual');
    return !!usuario;
  }

  /**
   * Crea una nueva cuenta de usuario, registra en Firebase Auth y Firestore.
   */
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
          id_usuario: cred.user.uid,
          nombre_usuario: nombre,
          correo_electronico: correo,
          contrasena: contrasena,
          fecha_registro: new Date(),
          estado_cuenta: true,
          estado_online: false,
          avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
          sub_name: '',
          descripcion: '',
          rol: 'usuario' // Asignar rol por defecto
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

  /**
   * Envía un correo de recuperación de contraseña al usuario.
   */
  async restablecerContrasena(correo: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, correo);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene el usuario actualmente autenticado (desde Firebase o localStorage si está offline).
   */
  async getUsuarioActualConectado(): Promise<Usuario | null> {
    const online = await this.utilsService.checkInternetConnection();
    if (online) {
      return new Promise((resolve) => {
        onAuthStateChanged(this.auth, async (user: User | null) => {
          if (user && user.email) {
            await this.cargarUsuarios();
            const usuarios = this.getUsuarios();
            const usuarioEncontrado = usuarios.find(u => u.correo_electronico === user.email);
            if (usuarioEncontrado) {
              const usuarioMinimo = {
                id_usuario: usuarioEncontrado.id_usuario,
                nombre_usuario: usuarioEncontrado.nombre_usuario,
                avatar: usuarioEncontrado.avatar,
                rol: usuarioEncontrado.rol,
                correo_electronico: usuarioEncontrado.correo_electronico,
                sub_name: usuarioEncontrado.sub_name,
                descripcion: usuarioEncontrado.descripcion
              };
              await this.localStorage.setItem('usuarioActual', usuarioMinimo);
            }
            resolve(usuarioEncontrado ?? null);
          } else {
            resolve(null);
          }
        });
      });
    } else {
      // Offline: obtener usuario de localStorage
      const usuarioActual = await this.localStorage.getItem<Usuario>('usuarioActual');
      return usuarioActual ?? null;
    }
  }

  async setUsuarioOnline(id_usuario: string, online: boolean) {
    const userRef = doc(this.firestore, 'Usuario', id_usuario);
    await updateDoc(userRef, { estado_online: online });
  }

  async cargarUsuarios(): Promise<void> {
    const online = await this.utilsService.checkInternetConnection();
    if (online) {
      try {
        const usuarios = await this.firebaseService.getUsuarios();
        this.usuariosEnMemoria = usuarios; // Mantén los objetos completos en memoria
        const usuariosMinimos = usuarios.map(u => ({
          id_usuario: u.id_usuario,
          nombre_usuario: u.nombre_usuario,
          avatar: u.avatar,
          rol: u.rol,
          correo_electronico: u.correo_electronico,
          sub_name: u.sub_name,
          descripcion: u.descripcion
        }));
        await this.localStorage.setItem('usuarios', usuariosMinimos);
      } catch (error) {
        console.error('Error al cargar usuarios desde Firebase:', error);
      }
    }

    // Cargar también desde almacenamiento local como respaldo
    const usuariosLocal = await this.localStorage.getList<Usuario>('usuarios');
    if (usuariosLocal && usuariosLocal.length > 0) {
      // Rellenar los campos faltantes para cumplir con la interfaz Usuario
      this.usuariosEnMemoria = usuariosLocal.map(u => ({
        id_usuario: u.id_usuario,
        nombre_usuario: u.nombre_usuario,
        avatar: u.avatar,
        rol: u.rol,
        correo_electronico: u.correo_electronico || '',
        fecha_registro: new Date(),
        contrasena: '',
        estado_cuenta: true,
        estado_online: true,
        sub_name: u.sub_name,
        descripcion: u.descripcion
      }));
    } else {
      this.usuariosEnMemoria = [];
      await this.localStorage.setItem('usuarios', []);
    }
  }

  /**
   * Devuelve la lista de usuarios cargados en memoria.
   */
  getUsuarios(): Usuario[] {
    return this.usuariosEnMemoria;
  }

  async obtenerUsuarios(): Promise<Usuario[]> {
    if (this.usuariosEnMemoria.length === 0) {
      await this.cargarUsuarios();
    }
    return this.getUsuarios();
  }

  /**
   * Actualiza la lista de usuarios en memoria y localStorage.
   */
  async setUsuarios(usuarios: Usuario[]): Promise<void> {
    this.usuariosEnMemoria = usuarios.map(u => ({
      ...u,
      id_usuario: String(u.id_usuario),
      fecha_registro: this.obtenerFechaValida(u.fecha_registro)
    }));
    const usuariosMinimos = this.usuariosEnMemoria.map(u => ({
      id_usuario: u.id_usuario,
      nombre_usuario: u.nombre_usuario,
      avatar: u.avatar,
      rol: u.rol,
      correo_electronico: u.correo_electronico,
      sub_name: u.sub_name,
      descripcion: u.descripcion
    }));
    await this.localStorage.setItem('usuarios', usuariosMinimos);
  }

  /**
   * Busca un usuario en memoria por su ID.
   */
  getUsuarioPorId(id_usuario: string): Usuario | undefined {
    return this.usuariosEnMemoria.find(u => u.id_usuario === id_usuario);
  }

  /**
   * Agrega un nuevo usuario a Firestore, memoria y localStorage.
   */
  async agregarUsuario(usuario: Usuario): Promise<void> {
    usuario.id_usuario = String(usuario.id_usuario);

    this.usuariosEnMemoria.push(usuario);
    const userRef = doc(this.firestore, 'Usuario', usuario.id_usuario);
    await setDoc(userRef, usuario);
    const usuariosMinimos = this.usuariosEnMemoria.map(u => ({
      id_usuario: u.id_usuario,
      nombre_usuario: u.nombre_usuario,
      avatar: u.avatar,
      rol: u.rol,
      correo_electronico: u.correo_electronico,
      sub_name: u.sub_name,
      descripcion: u.descripcion
    }));
    await this.localStorage.setItem('usuarios', usuariosMinimos);
  }

  /**
   * Actualiza un usuario existente en memoria, localStorage y Firestore.
   */
  async actualizarUsuario(usuario: Usuario): Promise<void> {
    usuario.id_usuario = String(usuario.id_usuario);
    usuario.fecha_registro = this.obtenerFechaValida(usuario.fecha_registro);

    const idx = this.usuariosEnMemoria.findIndex(u => u.id_usuario === usuario.id_usuario);
    if (idx !== -1) {
      this.usuariosEnMemoria[idx] = usuario;
      const usuariosMinimos = this.usuariosEnMemoria.map(u => ({
        id_usuario: u.id_usuario,
        nombre_usuario: u.nombre_usuario,
        avatar: u.avatar,
        rol: u.rol,
        correo_electronico: u.correo_electronico,
        sub_name: u.sub_name,
        descripcion: u.descripcion
      }));
      await this.localStorage.setItem('usuarios', usuariosMinimos);

      const userRef = doc(this.firestore, 'Usuario', usuario.id_usuario);
      await updateDoc(userRef, {
        ...usuario,
        fecha_registro: usuario.fecha_registro.toISOString()
      });
    }
  }

  /**
   * Cierra sesión del usuario actual y elimina su info de localStorage.
   */
  async logout(): Promise<void> {
    const usuarioActual = await this.localStorage.getItem<Usuario>('usuarioActual');
    const online = await this.utilsService.checkInternetConnection();
    if (usuarioActual && online) {
      await this.setUsuarioOnline(usuarioActual.id_usuario, false);
      await this.auth.signOut();
    }
    await this.localStorage.removeItem('usuarioActual');
  }

  async desactivarCuentaUsuario(id_usuario: string): Promise<void> {
    const online = await this.utilsService.checkInternetConnection();
    if (online) {
      const docRef = doc(this.firestore, 'Usuario', id_usuario);
      await updateDoc(docRef, { estado_cuenta: false });
    }
    await this.actualizarUsuarioLocal(id_usuario, { estado_cuenta: true });
  }

  // Actualiza solo campos específicos en localStorage
  private async actualizarUsuarioLocal(id_usuario: string, cambios: Partial<Usuario>) {
    const usuarios = await this.localStorage.getList<Usuario>('usuarios') || [];
    const idx = usuarios.findIndex(u => u.id_usuario === id_usuario);
    if (idx !== -1) {
      usuarios[idx] = { ...usuarios[idx], ...cambios };
      const usuariosMinimos = usuarios.map(u => ({
        id_usuario: u.id_usuario,
        nombre_usuario: u.nombre_usuario,
        avatar: u.avatar,
        rol: u.rol,
        correo_electronico: u.correo_electronico,
        sub_name: u.sub_name,
        descripcion: u.descripcion
      }));
      await this.localStorage.setItem('usuarios', usuariosMinimos);
      this.usuariosEnMemoria = usuarios;
    }
  }

  /**
   * Corrige fechas inválidas devolviendo la actual si falla la conversión.
   */
  private obtenerFechaValida(fecha: any): Date {
    const nuevaFecha = new Date(fecha);
    return isNaN(nuevaFecha.getTime()) ? new Date() : nuevaFecha;
  }
}