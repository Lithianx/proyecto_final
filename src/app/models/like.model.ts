export interface Like {
    id_publicacion?: string;
    id_usuario: string;
    id_comentario?: string;
    fecha_like: Date;
    estado_like: boolean;
}