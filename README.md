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
