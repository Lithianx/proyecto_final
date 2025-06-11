import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Mensaje } from '../models/mensaje.model';
import { Usuario } from '../models/usuario.model';
import { Conversacion } from '../models/conversacion.model';
import { LocalStorageService } from './local-storage-social.service';

@Injectable({
  providedIn: 'root'
})
export class ComunicacionService {
  private mensajesSubject = new BehaviorSubject<Mensaje[]>([]);
  mensajes$ = this.mensajesSubject.asObservable();

  private conversacionesSubject = new BehaviorSubject<Conversacion[]>([]);
  conversaciones$ = this.conversacionesSubject.asObservable();

  constructor(private localStorage: LocalStorageService) {
    this.cargarMensajes();
    this.cargarConversaciones();
  }

  async cargarMensajes() {
    const mensajes = await this.localStorage.getList<Mensaje>('mensajes') || [];
    // Convierte fechas si es necesario
    mensajes.forEach(m => m.fecha_envio = m.fecha_envio ? new Date(m.fecha_envio) : undefined);
    this.mensajesSubject.next(mensajes);
  }

  async cargarConversaciones() {
    const conversaciones = await this.localStorage.getList<Conversacion>('conversaciones') || [];
    conversaciones.forEach(c => c.fecha_envio = c.fecha_envio ? new Date(c.fecha_envio) : undefined);
    this.conversacionesSubject.next(conversaciones);
  }

  getMensajesPorConversacion(id_conversacion: number): Mensaje[] {
    return this.mensajesSubject.getValue().filter(m => m.id_conversacion === id_conversacion);
  }

  getConversaciones(): Conversacion[] {
    return this.conversacionesSubject.getValue();
  }

  async enviarMensaje(mensaje: Mensaje) {
    const mensajes = this.mensajesSubject.getValue();
    mensajes.push(mensaje);
    await this.localStorage.setItem('mensajes', mensajes);
    this.mensajesSubject.next([...mensajes]);
  }

  async marcarMensajesComoVistos(id_conversacion: number, idUsuarioActual: number) {
    let mensajes = this.mensajesSubject.getValue();
    let huboCambio = false;
    mensajes = mensajes.map(m => {
      if (
        m.id_conversacion === id_conversacion &&
        m.id_usuario_emisor !== idUsuarioActual &&
        !m.estado_visto
      ) {
        huboCambio = true;
        return { ...m, estado_visto: true };
      }
      return m;
    });
    if (huboCambio) {
      await this.localStorage.setItem('mensajes', mensajes);
      this.mensajesSubject.next([...mensajes]);
    }
  }

  async agregarConversacion(conversacion: Conversacion) {
    const conversaciones = this.conversacionesSubject.getValue();
    conversaciones.push(conversacion);
    await this.localStorage.setItem('conversaciones', conversaciones);
    this.conversacionesSubject.next([...conversaciones]);
  }


filtrarConversacionesPorNombre(
  conversaciones: Conversacion[],
  usuarios: Usuario[],
  query: string
): Conversacion[] {
  return conversaciones.filter(conv => {
    const usuario = usuarios.find(
      u => u.id_usuario === conv.id_usuario_emisor || u.id_usuario === conv.id_usuario_receptor
    );
    return usuario ? usuario.nombre_usuario.toLowerCase().includes(query) : false;
  });
}


getUltimoMensajeDeConversacion(id_conversacion: number): Mensaje | undefined {
  return this.getMensajesPorConversacion(id_conversacion)
    .sort((a, b) => (b.fecha_envio?.getTime() || 0) - (a.fecha_envio?.getTime() || 0))[0];
}

async enviarMensajeMultimedia(
  tipo: 'imagen' | 'video' | 'audio',
  base64: string,
  idConversacion: number,
  idUsuario: number
) {
  const mensaje: Mensaje = {
    id_mensaje: new Date().getTime(),
    id_conversacion: idConversacion,
    id_usuario_emisor: idUsuario,
    contenido: `[${tipo}] ${base64}`,
    fecha_envio: new Date(),
    estado_visto: false,
  };
  await this.enviarMensaje(mensaje);
}


//respuestas automáticas
async enviarRespuestaAutomatica(idConversacion: number, idUsuario: number, contenido: string = '¡Entendido!') {
  const respuesta: Mensaje = {
    id_mensaje: new Date().getTime(),
    id_conversacion: idConversacion,
    id_usuario_emisor: idUsuario,
    contenido,
    fecha_envio: new Date(),
    estado_visto: false
  };
  await this.enviarMensaje(respuesta);
}
}