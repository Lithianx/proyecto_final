export interface Conversacion {
    id_conversacion: number;
    id_emisor: number;
    id_receptor: number;
    contenido_conversacion: string;
    fecha_envio: Date;
    estado_visto: boolean;
    //id_usuario: number;
}