export interface Mensaje {
    id_mensaje: string;
    id_conversacion: string;
    id_usuario_emisor: string;
    contenido: string; // Puede ser texto, imagen, etc.
    fecha_envio?: Date;
    estado_visto?: boolean; // Indica si el último mensaje fue leído
}