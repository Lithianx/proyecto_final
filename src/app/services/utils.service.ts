import { Injectable } from '@angular/core';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { Publicacion } from '../models/publicacion.model';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of, Subject } from 'rxjs';
import { Network } from '@capacitor/network';

@Injectable({ providedIn: 'root' })
export class UtilsService {

  // Subject para emitir cambios de conectividad
  private networkStatusSubject = new Subject<boolean>();
  public networkStatus$ = this.networkStatusSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initNetworkMonitoring();
  }

  // Inicializar el monitoreo de red
  private async initNetworkMonitoring() {
    if (this.isMobile()) {
      // Para móvil, usar Capacitor Network
      Network.addListener('networkStatusChange', (status) => {
        console.log('📡 Cambio de estado de red (móvil):', status.connected);
        this.networkStatusSubject.next(status.connected);
      });
    } else {
      // Para web, usar eventos del navegador
      window.addEventListener('online', () => {
        console.log('📡 Conexión restaurada (web)');
        this.networkStatusSubject.next(true);
      });
      
      window.addEventListener('offline', () => {
        console.log('📡 Conexión perdida (web)');
        this.networkStatusSubject.next(false);
      });
    }
  }

async compartirPublicacion(publicacion: Publicacion) {
  const urlCustom = `https://proyecto-789ae.web.app/comentario/${publicacion.id_publicacion}`;
  let mensaje = '';
  if (publicacion.contenido && publicacion.contenido.trim() !== '') {
    mensaje = `${publicacion.contenido}\n\n¡Tienes que ver esto!\n${urlCustom}`;
  } else {
    mensaje = `¡Tienes que ver esto!\n${urlCustom}`;
  }

  if (Capacitor.getPlatform() !== 'web') {
    await Share.share({
      title: 'Descubre esto',
      text: mensaje,
      dialogTitle: 'Compartir publicación'
    });
  } else if (navigator.share) {
    await navigator.share({
      title: 'Descubre esto',
      text: mensaje
    });
  } else {
    const mensajeCodificado = encodeURIComponent(mensaje);
    const url = `https://wa.me/?text=${mensajeCodificado}`;
    window.open(url, '_blank');
  }
}



  // Método para verificar la conexión a internet (móvil/navegador)
  async checkInternetConnection(): Promise<boolean> {
    if (this.isMobile()) {
      const status = await Network.getStatus();
      return status.connected;
    } else {
      return navigator.onLine;
    }
  }

  isMobile(): boolean {
    return /android|iphone|ipad|ipod|windows phone/i.test(navigator.userAgent);
  }
}