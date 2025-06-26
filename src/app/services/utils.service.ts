import { Injectable } from '@angular/core';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { Publicacion } from '../models/publicacion.model';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';
import { Network } from '@capacitor/network';

@Injectable({ providedIn: 'root' })
export class UtilsService {

  constructor(private http: HttpClient) {}

async compartirPublicacion(publicacion: Publicacion) {
  const urlCustom = `https://app-eventos-7f5a8.web.app/comentario/${publicacion.id_publicacion}`;
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