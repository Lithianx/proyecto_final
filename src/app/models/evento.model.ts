export interface Evento {
  id?: string; 
  id_creador:string;
  tipo_evento: string;
  nombre_evento: string;
  lugar: string;
  descripcion: string;
  fechaInicio: Date;
  cupos: number;
  creado_por: string;
  jugadores?: string[];
  estado: 'DISPONIBLE' | 'EN CURSO' | 'FINALIZADO' | 'SIN CUPOS';
}