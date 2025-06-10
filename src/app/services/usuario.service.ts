import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage-social.service';
import { Usuario } from 'src/app/models/usuario.model';
// import { AngularFirestore } from '@angular/fire/compat/firestore'; 

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private usuariosEnMemoria: Usuario[] = [];

  constructor(
    private localStorage: LocalStorageService,
    // private firestore: AngularFirestore 
  ) { }

  // Cargar usuarios en memoria (local o remoto)
  async cargarUsuarios(): Promise<void> {
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
          id_usuario: 0,
          nombre_usuario: 'Usuario Demo',
          correo_electronico: 'demo@correo.com',
          fecha_registro: new Date(),
          contrasena: '',
          avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
          estado_cuenta: true,
          estado_online: true
        },
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
    // Si usas Firebase, también podrías guardar aquí
  }

  // Obtener un usuario por su ID (rápido y síncrono)
  getUsuarioPorId(id_usuario: number): Usuario | undefined {
    return this.usuariosEnMemoria.find(u => u.id_usuario === id_usuario);
  }

  // Agregar un usuario
  async agregarUsuario(usuario: Usuario): Promise<void> {
    this.usuariosEnMemoria.push(usuario);
    await this.localStorage.setItem('usuarios', this.usuariosEnMemoria);
    // Si usas Firebase, también podrías agregar aquí
  }

  // Actualizar un usuario existente
  async actualizarUsuario(usuario: Usuario): Promise<void> {
    const idx = this.usuariosEnMemoria.findIndex(u => u.id_usuario === usuario.id_usuario);
    if (idx !== -1) {
      this.usuariosEnMemoria[idx] = usuario;
      await this.localStorage.setItem('usuarios', this.usuariosEnMemoria);
      // Si usas Firebase, también podrías actualizar aquí
    }
  }
}