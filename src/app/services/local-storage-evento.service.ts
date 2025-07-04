import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageEventoService {

  constructor() {}

  /**
   * Guarda los datos del evento actual en el LocalStorage
   * @param evento Objeto con los datos del evento
   */
  async guardarDatosEvento(evento: {
    id: string;
    nombre_evento: string; // ahora corresponde al juego seleccionado
    id_creador: string;
    jugadores?: string[];
    es_anfitrion?: boolean;
  }): Promise<void> {
    try {
      await localStorage.setItem('id_evento', evento.id);
      await localStorage.setItem('nombre_evento', evento.nombre_evento);
      await localStorage.setItem('id_creador', evento.id_creador);
      await localStorage.setItem('es_anfitrion', evento.es_anfitrion ? 'true' : 'false');

      if (evento.jugadores) {
        await localStorage.setItem('jugadores_evento', JSON.stringify(evento.jugadores));
      }
    } catch (error) {
      console.error('❌ Error guardando datos de evento en LocalStorage:', error);
    }
  }

  // --- Obtener valores individuales ---
  async getIdEvento(): Promise<string | null> {
    return localStorage.getItem('id_evento');
  }

  async getNombreEvento(): Promise<string | null> {
    return localStorage.getItem('nombre_evento');
  }

  async getIdCreador(): Promise<string | null> {
    return localStorage.getItem('id_creador');
  }

  async getJugadores(): Promise<string[]> {
    const data = await localStorage.getItem('jugadores_evento');
    return data ? JSON.parse(data) : [];
  }

  async esAnfitrion(): Promise<boolean> {
    return (await localStorage.getItem('es_anfitrion')) === 'true';
  }

  // --- Limpiar datos almacenados ---
  async limpiarDatosEvento(): Promise<void> {
    try {
      await localStorage.removeItem('id_evento');
      await localStorage.removeItem('nombre_evento');
      await localStorage.removeItem('id_creador');
      await localStorage.removeItem('jugadores_evento');
      await localStorage.removeItem('es_anfitrion');
    } catch (error) {
      console.error('❌ Error al limpiar LocalStorage de evento:', error);
    }
  }

  // --- Acceso genérico por clave ---
  async getItem<T>(clave: string): Promise<T | null> {
    const dato = localStorage.getItem(clave);
    return dato ? JSON.parse(dato) : null;
  }



    // ✅ Marcar que el usuario ya participó en este evento
  async marcarYaEstuvo(eventoId: string): Promise<void> {
    await localStorage.setItem(`ya_estuvo_en_evento_${eventoId}`, 'true');
  }

  // ✅ Verificar si ya estuvo antes en este evento
  async yaEstuvoEnEvento(eventoId: string): Promise<boolean> {
    return localStorage.getItem(`ya_estuvo_en_evento_${eventoId}`) === 'true';
  }

}
