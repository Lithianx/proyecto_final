export interface Publicacion {
    id_publicacion: number;
    id_usuario: number;
    contenido: string;
    imagen?: string;
    fecha_publicacion: Date;
}