import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage-social.service';
import { Seguir } from 'src/app/models/seguir.model';
import { Usuario } from 'src/app/models/usuario.model';
import { FirebaseService } from './firebase.service';
import { UtilsService } from './utils.service'; 

@Injectable({ providedIn: 'root' })
export class SeguirService {
  private seguimientosEnMemoria: Seguir[] = [];

  constructor(private localStorage: LocalStorageService,
    private firebaseService: FirebaseService,
    private utilsService: UtilsService
  ) {}

  // Cargar seguimientos en memoria desde Firebase o localStorage
async cargarSeguimientos(): Promise<void> {
  const online = await this.utilsService.checkInternetConnection();
  if (online) {
    try {
      const seguimientos = await this.firebaseService.getSeguimientos();
      this.seguimientosEnMemoria = seguimientos;
      await this.localStorage.setItem('seguimientos', seguimientos);
    } catch (error) {
      // Si falla Firebase, usa localStorage
      const seguimientos = await this.localStorage.getList<Seguir>('seguimientos') || [];
      this.seguimientosEnMemoria = seguimientos;
    }
  } else {
    // Si no hay internet, usa localStorage
    const seguimientos = await this.localStorage.getList<Seguir>('seguimientos') || [];
    this.seguimientosEnMemoria = seguimientos;
  }
}

  // Obtener todos los seguimientos en memoria
  getSeguimientos(): Seguir[] {
    return this.seguimientosEnMemoria;
  }

  // Seguir o dejar de seguir a un usuario (ahora string)
async toggleSeguir(idSeguidor: string, idSeguido: string): Promise<void> {
  const idx = this.seguimientosEnMemoria.findIndex(
    s => s.id_usuario_seguidor === idSeguidor && s.id_usuario_seguido === idSeguido
  );
  const online = await this.utilsService.checkInternetConnection();

  if (idx > -1) {
    // Si existe, alterna el estado
    this.seguimientosEnMemoria[idx].estado_seguimiento = !this.seguimientosEnMemoria[idx].estado_seguimiento;
    if (online) {
      await this.firebaseService.updateSeguimiento(this.seguimientosEnMemoria[idx]);
    }
  } else {
    // Si no existe, crea uno nuevo
    const nuevo = {
      id_usuario_seguidor: idSeguidor,
      id_usuario_seguido: idSeguido,
      estado_seguimiento: true
    };
    this.seguimientosEnMemoria.push(nuevo);
    if (online) {
      await this.firebaseService.addSeguimiento(nuevo);
    }
  }
  await this.localStorage.setItem('seguimientos', this.seguimientosEnMemoria);
}

async sincronizarSeguimientosLocales(): Promise<void> {
  const online = await this.utilsService.checkInternetConnection();
  if (!online) return;
  const seguimientosLocales = await this.localStorage.getList<Seguir>('seguimientos') || [];

  // Elimina duplicados: solo deja el último estado para cada par seguidor/seguido
  const mapa = new Map<string, Seguir>();
  for (const seg of seguimientosLocales) {
    const key = `${seg.id_usuario_seguidor}_${seg.id_usuario_seguido}`;
    mapa.set(key, seg); // Si hay varios, el último sobrescribe
  }
  const sinDuplicados = Array.from(mapa.values());

  for (const seguimiento of sinDuplicados) {
    // Puedes usar add o update según tu lógica, aquí se usa update para ambos casos
    await this.firebaseService.updateSeguimiento(seguimiento);
  }

  // Opcional: actualiza localStorage para dejar solo los no duplicados
  await this.localStorage.setItem('seguimientos', sinDuplicados);
}

  // Saber si el usuario ya sigue a otro usuario (ahora string)
  sigue(idSeguidor: string, idSeguido: string): boolean {
    return !!this.seguimientosEnMemoria.find(
      s => s.id_usuario_seguidor === idSeguidor &&
        s.id_usuario_seguido === idSeguido &&
        s.estado_seguimiento
    );
  }

  // Obtiene los usuarios que el usuario actual sigue (ahora string)
  getUsuariosSeguidos(usuarios: Usuario[], idUsuario: string): Usuario[] {
    const idsSeguidos = this.seguimientosEnMemoria
      .filter(s => s.id_usuario_seguidor === idUsuario && s.estado_seguimiento)
      .map(s => s.id_usuario_seguido);

    return usuarios.filter(u => idsSeguidos.includes(u.id_usuario));
  }

  // Filtra usuarios seguidos por nombre (ahora string)
  filtrarUsuariosSeguidos(usuarios: Usuario[], usuarioActualId: string, searchTerm: string): Usuario[] {
    const seguidos = this.getUsuariosSeguidos(usuarios, usuarioActualId);
    return seguidos.filter(user =>
      user.nombre_usuario.toLowerCase().includes(searchTerm)
    );
  }
}