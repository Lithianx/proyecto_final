Proyecto Final - Plataforma de Eventos Sociales Gamer 

Este es el repositorio oficial del **proyecto final** desarrollado en Ionic + Angular + Firebase.  
La aplicación está diseñada como una plataforma social gamer para estudiantes de **Duoc UC**, donde los usuarios pueden crear y participar en eventos en tiempo real, comunicarse y compartir contenido.

---

##  Funcionalidades Principales

###  Autenticación y Cuenta
- Registro de usuario con validación de cuenta (`crear-usuario`, `validar-cuenta`)
- Recuperación de contraseña (`olvido-contraseña`)
- Inicio de sesión (`login`)
- Gestión de perfil (`perfil`, `editar-perfil`, `perfil-user`)

###  Social
- Búsqueda de personas (`buscar-persona`)
- Sistema de seguidores / seguidos (`seguidores`, `seguidos`)
- Comentarios en publicaciones (`comentario`)
- Guardado de publicaciones (`publicaciones-guardadas`)
- Reporte de cuentas y publicaciones (`reportar`, `reportar-cuenta`)
- Chat privado entre usuarios (`chat-privado`, `lista-chat`)

###  Eventos en Tiempo Real
- Crear evento tradicional o tipo "flash" (`crear-evento-flash`)
- Unirse o dejar eventos como participante (`evento`, `event-insc-cread`)
- Detalle completo del evento (`detalle-evento`)
- Sala de evento en tiempo real con participantes y chat (`sala-evento`)
- Finalizar evento y ver historial (`evento-finalizado`, `historial-eventos`)
- Recibir notificaciones (`notificaciones`)

###  Publicaciones
- Crear y editar publicaciones (`crear-publicacion`, `editar-publicacion`)
- Ver publicaciones en el home (`home`)

###  Administración
- Gestión de reportes y cuentas desde el panel de administrador (`admin-reporte`)

---

## Tecnologías Utilizadas

- **Ionic Framework**
- **Angular 17+**
- **Firebase** (Firestore, Authentication, Cloud Messaging)
- **Capacitor** para compilación nativa

---


## Imagenes

<p align="center">
  <img src="https://github.com/user-attachments/assets/659b5a35-521f-40df-84f3-46b147d06699" width="200" alt="Perfil de usuario" />
  <img src="https://github.com/user-attachments/assets/2f524a5e-72ee-40a3-985b-bc2272a20b7f" width="200" alt="Lista de eventos" />
  <img src="https://github.com/user-attachments/assets/7b808058-b01e-4b30-a610-7b908f07114f" width="200" alt="Home Feed" />
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/4bd55bc0-7a0f-458b-bce1-b860f90decde" width="200" alt="Lista de chat" />
  <img src="https://github.com/user-attachments/assets/08abb2ea-7ff7-49f6-9e3a-0a0a0e98a3c8" width="200" alt="Detalles del evento" />
  <img src="https://github.com/user-attachments/assets/ab8c62f4-5a19-4079-9acf-67d948157128" width="200" alt="Lista de reportes" />
</p>


---


##  Instalación del Proyecto


```bash
# Clona el repositorio
git clone https://github.com/Lithianx/proyecto_final.git
cd proyecto_final

# Instala dependencias
npm install

# Sincroniza Capacitor
npx cap sync

# Abre en Android Studio para emular
npx cap open android

#Propiedad
Autores
Proyecto desarrollado por estudiantes de Duoc UC como entrega final de carrera.
Aplicación pensada para mejorar la interacción, participación y organización de eventos entre compañeros.
