export interface Comentario {
    id_comentario: number;
    id_publicacion: number;
    id_usuario: number;
    contenido_comentario: string;
    fecha_comentario: Date;
}