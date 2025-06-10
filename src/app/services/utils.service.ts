import { Injectable } from '@angular/core';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { Publicacion } from '../models/publicacion.model';

@Injectable({ providedIn: 'root' })
export class UtilsService {

  constructor() {}

  async compartirPublicacion(publicacion: Publicacion) {
    const urlConMetadatos = `http://localhost:8100/comentario/${publicacion.id_publicacion}`;
    const mensaje = `${publicacion.contenido}\n\n¡Tienes que ver esto!\n`;

    if (Capacitor.getPlatform() !== 'web') {
      await Share.share({
        title: 'Descubre esto',
        text: mensaje,
        url: urlConMetadatos,
        dialogTitle: 'Compartir publicación',
      });
    } else {
      const mensajeCodificado = encodeURIComponent(mensaje) + encodeURIComponent(urlConMetadatos);
      const url = `https://wa.me/?text=${mensajeCodificado}`;
      window.open(url, '_blank');
    }
  }
}