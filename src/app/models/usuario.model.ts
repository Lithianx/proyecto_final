export interface Usuario {
    id_usuario: string;
    nombre_usuario: string;
    correo_electronico: string;
    fecha_registro: Date;
    contrasena: string;
    avatar?: string; 
    estado_cuenta: boolean;
    estado_online: boolean;
    sub_name: string;
    descripcion:string;
    rol: string; // 'admin' o 'usuario'
    fotoPerfil?: string;
}