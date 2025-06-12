import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

import { Usuario } from 'src/app/models/usuario.model';
import { Mensaje } from 'src/app/models/mensaje.model';
import { Conversacion } from 'src/app/models/conversacion.model';

import { LocalStorageService } from 'src/app/services/local-storage-social.service';
import { ComunicacionService } from 'src/app/services/comunicacion.service';
import { UsuarioService } from 'src/app/services/usuario.service';


@Component({
  selector: 'app-lista-chat',
  templateUrl: './lista-chat.page.html',
  styleUrls: ['./lista-chat.page.scss'],
  standalone: false,
})
export class ListaChatPage implements OnInit {

  usuarioActual!: Usuario;
  usuarios: Usuario[] = [];
  conversaciones: Conversacion[] = [];
  conversacionesOriginal: Conversacion[] = [];
  mensajes: Mensaje[] = [];

  constructor(
    private navCtrl: NavController,
    private localStorage: LocalStorageService,
    private comunicacionService: ComunicacionService,
    private usuarioService: UsuarioService
  ) { }

  async ngOnInit() {
    // Cargar usuario actual
    const usuario = await this.usuarioService.getUsuarioActualConectado();
    if (usuario) {
      this.usuarioActual = usuario;
      await this.localStorage.setItem('usuarioActual', usuario);
    } else {
      // Si no hay usuario, podrías redirigir al login
      return;
    }

    // Carga usuarios reales desde el servicio
    await this.usuarioService.cargarUsuarios();
    this.usuarios = this.usuarioService.getUsuarios();


    // Suscribirse a los mensajes y conversaciones en tiempo real
    this.comunicacionService.mensajes$.subscribe(mensajes => {
      this.mensajes = mensajes;
    });
    this.comunicacionService.conversaciones$.subscribe(convs => {
      this.conversaciones = convs;
      this.conversacionesOriginal = convs; // Guarda la copia original
    });
  }

  doRefresh(event: any) {
    setTimeout(async () => {
      // Solo recarga usuarios (no observable)
      await this.usuarioService.cargarUsuarios();
      this.usuarios = this.usuarioService.getUsuarios();
      event.target.complete();
    }, 1500);
  }

  // Filtrado de la lista de conversaciones por el nombre del participante
  handleInput(event: any): void {
    const query = event.target.value?.toLowerCase() || '';
    if (!query) {
      // Si el input está vacío, restaura la lista original
      this.conversaciones = this.conversacionesOriginal;
    } else {
      this.conversaciones = this.comunicacionService.filtrarConversacionesPorNombre(
        this.conversacionesOriginal,
        this.usuarios,
        query
      );
    }
  }

  getUsuario(id_usuario: string) { // string
    return this.usuarios.find(u => u.id_usuario === id_usuario);
  }

  getUltimoMensaje(id_conversacion: string): Mensaje | undefined {
    return this.comunicacionService.getUltimoMensajeDeConversacion(this.mensajes, id_conversacion);
  }

  async marcarUltimoMensajeComoVisto(id_conversacion: string): Promise<void> { // string
    const ultimoMensaje = this.getUltimoMensaje(id_conversacion);
    if (
      ultimoMensaje &&
      !ultimoMensaje.estado_visto &&
      ultimoMensaje.id_usuario_emisor !== this.usuarioActual.id_usuario
    ) {
      await this.comunicacionService.marcarMensajesComoVistos(this.mensajes, id_conversacion, this.usuarioActual.id_usuario);
    }
  }



  getUsuariosConConversacion(): Usuario[] {
    if (!this.usuarioActual) return [];
    const miId = String(this.usuarioActual.id_usuario);

    // Obtén los IDs únicos de los otros usuarios en las conversaciones
    const otrosIds = new Set<string>();
    this.conversaciones.forEach(conv => {
      if (String(conv.id_usuario_emisor) === miId) {
        otrosIds.add(String(conv.id_usuario_receptor));
      } else if (String(conv.id_usuario_receptor) === miId) {
        otrosIds.add(String(conv.id_usuario_emisor));
      }
    });

    // Devuelve solo los usuarios que están en esos IDs
    return this.usuarios.filter(u => otrosIds.has(String(u.id_usuario)));
  }

  getUsuarioReceptor(conv: Conversacion): Usuario | undefined {
    if (!this.usuarioActual) return undefined;
    const miId = String(this.usuarioActual.id_usuario);
    if (String(conv.id_usuario_emisor) === miId) {
      return this.usuarios.find(u => String(u.id_usuario) === String(conv.id_usuario_receptor));
    } else {
      return this.usuarios.find(u => String(u.id_usuario) === String(conv.id_usuario_emisor));
    }
  }

  volver() {
    this.navCtrl.back();
  }
}