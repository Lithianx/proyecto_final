export interface ConversacionUsuario {
    id_conversacion: number;
    id_usuario: number;
    ultimo_mensaje?: string;
    fecha_ultimo_mensaje?: Date;
    leido?: boolean; // Indica si el último mensaje fue leído
}