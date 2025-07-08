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
import { BehaviorSubject, Observable, debounceTime, distinctUntilChanged, take } from 'rxjs';

import { Firestore, collection, collectionData, query, where, getDocs, addDoc, updateDoc, serverTimestamp } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ComunicacionService {
  mensajes$: Observable<Mensaje[]>;
  conversaciones$: Observable<Conversacion[]>;

  // --- Contador de mensajes no vistos ---
  private mensajesNoVistos = new BehaviorSubject<number>(0);
  public mensajesNoVistos$ = this.mensajesNoVistos.asObservable();

  // --- 🚀 CACHE INTELIGENTE PARA EVITAR BUCLES ---
  private usuarioActualCache: Usuario | null = null;
  private ultimaActualizacionUsuario: number = 0;
  private readonly CACHE_DURACION = 30000; // 30 segundos
  private conversacionesInicializadas = false;
  private mensajesInicializados = false;

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

    // 🚀 INICIALIZACIÓN OPTIMIZADA CON DEBOUNCE
    this.inicializarSuscripcionesOptimizadas();

    // 🚀 ESCUCHAR CAMBIOS DE USUARIO PARA INVALIDAR CACHE
    this.usuarioService.usuarioCambio$.subscribe(usuario => {
      if (usuario) {
        console.log('🔄 Usuario cambió, reinicializando ComunicacionService para:', usuario.nombre_usuario);
        this.invalidarCacheYReinicializar();
      } else {
        console.log('🚪 Usuario cerró sesión, limpiando ComunicacionService');
        this.resetearContadorMensajesNoVistos();
      }
    });
  }

  // --- 🚀 MÉTODOS DE CACHE INTELIGENTE ---
  private async getUsuarioActualRapido(): Promise<Usuario | null> {
    const ahora = Date.now();
    
    // Si el cache es válido, usarlo
    if (this.usuarioActualCache && (ahora - this.ultimaActualizacionUsuario) < this.CACHE_DURACION) {
      return this.usuarioActualCache;
    }

    // Cache expirado o no existe, actualizar
    try {
      this.usuarioActualCache = await this.usuarioService.getUsuarioActualConectado();
      this.ultimaActualizacionUsuario = ahora;
      return this.usuarioActualCache;
    } catch (error) {
      console.error('❌ Error obteniendo usuario actual:', error);
      return null;
    }
  }

  private invalidarCacheUsuario(): void {
    this.usuarioActualCache = null;
    this.ultimaActualizacionUsuario = 0;
  }

  private inicializarSuscripcionesOptimizadas(): void {
    // 🚀 CONVERSACIONES CON DEBOUNCE Y CONTROL DE INICIALIZACIÓN
    this.conversaciones$
      .pipe(
        debounceTime(500), // Esperar 500ms antes de procesar
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
      )
      .subscribe(async conversacionesOnline => {
        if (this.conversacionesInicializadas) return;
        await this.procesarConversacionesOnline(conversacionesOnline);
        this.conversacionesInicializadas = true;
      });

    // 🚀 MENSAJES CON DEBOUNCE Y CONTROL DE INICIALIZACIÓN
    this.mensajes$
      .pipe(
        debounceTime(300), // Debounce más corto para mensajes
        distinctUntilChanged((prev, curr) => prev?.length === curr?.length)
      )
      .subscribe(async mensajes => {
        await this.actualizarContadorMensajesNoVistosOptimizado(mensajes);
      });
  }

  private async procesarConversacionesOnline(conversacionesOnline: Conversacion[]): Promise<void> {
    const usuarioActual = await this.getUsuarioActualRapido();
    if (!conversacionesOnline || conversacionesOnline.length === 0 || !usuarioActual?.id_usuario) {
      return;
    }

    const conversacionesFiltradas = conversacionesOnline.filter(
      c =>
        c.id_usuario_emisor === usuarioActual.id_usuario ||
        c.id_usuario_receptor === usuarioActual.id_usuario
    );

    await this.localStorage.setItem('conversaciones', conversacionesFiltradas);

    // Guarda los ids de esas conversaciones para filtrar mensajes
    const idsConversaciones = conversacionesFiltradas.map(c => c.id_conversacion);

    // 🚀 SUSCRIPCIÓN ÚNICA A MENSAJES (no anidada)
    if (!this.mensajesInicializados) {
      this.mensajes$
        .pipe(
          debounceTime(300),
          distinctUntilChanged((prev, curr) => prev?.length === curr?.length)
        )
        .subscribe(async mensajesOnline => {
          await this.procesarMensajesOnline(mensajesOnline, idsConversaciones);
        });
      this.mensajesInicializados = true;
    }
  }

  private async procesarMensajesOnline(mensajesOnline: Mensaje[], idsConversaciones: string[]): Promise<void> {
    if (mensajesOnline && mensajesOnline.length > 0 && idsConversaciones.length > 0) {
      const mensajesFiltrados = mensajesOnline.filter(
        m => idsConversaciones.includes(m.id_conversacion)
      );
      await this.localStorage.setItem('mensajes', mensajesFiltrados);
    }
  }

  private async actualizarContadorMensajesNoVistosOptimizado(mensajes: Mensaje[]) {
    try {
      const usuarioActual = await this.getUsuarioActualRapido();
      if (!usuarioActual) {
        this.mensajesNoVistos.next(0);
        return;
      }
      const noVistos = mensajes.filter(mensaje =>
        !mensaje.estado_visto &&
        mensaje.id_usuario_emisor !== usuarioActual.id_usuario
      );
      this.mensajesNoVistos.next(noVistos.length);
    } catch (error) {
      this.mensajesNoVistos.next(0);
    }
  }

  // 🚀 MÉTODO PÚBLICO PARA INVALIDAR CACHE CUANDO CAMBIE EL USUARIO
  public invalidarCacheYReinicializar(): void {
    this.invalidarCacheUsuario();
    this.conversacionesInicializadas = false;
    this.mensajesInicializados = false;
    console.log('🔄 Cache de ComunicacionService invalidado');
  }

  private async actualizarContadorMensajesNoVistos(mensajes: Mensaje[]) {
    try {
      const usuarioActual = await this.usuarioService.getUsuarioActualConectado();
      if (!usuarioActual) {
        this.mensajesNoVistos.next(0);
        return;
      }
      const noVistos = mensajes.filter(mensaje =>
        !mensaje.estado_visto &&
        mensaje.id_usuario_emisor !== usuarioActual.id_usuario
      );
      this.mensajesNoVistos.next(noVistos.length);
    } catch (error) {
      this.mensajesNoVistos.next(0);
    }
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
    const online = await this.utilsService.checkInternetConnection();
    const mensajeCifrado = {
      ...mensaje,
      contenido: await this.cryptoService.cifrar(mensaje.contenido)
    };
    
    console.log(`📨 Enviando mensaje. Online: ${online}, Conversación: ${mensaje.id_conversacion}`);
    
    if (online) {
      try {
        const mensajesRef = collection(this.firestore, 'Mensaje');
        const docRef = await addDoc(mensajesRef, { 
          ...mensajeCifrado, 
          id_mensaje: '', 
          fecha_envio: serverTimestamp() 
        });
        await updateDoc(docRef, { id_mensaje: docRef.id });
        console.log(`✅ Mensaje enviado online exitosamente: ${docRef.id}`);
      } catch (error) {
        console.error('❌ Error al enviar mensaje online, guardando offline:', error);
        // Si falla el envío online, guarda offline
        const id = Date.now().toString();
        const mensajeOffline = {
          ...mensajeCifrado,
          id_mensaje: id,
          fecha_envio: new Date()
        };
        await this.localStorage.addToList<Mensaje>('mensajes_offline', mensajeOffline);
        console.log(`💾 Mensaje guardado offline como respaldo: ${id}`);
      }
    } else {
      const id = Date.now().toString();
      const mensajeOffline = {
        ...mensajeCifrado,
        id_mensaje: id,
        fecha_envio: new Date()
      };
      await this.localStorage.addToList<Mensaje>('mensajes_offline', mensajeOffline);
      console.log(`📴 Mensaje guardado offline (sin conexión): ${id}`);
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
    try {
      const mensajesRef = collection(this.firestore, 'Mensaje');
      
      // Buscar por contenido cifrado y conversación (más confiable que fecha)
      const q = query(
        mensajesRef,
        where('id_conversacion', '==', mensaje.id_conversacion),
        where('id_usuario_emisor', '==', mensaje.id_usuario_emisor),
        where('contenido', '==', mensaje.contenido)
      );
      
      const snapshot = await getDocs(q);
      const existe = !snapshot.empty;
      
      if (existe) {
        console.log(`🔍 Mensaje duplicado encontrado en Firestore para conversación: ${mensaje.id_conversacion}`);
      }
      
      return existe;
    } catch (error) {
      console.error('❌ Error verificando existencia de mensaje en Firestore:', error);
      // En caso de error, asumir que no existe para intentar sincronizar
      return false;
    }
  }

  async sincronizarMensajesLocales(): Promise<void> {
    const online = await this.utilsService.checkInternetConnection();
    if (!online) {
      console.log('❌ Sin conexión - no se pueden sincronizar mensajes offline');
      return;
    }

    console.log('🔄 Iniciando sincronización de mensajes offline...');
    let mensajesOffline = await this.localStorage.getList<Mensaje>('mensajes_offline') || [];
    
    if (mensajesOffline.length === 0) {
      console.log('✅ No hay mensajes offline para sincronizar');
      return;
    }

    console.log(`📨 Sincronizando ${mensajesOffline.length} mensajes offline`);
    const noSincronizados: Mensaje[] = [];
    let sincronizados = 0;

    for (const mensaje of mensajesOffline) {
      try {
        console.log(`📤 Intentando sincronizar mensaje: ${mensaje.id_mensaje}`);
        
        // Verificar si ya existe
        const existe = await this.existeMensajeEnFirestore(mensaje);
        if (!existe) {
          const mensajesRef = collection(this.firestore, 'Mensaje');
          const docRef = await addDoc(mensajesRef, { 
            ...mensaje, 
            id_mensaje: '', 
            fecha_envio: serverTimestamp() 
          });
          await updateDoc(docRef, { id_mensaje: docRef.id });
          sincronizados++;
          console.log(`✅ Mensaje sincronizado exitosamente: ${docRef.id}`);
        } else {
          console.log(`⚠️ Mensaje ya existe en Firestore, marcando como sincronizado: ${mensaje.id_mensaje}`);
          sincronizados++;
        }
      } catch (error) {
        console.error(`❌ Error sincronizando mensaje ${mensaje.id_mensaje}:`, error);
        noSincronizados.push(mensaje);
      }
    }
    
    console.log(`📊 Sincronización completada: ${sincronizados} sincronizados, ${noSincronizados.length} pendientes`);
    
    // Solo actualizar localStorage si hubo cambios
    if (noSincronizados.length !== mensajesOffline.length) {
      await this.localStorage.setItem('mensajes_offline', noSincronizados);
      console.log(`💾 LocalStorage actualizado: ${noSincronizados.length} mensajes pendientes`);
    }
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

  public resetearContadorMensajesNoVistos() {
    this.mensajesNoVistos.next(0);
  }

  // Método público para recalcular el contador de mensajes no vistos
  public async recalcularContadorMensajesNoVistos() {
    try {
      // Obtener todos los mensajes actuales del observable
      this.mensajes$.pipe(take(1)).subscribe(async mensajes => {
        await this.actualizarContadorMensajesNoVistosOptimizado(mensajes);
      });
    } catch (error) {
      console.error('Error al recalcular contador de mensajes no vistos:', error);
      this.mensajesNoVistos.next(0);
    }
  }

  // Método de diagnóstico para verificar el estado de sincronización
  async diagnosticarEstadoOffline(): Promise<{
    mensajes: number,
    publicaciones: number,
    comentarios: number,
    conversaciones: number,
    isOnline: boolean
  }> {
    const mensajesOffline = await this.localStorage.getList<Mensaje>('mensajes_offline') || [];
    const publicacionesOffline = await this.localStorage.getList<any>('publicaciones_personal') || [];
    const comentariosOffline = await this.localStorage.getList<any>('comentariosOffline') || [];
    const conversacionesOffline = await this.localStorage.getList<any>('conversaciones_offline') || [];
    const isOnline = await this.utilsService.checkInternetConnection();

    const diagnostico = {
      mensajes: mensajesOffline.length,
      publicaciones: publicacionesOffline.length,
      comentarios: comentariosOffline.length,
      conversaciones: conversacionesOffline.length,
      isOnline
    };

    console.log('🔍 Diagnóstico de estado offline:', diagnostico);
    return diagnostico;
  }
}