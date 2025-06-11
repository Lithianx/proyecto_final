export interface Usuario {
    id_usuario: string;
    nombre_usuario: string;
    correo_electronico: string;
    fecha_registro: Date;
    contrasena: string;
    avatar?: string; // Optional field
    estado_cuenta: boolean;
    estado_online: boolean;
}