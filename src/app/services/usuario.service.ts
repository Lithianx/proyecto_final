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
  updatePassword
} from '@angular/fire/auth';

import {
  Firestore,
  doc,
  setDoc,
  updateDoc,
  getDoc
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
  ) {}

  async loginConFirebase(correo: string, contrasena: string): Promise<any> {
    try {
      return await signInWithEmailAndPassword(this.auth, correo, contrasena);
    } catch (error) {
      throw error;
    }
  }

  async crearCuenta(nombre: string, correo: string, contrasena: string): Promise<Usuario> {
    try {
      const signInMethods = await fetchSignInMethodsForEmail(this.auth, correo);
      if (signInMethods.length > 0) {
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
          avatar:'https://ionicframework.com/docs/img/demos/avatar.svg'
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
    try {
      const usuarios = await this.firebaseService.getUsuarios();
      this.usuariosEnMemoria = usuarios.map(u => ({
        ...u,
        id_usuario: String(u.id_usuario),
        fecha_registro: this.obtenerFechaValida(u.fecha_registro)
      }));
      await this.localStorage.setItem('usuarios', this.usuariosEnMemoria);
    } catch (error) {
      console.warn('Error cargando usuarios de Firebase:', error);
    }

    const usuariosLocal = await this.localStorage.getList<Usuario>('usuarios');
    if (usuariosLocal && usuariosLocal.length > 0) {
      this.usuariosEnMemoria = usuariosLocal.map(u => ({
        ...u,
        id_usuario: String(u.id_usuario),
        fecha_registro: this.obtenerFechaValida(u.fecha_registro)
      }));
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
          id_usuario: 'catlover',
          nombre_usuario: 'catlover',
          correo_electronico: 'catlover@correo.com',
          fecha_registro: new Date('2024-01-01T00:00:00.000Z'),
          contrasena: '',
          avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
          estado_cuenta: true,
          estado_online: true
        },
        {
          id_usuario: 'pan_con_queso',
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
    this.usuariosEnMemoria = usuarios.map(u => ({
      ...u,
      id_usuario: String(u.id_usuario),
      fecha_registro: this.obtenerFechaValida(u.fecha_registro)
    }));
    await this.localStorage.setItem('usuarios', this.usuariosEnMemoria);
  }

  getUsuarioPorId(id_usuario: string): Usuario | undefined {
    return this.usuariosEnMemoria.find(u => u.id_usuario === id_usuario);
  }

  async agregarUsuario(usuario: Usuario): Promise<void> {
    usuario.id_usuario = String(usuario.id_usuario);
    usuario.fecha_registro = this.obtenerFechaValida(usuario.fecha_registro);

    this.usuariosEnMemoria.push(usuario);
    const userRef = doc(this.firestore, 'Usuario', usuario.id_usuario);
    await setDoc(userRef, usuario);
    await this.localStorage.setItem('usuarios', this.usuariosEnMemoria);
  }

  async actualizarUsuario(usuario: Usuario): Promise<void> {
    usuario.id_usuario = String(usuario.id_usuario);
    usuario.fecha_registro = this.obtenerFechaValida(usuario.fecha_registro);

    const idx = this.usuariosEnMemoria.findIndex(u => u.id_usuario === usuario.id_usuario);
    if (idx !== -1) {
      this.usuariosEnMemoria[idx] = usuario;
      await this.localStorage.setItem('usuarios', this.usuariosEnMemoria);

      const userRef = doc(this.firestore, 'Usuario', usuario.id_usuario);
      await updateDoc(userRef, {
        ...usuario,
        fecha_registro: usuario.fecha_registro.toISOString() // asegurado
      });
    }
  }

  async obtenerUsuarioDesdeFirestore(uid: string): Promise<Usuario | null> {
    try {
      const ref = doc(this.firestore, 'Usuario', uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data() as Usuario;
        return {
          ...data,
          id_usuario: uid,
          fecha_registro: this.obtenerFechaValida(data.fecha_registro)
        };
      }
      return null;
    } catch (error) {
      console.error('Error al obtener usuario desde Firestore:', error);
      return null;
    }
  }

async actualizarUsuarioPorId(id_usuario: string, datosActualizados: any): Promise<void> {
  const userRef = doc(this.firestore, 'Usuario', id_usuario);

  // Corregimos la fecha si existe y es inválida
  if (datosActualizados.fecha_registro) {
    const fecha = this.obtenerFechaValida(datosActualizados.fecha_registro);
    datosActualizados.fecha_registro = fecha.toISOString();
  }

  // Evitar enviar null o strings vacíos en correo y nombre
  if (!datosActualizados.correo_electronico || datosActualizados.correo_electronico.trim() === '') {
    delete datosActualizados.correo_electronico;
  }
  if (!datosActualizados.nombre_usuario || datosActualizados.nombre_usuario.trim() === '') {
    delete datosActualizados.nombre_usuario;
  }

  await updateDoc(userRef, datosActualizados);
}


  /** 🔧 Función para evitar fechas inválidas */
  private obtenerFechaValida(fecha: any): Date {
    const nuevaFecha = new Date(fecha);
    return isNaN(nuevaFecha.getTime()) ? new Date() : nuevaFecha;
  }
}
