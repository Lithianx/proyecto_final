import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, CollectionReference, DocumentData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Evento } from 'src/app/models/evento.model';

@Injectable({
  providedIn: 'root',
})
export class EventoService {
  private eventosRef: CollectionReference<Evento>;

  constructor(private firestore: Firestore) {
    // Se tipa directamente como CollectionReference<Evento>
    this.eventosRef = collection(this.firestore, 'eventos') as CollectionReference<Evento>;
  }

  crearEvento(evento: Evento): Promise<any> {
    return addDoc(this.eventosRef, evento);
  }
  obtenerEventos(): Observable<(Evento & { id: string })[]> {
    return collectionData(this.eventosRef, { idField: 'id' }).pipe(
      // Cast each item to Evento & { id: string }
      map(eventos => eventos as (Evento & { id: string })[])
    );
  }
}
