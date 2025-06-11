import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage-social.service';
import { Usuario } from 'src/app/models/usuario.model';
import { AngularFireAuth } from '@angular/fire/compat/auth';       // Importa AngularFireAuth
import { AngularFirestore } from '@angular/fire/compat/firestore'; 


@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private usuariosEnMemoria: Usuario[] = [];

  constructor(
    private localStorage: LocalStorageService,
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth       // Inyecta AngularFireAuth
  ) {}

  // 🔐 Login con Firebase Authentication usando AngularFireAuth
  async loginConFirebase(correo: string, contrasena: string): Promise<any> {
    try {
      const credenciales = await this.afAuth.signInWithEmailAndPassword(correo, contrasena);
      return credenciales;
    } catch (error) {
      throw error;
    }
  }
async crearCuenta(nombre: string, correo: string, contrasena: string): Promise<Usuario> {
  try {
    // Verificar si el correo ya está registrado
    const signInMethods = await this.afAuth.fetchSignInMethodsForEmail(correo);
    if (signInMethods && signInMethods.length > 0) {
      throw new Error('El correo ya está en uso');
    }

    // Crear cuenta en Firebase Auth
    const cred = await this.afAuth.createUserWithEmailAndPassword(correo, contrasena);

    // Enviar correo de verificación
    if (cred.user) {
      await cred.user.sendEmailVerification(); // 📧
    }

    // Crear objeto Usuario
    const nuevoUsuario: Usuario = {
      id_usuario: Date.now(), // ID único
      nombre_usuario: nombre,
      correo_electronico: correo,
      contrasena: contrasena, // ⚠️ No almacenar en texto plano en producción
      fecha_registro: new Date(),
      estado_cuenta: true,
      estado_online: false,
      avatar: null
    };

    // Guardar usuario en memoria y localStorage
    await this.agregarUsuario(nuevoUsuario);

    return nuevoUsuario;
  } catch (error: any) {
    console.error('Error al crear cuenta:', error);
    throw error;
  }
}

async restablecerContrasena(correo: string): Promise<void> {
  try {
    await this.afAuth.sendPasswordResetEmail(correo);
  } catch (error) {
    throw error;
  }
}



  // Cargar usuarios en memoria (local o remoto)
  async cargarUsuarios(): Promise<void> {
    // Si quieres usar Firestore remoto, descomenta y adapta esta línea:
    // const usuariosFirebase = await this.firestore.collection<Usuario>('usuarios').valueChanges().toPromise();
    // if (usuariosFirebase && usuariosFirebase.length > 0) {
    //   this.usuariosEnMemoria = usuariosFirebase;
    //   await this.localStorage.setItem('usuarios', usuariosFirebase);
    //   return;
    // }

    // Por ahora, solo local:
    const usuariosLocal = await this.localStorage.getList<Usuario>('usuarios');
    if (usuariosLocal && usuariosLocal.length > 0) {
      this.usuariosEnMemoria = usuariosLocal;
    } else {
      this.usuariosEnMemoria = [
        {
          id_usuario: 1,
          nombre_usuario: 'techguru',
          correo_electronico: 'techguru@correo.com',
          fecha_registro: new Date('2024-01-01'),
          contrasena: '',
          avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
          estado_cuenta: true,
          estado_online: true
        },
        {
          id_usuario: 2,
          nombre_usuario: 'catlover',
          correo_electronico: 'catlover@correo.com',
          fecha_registro: new Date('2024-01-01'),
          contrasena: '',
          avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
          estado_cuenta: true,
          estado_online: true
        },
        {
          id_usuario: 3,
          nombre_usuario: 'pan_con_queso',
          correo_electronico: 'pan_con_queso@correo.com',
          fecha_registro: new Date('2024-01-01'),
          contrasena: '',
          avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
          estado_cuenta: true,
          estado_online: true
        },
      ]; // inicializa con usuarios de ejemplo
      await this.localStorage.setItem('usuarios', this.usuariosEnMemoria);
    }
  }

  // Obtener todos los usuarios desde memoria
  getUsuarios(): Usuario[] {
    return this.usuariosEnMemoria;
  }

  // Guardar usuarios en memoria y LocalStorage
  async setUsuarios(usuarios: Usuario[]): Promise<void> {
    this.usuariosEnMemoria = usuarios;
    await this.localStorage.setItem('usuarios', usuarios);
    // Aquí podrías sincronizar con Firebase si quieres
  }

  // Obtener un usuario por su ID (rápido y síncrono)
  getUsuarioPorId(id_usuario: number): Usuario | undefined {
    return this.usuariosEnMemoria.find(u => u.id_usuario === id_usuario);
  }

  // Agregar un usuario
  async agregarUsuario(usuario: Usuario): Promise<void> {
    this.usuariosEnMemoria.push(usuario);
    await this.localStorage.setItem('usuarios', this.usuariosEnMemoria);
    // También podrías agregarlo en Firestore aquí
  }

  // Actualizar un usuario existente
  async actualizarUsuario(usuario: Usuario): Promise<void> {
    const idx = this.usuariosEnMemoria.findIndex(u => u.id_usuario === usuario.id_usuario);
    if (idx !== -1) {
      this.usuariosEnMemoria[idx] = usuario;
      await this.localStorage.setItem('usuarios', this.usuariosEnMemoria);
      // También podrías actualizarlo en Firestore aquí
    }
  }
}
