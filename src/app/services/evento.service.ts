import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  CollectionReference,
  DocumentData,
  doc,
  getDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Evento } from '../models/evento.model';
import { Auth } from '@angular/fire/auth'; // Necesario para obtener usuario actual

@Injectable({
  providedIn: 'root',
})
export class EventoService {
  private eventosRef: CollectionReference<DocumentData>;

  constructor(private firestore: Firestore, private auth: Auth) {
    this.eventosRef = collection(this.firestore, 'eventos');
  }

  crearEvento(evento: Evento): Promise<any> {
    return addDoc(this.eventosRef, evento);
  }
  //vista eventos
  obtenerEventos(): Observable<(Evento & { id: string })[]> {
    return collectionData(this.eventosRef, { idField: 'id' }).pipe(
      map((eventos) =>
        eventos.map((evento: any) => ({
          ...evento,
          fechaInicio: evento.fechaInicio?.toDate?.() ?? new Date(),
          fechaFin: evento.fechaFin?.toDate?.() ?? new Date(),
        })) as (Evento & { id: string })[]
      )
    );
  }

  async tomarEvento(idEvento: string): Promise<void> {
    const eventoDoc = doc(this.firestore, `eventos/${idEvento}`);
    const eventoSnap = await getDoc(eventoDoc);

    if (!eventoSnap.exists()) {
      throw new Error('Evento no encontrado');
    }

    const data = eventoSnap.data();
    const cupos = data["cupos"] || 0;

    if (cupos <= 0) {
      throw new Error('No hay cupos disponibles');
    }

    await updateDoc(eventoDoc, { cupos: cupos - 1 });
  }

  async obtenerEventoPorId(id: string): Promise<Evento & { id: string }> {
    const eventoDoc = doc(this.firestore, `eventos/${id}`);
    const eventoSnap = await getDoc(eventoDoc);

    if (!eventoSnap.exists()) {
      throw new Error('Evento no encontrado');
    }

    const data = eventoSnap.data();
    return {
      id,
      ...data,
      fechaInicio: data["fechaInicio"]?.toDate?.() ?? new Date(),
      fechaFin: data["fechaFin"]?.toDate?.() ?? new Date(),
    } as Evento & { id: string };
  }

  async obtenerNombreUsuarioActual(): Promise<string> {
    const user = await this.auth.currentUser;
    // Si más adelante se decide, este método puede migrarse a UsuarioService
    return user?.displayName ?? user?.email ?? 'Anónimo';
  }

  
}
