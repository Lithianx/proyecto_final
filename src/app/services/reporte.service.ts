import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage-social.service';
import { Reporte } from '../models/reporte.model';
import { TipoReporte } from '../models/tipo-reporte.model';
import { FirebaseService } from './firebase.service';

@Injectable({ providedIn: 'root' })
export class ReporteService {
  constructor(
    private localStorage: LocalStorageService,
    private firebaseService: FirebaseService
  ) { }

  async obtenerReportes(): Promise<Reporte[]> {
    if (navigator.onLine) {
      try {
        const reportes = await this.firebaseService.getReportes();
        await this.localStorage.setItem('reportes', reportes);
        return reportes;
      } catch (e) {
        // Si falla Firebase, intenta localStorage
        const reportes = await this.localStorage.getList<Reporte>('reportes');
        return reportes || [];
      }
    } else {
      const reportes = await this.localStorage.getList<Reporte>('reportes');
      return reportes || [];
    }
  }

async guardarReporte(reporte: Reporte): Promise<string | void> {
  if (navigator.onLine) {
    const id = await this.firebaseService.addReporte(reporte);
    await this.localStorage.addToList<Reporte>('reportes', { ...reporte, id_reporte: id });
    return id;
  } else {
    const id = Date.now().toString();
    await this.localStorage.addToList<Reporte>('reportes', { ...reporte, id_reporte: id });
    return id;
  }
}


  async getTiposReporte(): Promise<TipoReporte[]> {
    if (navigator.onLine) {
      try {
        const tipos = await this.firebaseService.getTiposReporte();
        await this.localStorage.setItem('tipos_reporte', tipos);
        return tipos;
      } catch (e) {
        // Si falla Firebase, intenta localStorage
        const tipos = await this.localStorage.getList<TipoReporte>('tipos_reporte');
        return tipos || [];
      }
    } else {
      const tipos = await this.localStorage.getList<TipoReporte>('tipos_reporte');
      return tipos || [];
    }
  }





  async obtenerReportesAdmin(): Promise<Reporte[]> {
    if (navigator.onLine) {
      try {
        const reportes = await this.firebaseService.getReportes();
        await this.localStorage.setItem('reportes', reportes);
        return reportes;
      } catch (e) {
        const reportes = await this.localStorage.getList<Reporte>('reportes');
        return reportes || [];
      }
    } else {
      const reportes = await this.localStorage.getList<Reporte>('reportes');
      return reportes || [];
    }
  }

  // Sincroniza Reportes cuando haya internet
  async sincronizarReporte() {
    if (!navigator.onLine) return;
    const reportesLocales = await this.localStorage.getList<Reporte>('reportes') || [];
    for (const rep of reportesLocales) {
      await this.firebaseService.addReporte(rep);
    }
    await this.localStorage.setItem('reportes', []);
  }
}