export interface Mensaje {
    id_mensaje: number;
    id_conversacion: number;
    id_usuario_emisor: number;
    contenido: string; // Puede ser texto, imagen, etc.
    fecha_envio?: Date;
    estado_visto?: boolean; // Indica si el último mensaje fue leído
}