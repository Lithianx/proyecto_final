import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage-social.service';
import { Reporte } from '../models/reporte.model';

@Injectable({ providedIn: 'root' })
export class ReporteService {
  constructor(private localStorage: LocalStorageService) { }

  async obtenerReportes(): Promise<Reporte[]> {
    return await this.localStorage.getList<Reporte>('reportes') || [];
  }

  async guardarReporte(reporte: Reporte) {
 //   if (navigator.onLine) {
      // await this.firebaseService.addReporte(reporte);
  
  //  } else {
      // Si no hay conexión, obtenemos los reportes del local storage 
      await this.localStorage.addToList<Reporte>('reportes', reporte);
  ///  }
  }

  async obtenerReportesAdmin(): Promise<Reporte[]> {
    // return await this.firebaseService.getReportes();
    return await this.localStorage.getList<Reporte>('reportes') || [];
  }

  // Sincroniza Reportes cuando haya internet
  async sincronizarReporte() {
    const reporte = await this.obtenerReportes();
    for (const rep of reporte) {
      // await this.firebaseService.addPublicacion(rep);
      await this.localStorage.addToList<Reporte>('reportes', rep);
    }
    await this.localStorage.setItem('reportes', []);
  }
}