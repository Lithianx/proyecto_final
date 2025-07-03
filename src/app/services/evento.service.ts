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
  deleteDoc,
  QuerySnapshot
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Evento } from '../models/evento.model';
import { EstadoEvento } from '../models/estado-evento.model';
import { Juego } from '../models/juego.model';
import { TipoJuego } from '../models/tipo-juego.model';
import { Participante } from '../models/participante.model';
import { Auth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class EventoService {
  private eventosRef: CollectionReference<DocumentData>;

  constructor(private firestore: Firestore, private auth: Auth) {
    this.eventosRef = collection(this.firestore, 'Evento');
  }

  // Crear un nuevo evento
  crearEvento(evento: Evento): Promise<any> {
    return addDoc(this.eventosRef, evento);
  }

  // Obtener todos los eventos en tiempo real
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

  // Disminuir cupos
  async tomarEvento(idEvento: string): Promise<void> {
    const eventoDoc = doc(this.firestore, `Evento/${idEvento}`);
    const eventoSnap = await getDoc(eventoDoc);

    if (!eventoSnap.exists()) throw new Error('Evento no encontrado');

    const data = eventoSnap.data();
    const cupos = data['cupos'] || 0;

    if (cupos <= 0) throw new Error('No hay cupos disponibles');

    await updateDoc(eventoDoc, { cupos: cupos - 1 });
  }

  // Obtener evento por ID
  async obtenerEventoPorId(id: string): Promise<Evento & { id: string }> {
    const eventoDoc = doc(this.firestore, `Evento/${id}`);
    const eventoSnap = await getDoc(eventoDoc);

    if (!eventoSnap.exists()) throw new Error('Evento no encontrado');

    const data = eventoSnap.data();
    return {
      id,
      ...data,
      fechaInicio: data['fechaInicio']?.toDate?.() ?? new Date()
    } as Evento & { id: string };
  }

  // Obtener eventos creados por un usuario
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


  // Obtener nombre de usuario por su UID (id_creador)
  async obtenerNombreUsuarioPorId(idUsuario: string): Promise<string> {
    try {
      const usuarioRef = doc(this.firestore, 'Usuario', idUsuario);
      const docSnap = await getDoc(usuarioRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return data['nombre_usuario'] || 'sin nombre';

      }
    } catch (error) {
      console.warn(`Error al obtener nombre del usuario con ID ${idUsuario}`, error);
      console.log('📥 Buscando nombre de usuario para:', idUsuario);
    }
    return 'desconocido';
  }

  // Registrar participación en un evento
  async registrarParticipante(participante: Participante): Promise<void> {
    const participanteRef = collection(this.firestore, 'Participante');
    await addDoc(participanteRef, participante);
    console.log('Registrando participante:', participante);
  }

  // Obtener participantes de un evento
  async obtenerParticipantesEvento(idEvento: string): Promise<Participante[]> {
    const ref = collection(this.firestore, 'Participante');
    const q = query(ref, where('id_evento', '==', idEvento));
    const querySnapshot = await getDocs(q);
    const participantes: Participante[] = [];

    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data() as Participante;

      // 🔍 Buscar nombre del usuario desde colección Usuario
      let nombreUsuario = data.nombre_usuario; // Si ya viene, lo usamos
      if (!nombreUsuario) {
        try {
          const usuarioRef = doc(this.firestore, 'Usuario', data.id_usuario);
          const usuarioSnap = await getDoc(usuarioRef);
          if (usuarioSnap.exists()) {
            nombreUsuario = usuarioSnap.data()['nombre_usuario'] ?? 'Anónimo';
          }
        } catch (err) {
          console.warn('No se pudo cargar nombre de usuario para participante:', data.id_usuario);
          nombreUsuario = 'Desconocido';
        }
      }

      participantes.push({
        ...data,
        id_participacion: docSnap.id,
        nombre_usuario: nombreUsuario,
      });
    }

    return participantes;
  }




  async eliminarParticipante(idEvento: string, idUsuario: string): Promise<void> {
    const participantesRef = collection(this.firestore, 'Participante');
    const q = query(participantesRef,
      where('id_evento', '==', idEvento),
      where('id_usuario', '==', idUsuario));

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (docSnap) => {
      const docRef = doc(this.firestore, 'Participante', docSnap.id);
      await deleteDoc(docRef);
    });
  }

  // Obtener juegos
  getJuegos(): Observable<Juego[]> {
    const juegosRef = collection(this.firestore, 'Juego');
    return collectionData(juegosRef, { idField: 'id_juego' }) as Observable<Juego[]>;
  }

  // Obtener tipos de juego
  getTiposJuego(): Observable<TipoJuego[]> {
    const tiposRef = collection(this.firestore, 'TipoJuego');
    return collectionData(tiposRef, { idField: 'id_tipo_juego' }) as Observable<TipoJuego[]>;
  }

  // Obtener estados de evento
  getEstadosEvento(): Observable<EstadoEvento[]> {
    const estadosRef = collection(this.firestore, 'EstadoEvento');
    return collectionData(estadosRef, { idField: 'id_estado_evento' }) as Observable<EstadoEvento[]>;
  }

  // Obtener nombre del usuario conectado (opcional)
  async obtenerNombreUsuarioActual(): Promise<string> {
    const user = await this.auth.currentUser;
    return user?.displayName ?? user?.email ?? 'Anónimo';
  }

  // Actualizar estado del evento según cupos disponibles
  async actualizarEstadoEvento(idEvento: string): Promise<void> {
    const eventoDoc = doc(this.firestore, `Evento/${idEvento}`);
    const eventoSnap = await getDoc(eventoDoc);
    if (!eventoSnap.exists()) return;

    const evento = eventoSnap.data() as any;

    // Obtener todos los estados
    const estadosRef = collection(this.firestore, 'EstadoEvento');
    const estadosSnapshot = await getDocs(estadosRef);
    const estados = estadosSnapshot.docs.map(d => ({ id: d.id, ...(d.data() as { descripcion: string }) }));

    const finalizadoID = estados.find(e => e.descripcion === 'FINALIZADO')?.id;
    const enCursoID = estados.find(e => e.descripcion === 'EN CURSO')?.id;
    const sinCuposID = estados.find(e => e.descripcion === 'SIN CUPOS')?.id;
    const disponibleID = estados.find(e => e.descripcion === 'DISPONIBLE')?.id;

    // Si ya está en estado final, no cambiar
    if ([finalizadoID, enCursoID].includes(evento.id_estado_evento)) return;

    const nuevoEstadoID = evento.cupos <= 0 ? sinCuposID : disponibleID;

    if (nuevoEstadoID && nuevoEstadoID !== evento.id_estado_evento) {
      await updateDoc(eventoDoc, { id_estado_evento: nuevoEstadoID });
      console.log(`🔁 Estado actualizado a ID: ${nuevoEstadoID}`);
    }
  }



  // Obtener los eventos donde el usuario es participante (no necesariamente creador)
  async obtenerParticipantesEventoPorUsuario(id_usuario: string): Promise<Participante[]> {
    const participantesRef = collection(this.firestore, 'Participante');
    const q = query(participantesRef, where('id_usuario', '==', id_usuario));

    const querySnapshot = await getDocs(q);
    const participantes: Participante[] = [];

    querySnapshot.forEach(docSnap => {
      participantes.push({
        id_participacion: docSnap.id,
        ...docSnap.data()
      } as Participante);
    });

    return participantes;
  }




  async obtenerIdEstadoPorDescripcion(descripcion: string): Promise<string | null> {
    const estadosRef = collection(this.firestore, 'EstadoEvento');
    const q = query(estadosRef, where('descripcion', '==', descripcion));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].id; // ← este es el ID real
    }

    return null;
  }
}
