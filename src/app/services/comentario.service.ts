import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';
import { Comentario } from '../models/comentario.model';
import { LocalStorageService } from './local-storage-social.service';
import { FirebaseService } from './firebase.service';
import { UtilsService } from './utils.service';
import { PublicacionService } from './publicacion.service';

@Injectable({ providedIn: 'root' })
export class ComentarioService {
  comentarios$: Observable<Comentario[]>;

  constructor(
    private localStorage: LocalStorageService,
    private firebaseService: FirebaseService,
    private firestore: Firestore,
    private utilsService: UtilsService,
    private publicacionService: PublicacionService
  ) {
    const comentariosRef = collection(this.firestore, 'Comentario');
    this.comentarios$ = collectionData(comentariosRef, { idField: 'id_comentario' }) as Observable<Comentario[]>;

    // Solo guarda en local si el array recibido NO está vacío
    this.comentarios$.subscribe(async comentariosOnline => {
      if (comentariosOnline && comentariosOnline.length > 0) {
        await this.localStorage.setItem('comentarios', comentariosOnline);
      }
      // Si el array está vacío, NO sobreescribas el local
    });
  }

  // Agregar un comentario (online u offline)
  async agregarComentario(comentario: Comentario): Promise<void> {
    const online = await this.utilsService.checkInternetConnection();
    if (online) {
      const id = await this.firebaseService.addComentario(comentario);
      // El observable comentarios$ se actualizará y guardará en local automáticamente
    } else {
      const id = Date.now().toString();
      const comentarioOffline = {
        ...comentario,
        id_comentario: id,
        fecha_comentario: new Date(),
      };
      await this.localStorage.addToList<any>('comentariosOffline', comentarioOffline);
    }
  }

  // Obtener comentarios online desde local (para visualizar offline)
  async getComentariosOnlineLocal(): Promise<Comentario[]> {
    return await this.localStorage.getList<Comentario>('comentarios') || [];
  }

  // Obtener comentarios offline (pendientes de sincronizar)
  async getComentariosOffline(): Promise<any[]> {
    return await this.localStorage.getList<any>('comentariosOffline') || [];
  }

  // Sincronizar comentarios offline con Firebase
  async sincronizarComentariosLocales(): Promise<void> {
    const online = await this.utilsService.checkInternetConnection();
    if (!online) {
      console.log('❌ Sin conexión - no se pueden sincronizar comentarios offline');
      return;
    }

    console.log('🔄 Iniciando sincronización de comentarios offline...');
    const comentariosOffline = await this.getComentariosOffline();
    
    if (comentariosOffline.length === 0) {
      console.log('✅ No hay comentarios offline para sincronizar');
      return;
    }

    console.log(`💬 Sincronizando ${comentariosOffline.length} comentarios offline`);
    const noSincronizados: any[] = [];
    let sincronizados = 0;

    for (const comentario of comentariosOffline) {
      try {
        console.log(`📤 Intentando sincronizar comentario para publicación: ${comentario.id_publicacion}`);
        
        const publicacion = await this.publicacionService.getPublicacionById(comentario.id_publicacion);
        if (!publicacion) {
          console.log(`⚠️ Publicación no encontrada para comentario: ${comentario.id_publicacion}`);
          noSincronizados.push(comentario);
          continue;
        }
        
        await this.firebaseService.addComentario(comentario);
        sincronizados++;
        console.log(`✅ Comentario sincronizado exitosamente para publicación: ${comentario.id_publicacion}`);
        // El observable comentarios$ se actualizará y guardará en local automáticamente
      } catch (error) {
        console.error(`❌ Error sincronizando comentario para publicación ${comentario.id_publicacion}:`, error);
        noSincronizados.push(comentario);
      }
    }

    console.log(`📊 Sincronización de comentarios completada: ${sincronizados} sincronizados, ${noSincronizados.length} pendientes`);

    // Guarda solo los no sincronizados para el próximo intento
    await this.localStorage.setItem('comentariosOffline', noSincronizados);
  }
}