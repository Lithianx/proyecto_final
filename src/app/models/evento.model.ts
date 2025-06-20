export interface Evento {
  id?: string; // ID generado por Firestore, opcional al crear
  tipo_evento: string;
  nombre_evento: string;
  lugar: string;
  descripcion: string;
  fechaInicio: Date;
  fechaFin: Date;
  cupos: number;
  creado_por: string;
  jugadores?: string[];
}