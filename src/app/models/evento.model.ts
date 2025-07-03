export interface Evento {
  id_evento?: string;             
  id_creador: string;             
  nombre_evento: string;
  lugar: string;
  descripcion: string;
  fechaInicio: Date;
  cupos: number;
  id_juego: string;                
  id_estado_evento: string;      
  timestampInicioEvento?: Date; 
             
}
