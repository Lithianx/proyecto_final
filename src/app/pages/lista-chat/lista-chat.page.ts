import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

import { Usuario } from 'src/app/models/usuario.model';
import { Mensaje } from 'src/app/models/mensaje.model';
import { Conversacion } from 'src/app/models/conversacion.model';

import { LocalStorageService } from 'src/app/services/local-storage-social.service';
import { ComunicacionService } from 'src/app/services/comunicacion.service';


@Component({
  selector: 'app-lista-chat',
  templateUrl: './lista-chat.page.html',
  styleUrls: ['./lista-chat.page.scss'],
  standalone: false,
})
export class ListaChatPage implements OnInit {

  // Simulación del usuario actual (en producción esto viene de un servicio de autenticación)
  usuarioActual: Usuario = {
    id_usuario: '999', // string
    nombre_usuario: 'Usuario no Demo',
    correo_electronico: 'demo@correo.com',
    fecha_registro: new Date(),
    contrasena: '',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
    estado_cuenta: true,
    estado_online: true
  };

  usuarios: Usuario[] = [
    {
      id_usuario: '900', // string
      nombre_usuario: 'Bot',
      correo_electronico: 'bot@correo.com',
      fecha_registro: new Date(),
      contrasena: '',
      avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
      estado_cuenta: true,
      estado_online: true
    }
  ];

  conversaciones: Conversacion[] = [];
  mensajes: Mensaje[] = [];

  constructor(
    private navCtrl: NavController,
    private localStorage: LocalStorageService,
    private comunicacionService: ComunicacionService,
  ) { }

  async ngOnInit() {
    // Cargar usuario actual desde Ionic Storage
    const usuarioGuardado = await this.localStorage.getItem<Usuario>('usuarioActual');
    if (usuarioGuardado) {
      this.usuarioActual = usuarioGuardado;
    }

    // Suscribirse a los mensajes y conversaciones del service
    this.comunicacionService.mensajes$.subscribe(mensajes => {
      this.mensajes = mensajes;
    });
    this.comunicacionService.conversaciones$.subscribe(convs => {
      this.conversaciones = convs;
    });

    // Si necesitas cargar datos iniciales, puedes hacerlo desde el service
    await this.comunicacionService.cargarMensajes();
    await this.comunicacionService.cargarConversaciones();
  }

  doRefresh(event: any) {
    setTimeout(async () => {
      // Simula agregar una nueva conversación y mensaje
      const nuevaConversacion: Conversacion = {
        id_conversacion: (this.conversaciones.length + 1).toString(), // string
        fecha_envio: new Date(),
        id_usuario_emisor: '900', // string
        id_usuario_receptor: this.usuarioActual.id_usuario,
      };
      await this.comunicacionService.agregarConversacion(nuevaConversacion);

      const nuevoMensaje: Mensaje = {
        id_mensaje: (this.mensajes.length + 1).toString(), // string
        id_conversacion: nuevaConversacion.id_conversacion,
        id_usuario_emisor: '900', // string
        contenido: '¡Hola! ganaste un Iphone 15 😁👇 haz click aqui',
        fecha_envio: new Date(),
        estado_visto: false
      };
      await this.comunicacionService.enviarMensaje(nuevoMensaje);

      event.target.complete();
    }, 1500);
  }

  // Filtrado de la lista de conversaciones por el nombre del participante
  handleInput(event: any): void {
    const query = event.target.value?.toLowerCase() || '';
    this.conversaciones = this.comunicacionService.filtrarConversacionesPorNombre(
      this.comunicacionService.getConversaciones(),
      this.usuarios,
      query
    );
  }

  getUsuario(id_usuario: string) { // string
    return this.usuarios.find(u => u.id_usuario === id_usuario);
  }

  getUltimoMensaje(id_conversacion: string): Mensaje | undefined { // string
    return this.comunicacionService.getUltimoMensajeDeConversacion(id_conversacion);
  }

  async marcarUltimoMensajeComoVisto(id_conversacion: string): Promise<void> { // string
    const ultimoMensaje = this.getUltimoMensaje(id_conversacion);
    if (
      ultimoMensaje &&
      !ultimoMensaje.estado_visto &&
      ultimoMensaje.id_usuario_emisor !== this.usuarioActual.id_usuario
    ) {
      await this.comunicacionService.marcarMensajesComoVistos(id_conversacion, this.usuarioActual.id_usuario);
    }
  }

  volver() {
    this.navCtrl.back();
  }
}