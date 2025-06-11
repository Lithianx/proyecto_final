export interface Publicacion {
    id_publicacion: string;
    id_usuario: string;
    contenido: string;
    imagen?: string;
    fecha_publicacion: Date;
}