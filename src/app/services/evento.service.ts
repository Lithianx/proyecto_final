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
import { Auth } from '@angular/fire/auth';
import { query, where, getDocs, QuerySnapshot } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class EventoService {
  private eventosRef: CollectionReference<DocumentData>;

  constructor(private firestore: Firestore, private auth: Auth) {
    this.eventosRef = collection(this.firestore, 'eventos');
  }

  // Crear un nuevo evento en Firestore
  crearEvento(evento: Evento): Promise<any> {
    return addDoc(this.eventosRef, evento);
  }

  // Obtener todos los eventos con sus fechas convertidas a objetos Date
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

  // Disminuir en uno el cupo disponible de un evento
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

  // Obtener un evento por su ID con fechas convertidas a Date
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

  // Obtener nombre del usuario autenticado actual
  async obtenerNombreUsuarioActual(): Promise<string> {
    const user = await this.auth.currentUser;
    return user?.displayName ?? user?.email ?? 'Anónimo';
  }

  async obtenerEventosPorCreador(idUsuario: string): Promise<(Evento & { id: string })[]> {
    const q = query(this.eventosRef, where('id_creador', '==', idUsuario));
    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);

    const eventos: (Evento & { id: string })[] = [];
    querySnapshot.forEach(docSnap => {
      eventos.push({
        id: docSnap.id,
        ...docSnap.data()
      } as Evento & { id: string });
    });

    return eventos;
  }
}
