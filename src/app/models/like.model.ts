export interface Like {
    id_publicacion?: number;
    id_usuario: number;
    id_comentario?: number;
    fecha_like: Date;
    estado_like: boolean;
}