import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageEventoService {

  constructor() {}

  // Guardar datos del evento actual
  async guardarDatosEvento(evento: {
    id: string;
    nombre_evento: string;
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

  // Obtener valores individuales
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

  // Eliminar todo (por ejemplo, al salir del evento)
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



async getItem<T>(clave: string): Promise<T | null> {
  const dato = localStorage.getItem(clave);
  if (!dato) return null;
  // Si es JSON válido (objeto o array), parsea, si no, retorna como string
  if ((dato.startsWith('{') && dato.endsWith('}')) || (dato.startsWith('[') && dato.endsWith(']'))) {
    return JSON.parse(dato);
  }
  return dato as unknown as T;
}
}
