import { Injectable } from '@angular/core';
import { Mensaje } from '../models/mensaje.model';
import { Usuario } from '../models/usuario.model';
import { Conversacion } from '../models/conversacion.model';
import { Publicacion } from '../models/publicacion.model';
import { LocalStorageService } from './local-storage-social.service';
import { FirebaseService } from './firebase.service';
import { UtilsService } from './utils.service';
import { CryptoService } from './crypto.service';
import { UsuarioService } from './usuario.service';

import { Firestore, collection, collectionData, query, where, getDocs, addDoc, updateDoc, serverTimestamp } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComunicacionService {
  mensajes$: Observable<Mensaje[]>;
  conversaciones$: Observable<Conversacion[]>;

  constructor(
    private localStorage: LocalStorageService,
    private firebaseService: FirebaseService,
    private firestore: Firestore,
    private utilsService: UtilsService,
    private cryptoService: CryptoService,
    private usuarioService: UsuarioService
  ) {
    const mensajesRef = collection(this.firestore, 'Mensaje');
    this.mensajes$ = collectionData(mensajesRef, { idField: 'id_mensaje' }) as Observable<Mensaje[]>;

    const conversacionesRef = collection(this.firestore, 'Conversacion');
    this.conversaciones$ = collectionData(conversacionesRef, { idField: 'id_conversacion' }) as Observable<Conversacion[]>;

    // Guardar conversaciones online en local para visualización offline (solo las del usuario actual)
    this.conversaciones$.subscribe(async conversacionesOnline => {
      const usuarioActual = await this.usuarioService.getUsuarioActualConectado();
      if (conversacionesOnline && conversacionesOnline.length > 0 && usuarioActual && usuarioActual.id_usuario) {
        const conversacionesFiltradas = conversacionesOnline.filter(
          c =>
            c.id_usuario_emisor === usuarioActual.id_usuario ||
            c.id_usuario_receptor === usuarioActual.id_usuario
        );
        await this.localStorage.setItem('conversaciones', conversacionesFiltradas);

        // Guarda los ids de esas conversaciones para filtrar mensajes
        const idsConversaciones = conversacionesFiltradas.map(c => c.id_conversacion);

        // Guardar mensajes online en local para visualización offline (solo los de las conversaciones del usuario actual)
        this.mensajes$.subscribe(async mensajesOnline => {
          if (mensajesOnline && mensajesOnline.length > 0) {
            const mensajesFiltrados = mensajesOnline.filter(
              m => idsConversaciones.includes(m.id_conversacion)
            );
            await this.localStorage.setItem('mensajes', mensajesFiltrados);
          }
        });
      }
    });
  }

  filtrarMensajesPorConversacion(mensajes: Mensaje[], id_conversacion: string): Mensaje[] {
    return mensajes.filter(m => String(m.id_conversacion) === id_conversacion);
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

  getUltimoMensajeDeConversacion(mensajes: Mensaje[], id_conversacion: string): Mensaje | undefined {
    return mensajes
      .filter(m => String(m.id_conversacion) === id_conversacion)
      .sort((a, b) => {
        const fechaA = a.fecha_envio instanceof Date
          ? a.fecha_envio.getTime()
          : (typeof a.fecha_envio === 'object' && a.fecha_envio !== null && 'toDate' in a.fecha_envio
            ? (a.fecha_envio as { toDate: () => Date }).toDate().getTime()
            : new Date(a.fecha_envio as string).getTime());
        const fechaB = b.fecha_envio instanceof Date
          ? b.fecha_envio.getTime()
          : (typeof b.fecha_envio === 'object' && b.fecha_envio !== null && 'toDate' in b.fecha_envio
            ? (b.fecha_envio as { toDate: () => Date }).toDate().getTime()
            : new Date(b.fecha_envio as string).getTime());
        return fechaB - fechaA;
      })[0];
  }

  async enviarMensaje(mensaje: Mensaje): Promise<boolean> {
    if (
      mensaje.contenido.startsWith('[video]') ||
      mensaje.contenido.endsWith('.mp4') ||
      mensaje.contenido.endsWith('.webm') ||
      mensaje.contenido.endsWith('.mov')
    ) {
      alert('No se pueden enviar videos por este chat.');
      return false;
    }

    const online = await this.utilsService.checkInternetConnection();
    const mensajeCifrado = {
      ...mensaje,
      contenido: await this.cryptoService.cifrar(mensaje.contenido)
    };
    if (online) {
      try {
        const mensajesRef = collection(this.firestore, 'Mensaje');
        const docRef = await addDoc(mensajesRef, { ...mensajeCifrado, id_mensaje: '', fecha_envio: serverTimestamp() });
        await updateDoc(docRef, { id_mensaje: docRef.id });
      } catch (error) {
        console.error('Error al enviar mensaje a Firestore:', error);
      }
    } else {
      const id = Date.now().toString();
      const mensajeOffline = {
        ...mensajeCifrado,
        id_mensaje: id,
        fecha_envio: new Date()
      };
      await this.localStorage.addToList<Mensaje>('mensajes_offline', mensajeOffline);
    }
    return true;
  }

  async getMensajesOfflineDescifrados(): Promise<Mensaje[]> {
    const mensajesOffline = await this.getMensajesOffline();
    return Promise.all(mensajesOffline.map(async m => ({
      ...m,
      contenido: await this.cryptoService.descifrar(m.contenido)
    })));
  }

  async getMensajesDescifrados(mensajes: Mensaje[]): Promise<Mensaje[]> {
    return Promise.all(mensajes.map(async m => ({
      ...m,
      contenido: await this.cryptoService.descifrar(m.contenido)
    })));
  }

  async getMensajesOffline(): Promise<Mensaje[]> {
    return await this.localStorage.getList<Mensaje>('mensajes_offline') || [];
  }

  async getMensajesLocales(): Promise<Mensaje[]> {
    return await this.localStorage.getList<Mensaje>('mensajes') || [];
  }

  async marcarMensajesComoVistos(mensajes: Mensaje[], _id_conversacion: string, _idUsuarioActual: string) {
    for (const m of mensajes) {
      await this.firebaseService.updateMensaje({ ...m, estado_visto: true });
    }
  }

  async agregarConversacion(conversacion: Conversacion) {
    const online = await this.utilsService.checkInternetConnection();
    if (online) {
      const conversacionesRef = collection(this.firestore, 'Conversacion');
      const docRef = await addDoc(conversacionesRef, { ...conversacion, id_conversacion: '' });
      await updateDoc(docRef, { id_conversacion: docRef.id });
    } else {
      const id = Date.now().toString();
      const conversacionOffline = {
        ...conversacion,
        id_conversacion: id,
        fecha_envio: new Date()
      };
      await this.localStorage.addToList<Conversacion>('conversaciones_offline', conversacionOffline);
    }
  }

  async getConversacionesOffline(): Promise<Conversacion[]> {
    return await this.localStorage.getList<Conversacion>('conversaciones_offline') || [];
  }

  async getConversacionesLocales(): Promise<Conversacion[]> {
    return await this.localStorage.getList<Conversacion>('conversaciones') || [];
  }

  async enviarMensajeMultimedia(
    tipo: 'imagen' | 'video' | 'audio',
    base64: string,
    idConversacion: string,
    idUsuario: string
  ) {
    if (tipo === 'video') {
      alert('No se pueden enviar videos por este chat.');
      return;
    }
    const mensaje: Mensaje = {
      id_mensaje: new Date().getTime().toString(),
      id_conversacion: idConversacion,
      id_usuario_emisor: idUsuario,
      contenido: `[${tipo}] ${base64}`,
      estado_visto: false,
      fecha_envio: new Date()
    };
    await this.enviarMensaje(mensaje);
  }

  filtrarConversacionesPorUsuario(conversaciones: Conversacion[], idUsuario: string): Conversacion[] {
    return conversaciones.filter(
      c =>
        String(c.id_usuario_emisor) === String(idUsuario) ||
        String(c.id_usuario_receptor) === String(idUsuario)
    );
  }

  async obtenerOcrearConversacionPrivada(idUsuario1: string, idUsuario2: string): Promise<string> {
    const conversacionesRef = collection(this.firestore, 'Conversacion');
    const q = query(
      conversacionesRef,
      where('id_usuario_emisor', 'in', [idUsuario1, idUsuario2]),
      where('id_usuario_receptor', 'in', [idUsuario1, idUsuario2])
    );
    const snapshot = await getDocs(q);

    const conversacionExistente = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() as any }))
      .find(conv =>
        (conv.id_usuario_emisor === idUsuario1 && conv.id_usuario_receptor === idUsuario2) ||
        (conv.id_usuario_emisor === idUsuario2 && conv.id_usuario_receptor === idUsuario1)
      );

    if (conversacionExistente) {
      return conversacionExistente.id;
    } else {
      const nuevaConversacion = {
        id_usuario_emisor: idUsuario1,
        id_usuario_receptor: idUsuario2,
        fecha_envio: serverTimestamp(),
      };
      const docRef = await addDoc(conversacionesRef, nuevaConversacion);
      await updateDoc(docRef, { id_conversacion: docRef.id });
      return docRef.id;
    }
  }

  async enviarPublicacion(publicacion: Publicacion, id_conversacion: string, id_usuario_emisor: string) {
    const mensaje: Mensaje = {
      id_mensaje: '', // Se generará en Firestore
      id_conversacion: id_conversacion,
      id_usuario_emisor: id_usuario_emisor,
      contenido: JSON.stringify(publicacion),
      estado_visto: false,
      fecha_envio: new Date()
    };
    await this.enviarMensaje(mensaje);
  }

  private async existeMensajeEnFirestore(mensaje: Mensaje): Promise<boolean> {
    const mensajesRef = collection(this.firestore, 'Mensaje');
    const q = query(
      mensajesRef,
      where('id_conversacion', '==', mensaje.id_conversacion),
      where('id_usuario_emisor', '==', mensaje.id_usuario_emisor),
      where('contenido', '==', mensaje.contenido),
      where('fecha_envio', '==', mensaje.fecha_envio)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  }

  async sincronizarMensajesLocales(): Promise<void> {
    const online = await this.utilsService.checkInternetConnection();
    if (!online) return;

    let mensajesOffline = await this.localStorage.getList<Mensaje>('mensajes_offline') || [];
    const noSincronizados: Mensaje[] = [];

    for (const mensaje of mensajesOffline) {
      try {
        const existe = await this.existeMensajeEnFirestore(mensaje);
        if (!existe) {
          const mensajesRef = collection(this.firestore, 'Mensaje');
          const docRef = await addDoc(mensajesRef, { ...mensaje, id_mensaje: '', fecha_envio: serverTimestamp() });
          await updateDoc(docRef, { id_mensaje: docRef.id });
        }
      } catch {
        noSincronizados.push(mensaje);
      }
    }
    await this.localStorage.setItem('mensajes_offline', noSincronizados);
  }

  async sincronizarConversacionesLocales(): Promise<void> {
    const online = await this.utilsService.checkInternetConnection();
    if (!online) return;

    const conversacionesOffline = await this.localStorage.getList<Conversacion>('conversaciones_offline') || [];
    const noSincronizadas: Conversacion[] = [];

    for (const conversacion of conversacionesOffline) {
      try {
        const conversacionesRef = collection(this.firestore, 'Conversacion');
        const docRef = await addDoc(conversacionesRef, { ...conversacion, id_conversacion: '' });
        await updateDoc(docRef, { id_conversacion: docRef.id });
      } catch {
        noSincronizadas.push(conversacion);
      }
    }
    await this.localStorage.setItem('conversaciones_offline', noSincronizadas);
  }
}