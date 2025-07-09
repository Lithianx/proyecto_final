import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cacheKeys: Set<string> = new Set();

  constructor() {
    // 🔄 En desarrollo, detectar cambios de hot reload
    if (!this.isProduction()) {
      this.setupDevCacheInvalidation();
    }
  }

  /**
   * Invalidar todo el caché de la aplicación
   */
  invalidateAllCache(): void {
    // Limpiar localStorage específico de eventos
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('evento') || key.includes('cache'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Limpiar registros internos
    this.cacheKeys.clear();
    
    console.log('🔄 Cache completo invalidado');
  }

  /**
   * Invalidar caché específico por clave
   */
  invalidateCache(key: string): void {
    localStorage.removeItem(key);
    this.cacheKeys.delete(key);
    console.log(`🔄 Cache invalidado para: ${key}`);
  }

  /**
   * Marcar una clave como cacheada
   */
  markAsCached(key: string): void {
    this.cacheKeys.add(key);
  }

  /**
   * Verificar si estamos en producción
   */
  private isProduction(): boolean {
    return document.location.hostname !== 'localhost' && 
           document.location.hostname !== '127.0.0.1' &&
           !document.location.hostname.includes('192.168');
  }

  /**
   * Configurar invalidación automática en desarrollo
   */
  private setupDevCacheInvalidation(): void {
    // Invalidar caché cada vez que se recarga la página en desarrollo
    window.addEventListener('beforeunload', () => {
      console.log('🔄 Detectado recarga de página - invalidando cache');
      this.invalidateAllCache();
    });

    // Invalidar caché periódicamente en desarrollo (cada 30 segundos)
    setInterval(() => {
      console.log('🔄 Invalidación periódica de cache (desarrollo)');
      this.invalidateAllCache();
    }, 30000);

    console.log('🔧 Modo desarrollo: invalidación automática de cache activada');
  }

  /**
   * Forzar recarga de datos en toda la aplicación
   */
  forceReload(): void {
    this.invalidateAllCache();
    // Emitir evento global para que los componentes se refresquen
    window.dispatchEvent(new CustomEvent('cache-invalidated'));
  }
}
