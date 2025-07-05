export interface Reporte {
    id_reporte: string;
    id_usuario: string;
    id_tipo_reporte: string;
    id_publicacion?: string;
    descripcion_reporte: string;
    fecha_reporte: Date;
}