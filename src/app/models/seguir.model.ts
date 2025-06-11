export interface Seguir {
    id_usuario_seguidor: string; // ID del usuario que sigue
    id_usuario_seguido: string; // ID del usuario seguido
    estado_seguimiento: boolean; // Estado del seguimiento (activo/inactivo)
}