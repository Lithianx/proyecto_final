import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage-social.service';
import { Seguir } from 'src/app/models/seguir.model';
import { Usuario } from 'src/app/models/usuario.model';

@Injectable({ providedIn: 'root' })
export class SeguirService {
  private seguimientosEnMemoria: Seguir[] = [];

  constructor(private localStorage: LocalStorageService) {}

  // Cargar seguimientos en memoria (llamar en ngOnInit del componente)
  async cargarSeguimientos(): Promise<void> {
    //  if (navigator.onLine) {
    // const seguimientosFirebase = await this.firestore.collection<Seguir>('seguimientos').valueChanges().toPromise();
    // if (seguimientosFirebase && seguimientosFirebase.length > 0) {
    //   this.seguimientosEnMemoria = seguimientosFirebase;
    //   await this.localStorage.setItem('seguimientos', seguimientosFirebase);
    //   return;
    // }
    //}
    // Por ahora, solo local:
    const seguimientos = await this.localStorage.getList<Seguir>('seguimientos') || [];
  if (seguimientos && seguimientos.length > 0) {
      this.seguimientosEnMemoria = seguimientos;
    } else {
      this.seguimientosEnMemoria = this.getSeguimientosPorDefecto();
      await this.localStorage.setItem('seguimientos', this.seguimientosEnMemoria);
    }
  }


private getSeguimientosPorDefecto(): Seguir[] {
  return [
    { id_usuario_seguidor: 0, id_usuario_seguido: 2, estado_seguimiento: true },
    { id_usuario_seguidor: 0, id_usuario_seguido: 1, estado_seguimiento: false }
  ];
}

  // Obtener todos los seguimientos en memoria
  getSeguimientos(): Seguir[] {
    return this.seguimientosEnMemoria;
  }

  // Seguir o dejar de seguir a un usuario
  async toggleSeguir(idSeguidor: number, idSeguido: number): Promise<void> {
    const seguimiento = this.seguimientosEnMemoria.find(
      s => s.id_usuario_seguidor === idSeguidor && s.id_usuario_seguido === idSeguido
    );
    if (seguimiento) {
      seguimiento.estado_seguimiento = !seguimiento.estado_seguimiento;
    } else {
      this.seguimientosEnMemoria.push({
        id_usuario_seguidor: idSeguidor,
        id_usuario_seguido: idSeguido,
        estado_seguimiento: true
      });
    }
    await this.localStorage.setItem('seguimientos', this.seguimientosEnMemoria);
  }

  // Saber si el usuario ya sigue a otro usuario
  sigue(idSeguidor: number, idSeguido: number): boolean {
    return !!this.seguimientosEnMemoria.find(
      s => s.id_usuario_seguidor === idSeguidor &&
        s.id_usuario_seguido === idSeguido &&
        s.estado_seguimiento
    );
  }


  // Obtiene los usuarios que el usuario actual sigue
getUsuariosSeguidos(usuarios: Usuario[], idUsuario: number): Usuario[] {
  const idsSeguidos = this.seguimientosEnMemoria
    .filter(s => s.id_usuario_seguidor === idUsuario && s.estado_seguimiento)
    .map(s => s.id_usuario_seguido);

  return usuarios.filter(u => idsSeguidos.includes(u.id_usuario));
}
}