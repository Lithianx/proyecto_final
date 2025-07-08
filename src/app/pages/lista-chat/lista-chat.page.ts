import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavController, IonSearchbar } from '@ionic/angular';
import { SeguirService } from 'src/app/services/seguir.service';
import { Usuario } from 'src/app/models/usuario.model';
import { Mensaje } from 'src/app/models/mensaje.model';
import { Conversacion } from 'src/app/models/conversacion.model';

import { LocalStorageService } from 'src/app/services/local-storage-social.service';
import { ComunicacionService } from 'src/app/services/comunicacion.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Subscription } from 'rxjs';
import { CryptoService } from 'src/app/services/crypto.service';

@Component({
  selector: 'app-lista-chat',
  templateUrl: './lista-chat.page.html',
  styleUrls: ['./lista-chat.page.scss'],
  standalone: false,
})
export class ListaChatPage implements OnInit, OnDestroy {

  usuarioActual!: Usuario;
  usuarios: Usuario[] = [];
  conversaciones: Conversacion[] = [];
  conversacionesOriginal: Conversacion[] = [];
  mensajes: Mensaje[] = [];

  usuariosSeguidos: Usuario[] = [];
  resultadosBusqueda: Usuario[] = [];
  buscando = false;

  private mensajesSub?: Subscription;
  private conversacionesSub?: Subscription;

  @ViewChild(IonSearchbar) searchbar!: IonSearchbar;

  constructor(
    private navCtrl: NavController,
    private localStorage: LocalStorageService,
    private comunicacionService: ComunicacionService,
    private usuarioService: UsuarioService,
    private utilsService: UtilsService,
    private seguirService: SeguirService,
    private cryptoService: CryptoService
  ) { }

  async ngOnInit() {
    await this.cargarDatosChat();
  }

  async ionViewWillEnter() {
    await this.cargarDatosChat();
  }

  ngOnDestroy() {
    this.mensajesSub?.unsubscribe();
    this.conversacionesSub?.unsubscribe();
  }

  private async cargarDatosChat() {
    // Cargar usuario actual
    const usuario = await this.usuarioService.getUsuarioActualConectado();
    if (usuario) {
      this.usuarioActual = usuario;
      await this.localStorage.setItem('usuarioActual', usuario);
    } else {
      return;
    }

    // Cargar usuarios y seguimientos
    await this.usuarioService.cargarUsuarios();
    this.usuarios = this.usuarioService.getUsuarios();
    await this.seguirService.cargarSeguimientos();
    this.usuariosSeguidos = this.seguirService.getUsuariosSeguidos(this.usuarios, this.usuarioActual.id_usuario);

    // Verifica conexión y carga local si no hay internet
    const online = await this.utilsService.checkInternetConnection();
    if (!online) {
      this.conversaciones = await this.localStorage.getList<Conversacion>('conversaciones') || [];
      this.conversacionesOriginal = this.conversaciones;
      this.mensajes = await this.localStorage.getList<Mensaje>('mensajes') || [];
      await this.cargarUltimosMensajesDescifrados();
      return;
    }

    // Suscribirse a los mensajes y conversaciones en tiempo real
    this.mensajesSub?.unsubscribe();
    this.conversacionesSub?.unsubscribe();
    this.mensajesSub = this.comunicacionService.mensajes$.subscribe(async mensajes => {
      this.mensajes = mensajes;
      await this.cargarUltimosMensajesDescifrados();
    });
    this.conversacionesSub = this.comunicacionService.conversaciones$.subscribe(async convs => {
      this.conversaciones = convs;
      this.conversacionesOriginal = convs;
      await this.localStorage.setItem('conversaciones', convs);
      await this.cargarUltimosMensajesDescifrados();
    });
  }

  doRefresh(event: any) {
    setTimeout(async () => {
      await this.usuarioService.cargarUsuarios();
      this.usuarios = this.usuarioService.getUsuarios();
      await this.seguirService.cargarSeguimientos();
      this.usuariosSeguidos = this.seguirService.getUsuariosSeguidos(this.usuarios, this.usuarioActual.id_usuario);
      event.target.complete();
    }, 1500);
  }

  handleInput(event: any): void {
    const query = event.target.value?.toLowerCase() || '';
    if (!query) {
      this.resultadosBusqueda = [];
      this.buscando = false;
    } else {
      // Usuarios seguidos + usuarios con conversación (sin duplicados)
      const usuariosConConversacion = this.getUsuariosConConversacion();
      const todos = [...this.usuariosSeguidos, ...usuariosConConversacion]
        .filter((u, i, arr) => arr.findIndex(x => x.id_usuario === u.id_usuario) === i);

      this.resultadosBusqueda = todos.filter(u =>
        u.nombre_usuario.toLowerCase().includes(query)
      );
      this.buscando = true;
    }
  }

  async abrirChat(usuario: Usuario) {
    const id_conversacion = await this.comunicacionService.obtenerOcrearConversacionPrivada(
      this.usuarioActual.id_usuario,
      usuario.id_usuario
    );
    this.navCtrl.navigateForward(['/chat-privado', id_conversacion]);
    this.resultadosBusqueda = [];
    this.buscando = false;
    if (this.searchbar) {
      this.searchbar.value = '';
    }
  }

  get conversacionesFiltradas(): Conversacion[] {
    if (!this.usuarioActual) return [];
    return this.comunicacionService.filtrarConversacionesPorUsuario(
      this.conversaciones,
      this.usuarioActual.id_usuario
    );
  }

  getUsuario(id_usuario: string) {
    return this.usuarios.find(u => u.id_usuario === id_usuario);
  }

  getUltimoMensaje(id_conversacion: string): Mensaje | undefined {
    return this.comunicacionService.getUltimoMensajeDeConversacion(this.mensajes, id_conversacion);
  }

  ultimoMensajeDescifrado: { [id_conversacion: string]: Mensaje } = {};

  async getUltimoMensajeDescifrado(id_conversacion: string): Promise<Mensaje | undefined> {
    const mensaje = this.getUltimoMensaje(id_conversacion);
    if (mensaje) {
      return {
        ...mensaje,
        contenido: await this.cryptoService.descifrar(mensaje.contenido)
      };
    }
    return undefined;
  }

  async cargarUltimosMensajesDescifrados() {
    this.ultimoMensajeDescifrado = {};
    for (const conv of this.conversaciones) {
      const mensaje = this.getUltimoMensaje(conv.id_conversacion);
      if (mensaje) {
        this.ultimoMensajeDescifrado[conv.id_conversacion] = {
          ...mensaje,
          contenido: await this.cryptoService.descifrar(mensaje.contenido)
        };
      }
    }
  }

  async marcarUltimoMensajeComoVisto(id_conversacion: string): Promise<void> {
    const ultimoMensaje = this.getUltimoMensaje(id_conversacion);
    if (
      ultimoMensaje &&
      !ultimoMensaje.estado_visto &&
      ultimoMensaje.id_usuario_emisor !== this.usuarioActual.id_usuario
    ) {
      await this.comunicacionService.marcarMensajesComoVistos(
        [ultimoMensaje], 
        id_conversacion, 
        this.usuarioActual.id_usuario
      );
      
      // Actualizar el estado local inmediatamente
      ultimoMensaje.estado_visto = true;
      
      // Recalcular el contador de mensajes no vistos
      await this.comunicacionService.recalcularContadorMensajesNoVistos();
    }
  }

  parseFechaEnvio(fecha: any): Date | null {
    if (!fecha) return null;
    if (fecha instanceof Date) return fecha;
    if (typeof fecha === 'string') return new Date(fecha);
    if (typeof fecha === 'object' && typeof fecha.toDate === 'function') return fecha.toDate();
    return null;
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

  esPublicacion(mensaje: Mensaje): boolean {
    try {
      const obj = JSON.parse(mensaje.contenido);
      // Una publicación debe tener id_publicacion y al menos uno de: contenido, imagen, video
      return obj && obj.id_publicacion && (
        obj.contenido || 
        obj.imagen || 
        obj.video ||
        obj.fecha_publicacion ||
        obj.id_usuario
      );
    } catch {
      return false;
    }
  }

  volver() {
    this.navCtrl.back();
  }
}