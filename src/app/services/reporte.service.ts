import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage-social.service';
import { Reporte } from '../models/reporte.model';
import { TipoReporte } from '../models/tipo-reporte.model';
import { FirebaseService } from './firebase.service';
import { Observable } from 'rxjs';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class ReporteService {
  // Observables en tiempo real para la UI
  reportes$: Observable<Reporte[]>;
  tiposReporte$: Observable<TipoReporte[]>;

  constructor(
    private localStorage: LocalStorageService,
    private firebaseService: FirebaseService,
    private firestore: Firestore
  ) {
    // Observables en tiempo real de Firestore
    const reportesRef = collection(this.firestore, 'Reporte');
    this.reportes$ = collectionData(reportesRef, { idField: 'id_reporte' }) as Observable<Reporte[]>;

    const tiposRef = collection(this.firestore, 'TipoReporte');
    this.tiposReporte$ = collectionData(tiposRef, { idField: 'id_tipo_reporte' }) as Observable<TipoReporte[]>;
  }

  // Métodos para sincronización/offline, no para la UI principal

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

  async eliminarReporte(id_reporte: string): Promise<void> {
    if (navigator.onLine) {
      await this.firebaseService.deleteReporte(id_reporte);
      // Opcional: elimina también del localStorage
      const reportes = await this.localStorage.getList<Reporte>('reportes') || [];
      const nuevosReportes = reportes.filter(r => r.id_reporte !== id_reporte);
      await this.localStorage.setItem('reportes', nuevosReportes);
    } else {
      // Solo elimina del localStorage si está offline
      const reportes = await this.localStorage.getList<Reporte>('reportes') || [];
      const nuevosReportes = reportes.filter(r => r.id_reporte !== id_reporte);
      await this.localStorage.setItem('reportes', nuevosReportes);
    }
  }

async eliminarReportesPorPublicacion(id_publicacion: string): Promise<void> {
  // Obtén todos los reportes actuales (puedes usar el observable o la promesa según tu flujo)
  const reportes = await this.obtenerReportes();
  const reportesAEliminar = reportes.filter(r => r.id_publicacion === id_publicacion);

  for (const reporte of reportesAEliminar) {
    await this.eliminarReporte(reporte.id_reporte);
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

  // Métodos tipo promesa solo para sincronización/offline, no para la UI principal
  async obtenerReportes(): Promise<Reporte[]> {
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

  async getTiposReporte(): Promise<TipoReporte[]> {
    if (navigator.onLine) {
      try {
        const tipos = await this.firebaseService.getTiposReporte();
        await this.localStorage.setItem('tipos_reporte', tipos);
        return tipos;
      } catch (e) {
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
}