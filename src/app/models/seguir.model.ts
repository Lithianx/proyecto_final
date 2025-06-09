export interface Seguir {
    id_usuario_seguidor: number; // ID del usuario que sigue
    id_usuario_seguido: number; // ID del usuario seguido
    estado_seguimiento: boolean; // Estado del seguimiento (activo/inactivo)
}