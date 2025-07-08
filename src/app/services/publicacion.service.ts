import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage-social.service';
import { Publicacion } from '../models/publicacion.model';
import { Seguir } from '../models/seguir.model';
import { FirebaseService } from './firebase.service';
import { FirebaseStorageService } from './firebase-storage.service';
import { Firestore, collection, collectionData, serverTimestamp } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { UtilsService } from './utils.service';

@Injectable({ providedIn: 'root' })
export class PublicacionService {
  publicaciones$: Observable<Publicacion[]>;
  constructor(private localStorage: LocalStorageService,
    private firebaseService: FirebaseService,
    private firebaseStorageService: FirebaseStorageService,
    private firestore: Firestore,
    private utilsService: UtilsService
  ) {
    const publicacionesRef = collection(this.firestore, 'Publicacion');
    this.publicaciones$ = collectionData(publicacionesRef, { idField: 'id_publicacion' }) as Observable<Publicacion[]>;
  }

  // Obtiene publicaciones según conexión (y con precarga si no hay)
  async getPublicaciones(): Promise<Publicacion[]> {
    let publicaciones: Publicacion[] | null = null;
    const online = await this.utilsService.checkInternetConnection();
    
    if (online) {
      console.log('📡 Cargando publicaciones online...');
      try {
        publicaciones = await this.firebaseService.getPublicaciones();
      } catch (error) {
        console.error('❌ Error cargando publicaciones online:', error);
      }
    }
    
    if (!publicaciones) {
      console.log('📴 Cargando publicaciones desde localStorage...');
      // Cargar publicaciones locales
      const publicacionesLocales = await this.localStorage.getList<Publicacion>('publicaciones') || [];
      
      // Si estamos offline, también incluir publicaciones personales
      if (!online) {
        const publicacionesPersonales = await this.getPublicacionesPersonal();
        publicaciones = [...publicacionesLocales, ...publicacionesPersonales];
        console.log(`📄 Publicaciones offline cargadas: ${publicacionesLocales.length} locales + ${publicacionesPersonales.length} personales = ${publicaciones.length} total`);
      } else {
        publicaciones = publicacionesLocales;
        console.log(`📄 Publicaciones locales cargadas: ${publicaciones.length}`);
      }
    }
    
    if (!publicaciones || publicaciones.length === 0) {
      publicaciones = [];
    }
    
    // Eliminar duplicados por ID
    const publicacionesUnicas = publicaciones.filter((pub, index, self) => 
      index === self.findIndex(p => p.id_publicacion === pub.id_publicacion)
    );
    
    publicacionesUnicas.sort((a, b) => new Date(b.fecha_publicacion).getTime() - new Date(a.fecha_publicacion).getTime());
    return publicacionesUnicas;
  }

  ////ONLINE//////

  // Obtiene publicación por ID según conexión
  async getPublicacionById(id: string): Promise<Publicacion | undefined> {
    const online = await this.utilsService.checkInternetConnection();
    
    if (online) {
      const publicaciones = await this.getPublicaciones();
      return publicaciones.find(p => p.id_publicacion === id);
    } else {
      // Buscar en todas las fuentes offline
      const publicacionesLocales = await this.localStorage.getList<Publicacion>('publicaciones') || [];
      const publicacionesPersonales = await this.getPublicacionesPersonal();
      const todasLasPublicaciones = [...publicacionesLocales, ...publicacionesPersonales];
      
      const encontrada = todasLasPublicaciones.find(p => p.id_publicacion === id);
      console.log(`🔍 Buscando publicación ${id} offline. Encontrada: ${!!encontrada}`);
      return encontrada;
    }
  }

  // Agrega publicación según conexión
async addPublicacion(publicacion: Publicacion) {
  const online = await this.utilsService.checkInternetConnection();
  if (online) {
    // No agregues fecha_publicacion aquí, la pone el servidor
    const id = await this.firebaseService.addPublicacion(publicacion);
    const publicacionConId = { ...publicacion, id_publicacion: id };
    await this.localStorage.addToList<Publicacion>('publicaciones', publicacionConId);
    return id;
  } else {
    const id = Date.now().toString();
    const publicacionConId = {
      ...publicacion,
      id_publicacion: id,
      fecha_publicacion: new Date() // Solo local/offline
    };
    await this.localStorage.addToList<Publicacion>('publicaciones_personal', publicacionConId);
    return id;
  }
}

  // Edita publicación según conexión
  async updatePublicacion(publicacion: Publicacion) {
    const online = await this.utilsService.checkInternetConnection();
    console.log(`💾 Actualizando publicación ${publicacion.id_publicacion}. Online: ${online}`);
    
    if (online) {
      try {
        await this.firebaseService.updatePublicacion(publicacion);
        console.log('✅ Publicación actualizada en Firebase');
        
        // Actualizar en localStorage
        const publicaciones = await this.localStorage.getList<Publicacion>('publicaciones') || [];
        const actualizadas = publicaciones.map(p =>
          p.id_publicacion === publicacion.id_publicacion ? { ...publicacion } : p
        );
        await this.localStorage.setItem('publicaciones', actualizadas);

        // Eliminar de publicaciones personales si existe (ya no es offline)
        const personales = await this.getPublicacionesPersonal();
        const filtradas = personales.filter(p => p.id_publicacion !== publicacion.id_publicacion);
        await this.localStorage.setItem('publicaciones_personal', filtradas);
        
        console.log('✅ LocalStorage actualizado');
      } catch (error) {
        console.error('❌ Error actualizando en Firebase, guardando offline:', error);
        await this.updatePublicacionPersonal(publicacion);
      }
    } else {
      console.log('📴 Actualizando publicación offline');
      
      // Buscar en ambas listas: locales y personales
      const publicacionesLocales = await this.localStorage.getList<Publicacion>('publicaciones') || [];
      const publicacionesPersonales = await this.getPublicacionesPersonal();
      
      // Verificar si existe en publicaciones locales
      const existeEnLocales = publicacionesLocales.some(p => p.id_publicacion === publicacion.id_publicacion);
      const existeEnPersonales = publicacionesPersonales.some(p => p.id_publicacion === publicacion.id_publicacion);
      
      if (existeEnLocales) {
        // Actualizar en publicaciones locales
        const actualizadas = publicacionesLocales.map(p =>
          p.id_publicacion === publicacion.id_publicacion ? { ...publicacion } : p
        );
        await this.localStorage.setItem('publicaciones', actualizadas);
        console.log('✅ Publicación actualizada en publicaciones locales');
        
        // También agregar/actualizar en publicaciones personales para sincronización posterior
        if (existeEnPersonales) {
          await this.updatePublicacionPersonal(publicacion);
          console.log('✅ Publicación actualizada en publicaciones personales para sincronización');
        } else {
          // Agregar a publicaciones personales para sincronización
          const publicacionParaSincronizar = { ...publicacion };
          await this.localStorage.addToList<Publicacion>('publicaciones_personal', publicacionParaSincronizar);
          console.log('✅ Publicación agregada a publicaciones personales para sincronización');
        }
      } else {
        // Solo actualizar en publicaciones personales
        await this.updatePublicacionPersonal(publicacion);
        console.log('✅ Publicación actualizada en publicaciones personales');
      }
    }
  }

  // Elimina publicación según conexión
  async removePublicacion(id: string) {
    const online = await this.utilsService.checkInternetConnection();
    if (online) {
      // Obtener la publicación antes de eliminarla para eliminar la imagen
      const publicacion = await this.getPublicacionById(id);
      
      // Eliminar la imagen de Storage si existe y no es una URL externa (Giphy)
      if (publicacion?.imagen && 
          publicacion.imagen.includes('firebasestorage.googleapis.com') &&
          !publicacion.imagen.startsWith('https://media.giphy.com/')) {
        try {
          await this.firebaseStorageService.deleteImage(publicacion.imagen);
        } catch (error) {
          console.error('Error al eliminar imagen de Storage:', error);
        }
      }

      await this.firebaseService.removePublicacion(id);
      await this.firebaseService.removeGuardadosByPublicacion(id);
      await this.firebaseService.removeLikesByPublicacion(id);
      await this.firebaseService.removeComentariosByPublicacion(id);
      await this.firebaseService.removeComentarioLikesByPublicacion(id);

      const publicaciones = await this.localStorage.getList<Publicacion>('publicaciones') || [];
      const filtradas = publicaciones.filter(p => p.id_publicacion !== id);
      await this.localStorage.setItem('publicaciones', filtradas);

      await this.localStorage.removeItemsByField('publicacionesGuardadas', 'id_publicacion', id);
      await this.localStorage.removeItemsByField('publicacionLikes', 'id_publicacion', id);
      await this.localStorage.removeItemsByField('comentarioLikes', 'id_publicacion', id);
      await this.localStorage.removeItemsByField('comentarios', 'id_publicacion', id);
    } else {
      await this.removePublicacionPersonal(id);
      await this.localStorage.removeItemsByField('publicacionesGuardadas', 'id_publicacion', id);
      await this.localStorage.removeItemsByField('publicacionLikes', 'id_publicacion', id);
      await this.localStorage.removeItemsByField('comentarioLikes', 'id_publicacion', id);
      await this.localStorage.removeItemsByField('comentarios', 'id_publicacion', id);
    }
  }

  ////OFFLINE//////

  // Publicaciones personales (creadas offline, no sincronizadas)
  async getPublicacionesPersonal(): Promise<Publicacion[]> {
    const publicaciones = await this.localStorage.getList<Publicacion>('publicaciones_personal') || [];
    // Ordenar por fecha descendente
    return publicaciones.sort((a, b) => new Date(b.fecha_publicacion).getTime() - new Date(a.fecha_publicacion).getTime());
  }


  async updatePublicacionPersonal(publicacion: Publicacion) {
    const publicaciones = await this.getPublicacionesPersonal();
    const actualizadas = publicaciones.map(p =>
      p.id_publicacion === publicacion.id_publicacion ? { ...publicacion } : p
    );
    await this.localStorage.setItem('publicaciones_personal', actualizadas);
  }

  // Elimina publicación personal según conexión
  async removePublicacionPersonal(id: string) {
    const publicaciones = await this.getPublicacionesPersonal();
    const filtradas = publicaciones.filter(p => p.id_publicacion !== id);
    await this.localStorage.setItem('publicaciones_personal', filtradas);
  }






  // Sincroniza publicaciones personales cuando haya internet
  async sincronizarPublicacionesPersonales() {
    const online = await this.utilsService.checkInternetConnection();
    if (!online) {
      console.log('❌ Sin conexión - no se pueden sincronizar publicaciones offline');
      return;
    }

    console.log('🔄 Iniciando sincronización de publicaciones offline...');
    const personales = await this.getPublicacionesPersonal();
    
    if (personales.length === 0) {
      console.log('✅ No hay publicaciones offline para sincronizar');
      return;
    }

    console.log(`📝 Sincronizando ${personales.length} publicaciones offline`);
    const sincronizadas: Publicacion[] = [];
    const noSincronizadas: Publicacion[] = [];

    for (const pub of personales) {
      try {
        console.log(`📤 Intentando sincronizar publicación: ${pub.id_publicacion}`);
        
        // Verificar si es una publicación nueva (ID generado localmente) o editada (ID de Firebase)
        const esPublicacionNueva = this.esIdGeneradoLocalmente(pub.id_publicacion);
        
        // Si la imagen es base64, subirla a Firebase Storage antes de sincronizar
        if (pub.imagen && pub.imagen.startsWith('data:image/')) {
          console.log(`📤 Subiendo imagen base64 para publicación: ${pub.id_publicacion}`);
          try {
            const imagenUrl = await this.firebaseStorageService.uploadCompressedImage(
              pub.imagen,
              'publicaciones',
              1200, // maxWidth
              1200, // maxHeight
              0.8   // quality
            );
            pub.imagen = imagenUrl;
            console.log(`✅ Imagen subida exitosamente: ${imagenUrl}`);
          } catch (error) {
            console.error(`❌ Error subiendo imagen para publicación ${pub.id_publicacion}:`, error);
            // Si falla la subida de imagen, marcar como no sincronizada
            noSincronizadas.push(pub);
            continue;
          }
        }
        
        if (esPublicacionNueva) {
          console.log(`🆕 Sincronizando publicación nueva: ${pub.id_publicacion}`);
          const id = await this.firebaseService.addPublicacion(pub);
          pub.id_publicacion = id;
          await this.localStorage.addToList<Publicacion>('publicaciones', pub);
        } else {
          console.log(`✏️ Sincronizando publicación editada: ${pub.id_publicacion}`);
          await this.firebaseService.updatePublicacion(pub);
          
          // Actualizar en publicaciones locales si existe
          const publicacionesLocales = await this.localStorage.getList<Publicacion>('publicaciones') || [];
          const actualizadas = publicacionesLocales.map(p =>
            p.id_publicacion === pub.id_publicacion ? { ...pub } : p
          );
          await this.localStorage.setItem('publicaciones', actualizadas);
        }
        
        sincronizadas.push(pub);
        console.log(`✅ Publicación sincronizada exitosamente: ${pub.id_publicacion}`);
      } catch (error) {
        console.error(`❌ Error sincronizando publicación ${pub.id_publicacion}:`, error);
        noSincronizadas.push(pub);
      }
    }
    
    console.log(`📊 Sincronización de publicaciones completada: ${sincronizadas.length} sincronizadas, ${noSincronizadas.length} pendientes`);
    
    // Solo elimina las que sí se sincronizaron
    await this.localStorage.setItem('publicaciones_personal', noSincronizadas);
  }

  // Método para determinar si un ID fue generado localmente
  private esIdGeneradoLocalmente(id: string): boolean {
    // Los IDs generados localmente son timestamps (solo números)
    // Los IDs de Firebase contienen letras y caracteres especiales
    return /^\d+$/.test(id);
  }



  getPublicacionesDeSeguidos(publicaciones: Publicacion[], seguimientos: Seguir[], idUsuario: string): Publicacion[] {
    const idsSeguidos = seguimientos
      .filter(s => s.id_usuario_seguidor === idUsuario && s.estado_seguimiento)
      .map(s => s.id_usuario_seguido);
    return publicaciones
      .filter(pub => idsSeguidos.includes(pub.id_usuario))
      .sort((a, b) => new Date(b.fecha_publicacion).getTime() - new Date(a.fecha_publicacion).getTime());
  }

  getPublicacionesFiltradas(
    publicaciones: Publicacion[],
    seguimientos: Seguir[],
    usuarioActualId: string,
    filtro: 'publico' | 'seguidos'
  ): Publicacion[] {
    if (filtro === 'publico') {
      return publicaciones;
    } else {
      return this.getPublicacionesDeSeguidos(publicaciones, seguimientos, usuarioActualId);
    }
  }

  // Método de diagnóstico para verificar publicaciones offline
  async diagnosticarPublicacionesOffline(): Promise<{
    publicacionesPersonales: number,
    publicacionesLocales: number,
    publicacionesNuevas: number,
    publicacionesEditadas: number,
    isOnline: boolean
  }> {
    const publicacionesPersonales = await this.getPublicacionesPersonal();
    const publicacionesLocales = await this.localStorage.getList<Publicacion>('publicaciones') || [];
    const isOnline = await this.utilsService.checkInternetConnection();

    let publicacionesNuevas = 0;
    let publicacionesEditadas = 0;

    for (const pub of publicacionesPersonales) {
      if (this.esIdGeneradoLocalmente(pub.id_publicacion)) {
        publicacionesNuevas++;
      } else {
        publicacionesEditadas++;
      }
    }

    const diagnostico = {
      publicacionesPersonales: publicacionesPersonales.length,
      publicacionesLocales: publicacionesLocales.length,
      publicacionesNuevas,
      publicacionesEditadas,
      isOnline
    };

    console.log('🔍 Diagnóstico de publicaciones offline:', diagnostico);
    return diagnostico;
  }

  // Método para verificar si hay publicaciones con imágenes pendientes de subir
  async getPublicacionesConImagenesPendientes(): Promise<Publicacion[]> {
    const publicacionesPersonales = await this.getPublicacionesPersonal();
    return publicacionesPersonales.filter(pub => 
      pub.imagen && pub.imagen.startsWith('data:image/')
    );
  }

  // Método para obtener estadísticas de sincronización
  async getEstadisticasSincronizacion(): Promise<{
    totalOffline: number,
    conImagenes: number,
    sinImagenes: number
  }> {
    const publicacionesPersonales = await this.getPublicacionesPersonal();
    const conImagenes = publicacionesPersonales.filter(pub => 
      pub.imagen && pub.imagen.startsWith('data:image/')
    );
    
    return {
      totalOffline: publicacionesPersonales.length,
      conImagenes: conImagenes.length,
      sinImagenes: publicacionesPersonales.length - conImagenes.length
    };
  }
}