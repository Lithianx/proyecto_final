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
  query,
  where,
  getDocs,
  QuerySnapshot
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Evento } from '../models/evento.model';
import { Auth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class EventoService {
  private eventosRef: CollectionReference<DocumentData>;

  constructor(private firestore: Firestore, private auth: Auth) {
    this.eventosRef = collection(this.firestore, 'eventos');
  }

  // ✅ Crear un nuevo evento
  crearEvento(evento: Evento): Promise<any> {
    return addDoc(this.eventosRef, evento);
  }

  // ✅ Obtener todos los eventos en tiempo real
  obtenerEventos(): Observable<(Evento & { id: string })[]> {
    return collectionData(this.eventosRef, { idField: 'id' }).pipe(
      map((eventos) =>
        eventos.map((evento: any) => ({
          ...evento,
          fechaInicio: evento.fechaInicio?.toDate?.() ?? new Date()
        })) as (Evento & { id: string })[]
      )
    );
  }

  // ✅ Disminuir cupos en Firestore
  async tomarEvento(idEvento: string): Promise<void> {
    const eventoDoc = doc(this.firestore, `eventos/${idEvento}`);
    const eventoSnap = await getDoc(eventoDoc);

    if (!eventoSnap.exists()) {
      throw new Error('Evento no encontrado');
    }

    const data = eventoSnap.data();
    const cupos = data['cupos'] || 0;

    if (cupos <= 0) {
      throw new Error('No hay cupos disponibles');
    }

    await updateDoc(eventoDoc, { cupos: cupos - 1 });
  }

  // ✅ Obtener evento por ID
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
      fechaInicio: data['fechaInicio']?.toDate?.() ?? new Date()
    } as Evento & { id: string };
  }

  // ✅ Obtener nombre del usuario conectado (opcional)
  async obtenerNombreUsuarioActual(): Promise<string> {
    const user = await this.auth.currentUser;
    return user?.displayName ?? user?.email ?? 'Anónimo';
  }

  // ⚠️ ACTUALIZACIÓN DEL ESTADO (ya no depende de fechas automáticas)
  async actualizarEstadoEvento(idEvento: string): Promise<void> {
    const eventoDoc = doc(this.firestore, `eventos/${idEvento}`);
    const eventoSnap = await getDoc(eventoDoc);

    if (!eventoSnap.exists()) return;

    const evento = eventoSnap.data() as any;

    // Si ya está finalizado o en curso, no actualizar automáticamente
    if (['EN CURSO', 'FINALIZADO'].includes(evento.estado)) return;

    let nuevoEstado = evento.estado;

    // Solo actualizar si no hay cupos
    if (evento.cupos <= 0) {
      nuevoEstado = 'SIN CUPOS';
    } else {
      nuevoEstado = 'DISPONIBLE';
    }

    if (nuevoEstado !== evento.estado) {
      await updateDoc(eventoDoc, { estado: nuevoEstado });
      console.log(`🔁 Estado actualizado a: ${nuevoEstado}`);
    }
  }

  // ✅ Obtener eventos creados por un usuario
  async obtenerEventosPorCreador(idUsuario: string): Promise<(Evento & { id: string })[]> {
    const q = query(this.eventosRef, where('id_creador', '==', idUsuario));
    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);

    const eventos: (Evento & { id: string })[] = [];
    querySnapshot.forEach(docSnap => {
      eventos.push({
        id: docSnap.id,
        ...docSnap.data(),
        fechaInicio: docSnap.data()['fechaInicio']?.toDate?.() ?? new Date()
      } as Evento & { id: string });
    });

    return eventos;
  }
}
