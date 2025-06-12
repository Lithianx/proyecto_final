import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Mensaje } from '../models/mensaje.model';
import { Usuario } from '../models/usuario.model';
import { Conversacion } from '../models/conversacion.model';
import { LocalStorageService } from './local-storage-social.service';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class ComunicacionService {
  private mensajesSubject = new BehaviorSubject<Mensaje[]>([]);
  mensajes$ = this.mensajesSubject.asObservable();

  private conversacionesSubject = new BehaviorSubject<Conversacion[]>([]);
  conversaciones$ = this.conversacionesSubject.asObservable();

  constructor(
    private localStorage: LocalStorageService,
    private firebaseService: FirebaseService

  ) {
    this.cargarMensajes();
    this.cargarConversaciones();
  }

  async cargarMensajes() {
    if (navigator.onLine) {
      try {
        const mensajes = await this.firebaseService.getMensajes();
        mensajes.forEach(m => m.fecha_envio = m.fecha_envio ? new Date(m.fecha_envio) : undefined);
        this.mensajesSubject.next(mensajes);
        await this.localStorage.setItem('mensajes', mensajes);
      } catch {
        const mensajes = await this.localStorage.getList<Mensaje>('mensajes') || [];
        mensajes.forEach(m => m.fecha_envio = m.fecha_envio ? new Date(m.fecha_envio) : undefined);
        this.mensajesSubject.next(mensajes);
      }
    } else {
      const mensajes = await this.localStorage.getList<Mensaje>('mensajes') || [];
      mensajes.forEach(m => m.fecha_envio = m.fecha_envio ? new Date(m.fecha_envio) : undefined);
      this.mensajesSubject.next(mensajes);
    }
  }

  async cargarConversaciones() {
    if (navigator.onLine) {
      try {
        const conversaciones = await this.firebaseService.getConversaciones();
        conversaciones.forEach(c => c.fecha_envio = c.fecha_envio ? new Date(c.fecha_envio) : undefined);
        this.conversacionesSubject.next(conversaciones);
        await this.localStorage.setItem('conversaciones', conversaciones);
      } catch {
        const conversaciones = await this.localStorage.getList<Conversacion>('conversaciones') || [];
        conversaciones.forEach(c => c.fecha_envio = c.fecha_envio ? new Date(c.fecha_envio) : undefined);
        this.conversacionesSubject.next(conversaciones);
      }
    } else {
      const conversaciones = await this.localStorage.getList<Conversacion>('conversaciones') || [];
      conversaciones.forEach(c => c.fecha_envio = c.fecha_envio ? new Date(c.fecha_envio) : undefined);
      this.conversacionesSubject.next(conversaciones);
    }
  }

  // Cambia a string
  getMensajesPorConversacion(id_conversacion: string): Mensaje[] {
    return this.mensajesSubject.getValue().filter(m => String(m.id_conversacion) === id_conversacion);
  }

  getConversaciones(): Conversacion[] {
    return this.conversacionesSubject.getValue();
  }

async enviarMensaje(mensaje: Mensaje) {
  // 1. Guarda el mensaje con id_mensaje temporal (por ejemplo, '')
  if (navigator.onLine) {
    // Agrega el mensaje a Firestore y obtiene el ID real
    const docRef = await this.firebaseService.addMensaje({ ...mensaje, id_mensaje: '' });
    // 2. Actualiza el mensaje con el id generado por Firestore
    const mensajeConId = { ...mensaje, id_mensaje: docRef.id };
    await this.firebaseService.updateMensaje(mensajeConId);

    // 3. Actualiza localmente el mensaje con el id real
    const mensajes = this.mensajesSubject.getValue();
    mensajes.push(mensajeConId);
    this.mensajesSubject.next([...mensajes]);
    await this.localStorage.setItem('mensajes', mensajes);
  } else {
    // Modo offline: solo local
    const mensajes = this.mensajesSubject.getValue();
    mensajes.push(mensaje);
    this.mensajesSubject.next([...mensajes]);
    await this.localStorage.setItem('mensajes', mensajes);
  }
}

  async marcarMensajesComoVistos(id_conversacion: string, idUsuarioActual: string) {
    let mensajes = this.mensajesSubject.getValue();
    let huboCambio = false;
    mensajes = mensajes.map(m => {
      if (
        String(m.id_conversacion) === id_conversacion &&
        m.id_usuario_emisor !== idUsuarioActual &&
        !m.estado_visto
      ) {
        huboCambio = true;
        const actualizado = { ...m, estado_visto: true };
        if (navigator.onLine) {
          this.firebaseService.updateMensaje(actualizado);
        }
        return actualizado;
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
    this.conversacionesSubject.next([...conversaciones]);
    await this.localStorage.setItem('conversaciones', conversaciones);

    if (navigator.onLine) {
      await this.firebaseService.addConversacion(conversacion);
    }
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

  getUltimoMensajeDeConversacion(id_conversacion: string): Mensaje | undefined {
    return this.getMensajesPorConversacion(id_conversacion)
      .sort((a, b) => (b.fecha_envio?.getTime() || 0) - (a.fecha_envio?.getTime() || 0))[0];
  }

  async enviarMensajeMultimedia(
    tipo: 'imagen' | 'video' | 'audio',
    base64: string,
    idConversacion: string,
    idUsuario: string
  ) {
    const mensaje: Mensaje = {
      id_mensaje: new Date().getTime().toString(),
      id_conversacion: idConversacion,
      id_usuario_emisor: idUsuario,
      contenido: `[${tipo}] ${base64}`,
      fecha_envio: new Date(),
      estado_visto: false,
    };
    await this.enviarMensaje(mensaje);
  }

  // Respuestas automáticas
  async enviarRespuestaAutomatica(idConversacion: string, idUsuario: string, contenido: string = '¡Entendido!') {
    const respuesta: Mensaje = {
      id_mensaje: new Date().getTime().toString(),
      id_conversacion: idConversacion,
      id_usuario_emisor: idUsuario,
      contenido,
      fecha_envio: new Date(),
      estado_visto: false
    };
    await this.enviarMensaje(respuesta);
  }
}