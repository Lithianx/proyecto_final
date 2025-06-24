import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VoiceRecorder } from 'capacitor-voice-recorder';
import { Keyboard } from '@capacitor/keyboard';

import { Usuario } from 'src/app/models/usuario.model';
import { Mensaje } from 'src/app/models/mensaje.model';

import { UtilsService } from 'src/app/services/utils.service';
import { LocalStorageService } from 'src/app/services/local-storage-social.service';
import { ComunicacionService } from 'src/app/services/comunicacion.service';
import { UsuarioService } from 'src/app/services/usuario.service';

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';
import { IonContent } from '@ionic/angular';
import { Conversacion } from 'src/app/models/conversacion.model';

@Component({
  selector: 'app-chat-privado',
  templateUrl: './chat-privado.page.html',
  styleUrls: ['./chat-privado.page.scss'],
  standalone: false,
})
export class ChatPrivadoPage implements OnInit {
  private mensajesSub?: Subscription;
  private conversacionesSub?: Subscription;

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  @ViewChild('audioInput', { static: false }) audioInput!: ElementRef;
  @ViewChild('videoInput') videoInput!: ElementRef<HTMLInputElement>;
  @ViewChild('endOfMessages') endOfMessages!: ElementRef;
  @ViewChild('mensajeInput') mensajeInput!: ElementRef<HTMLTextAreaElement>;
  @ViewChild(IonContent, { static: false }) ionContent!: IonContent;

  chatId: string | null = '';
  chatInfo!: Usuario;
  idConversacionActual!: string;
  nuevoMensaje: string = '';

  grabando: boolean = false;
  mediaRecorder: any;
  audioChunks: any[] = [];
  audioBlob: Blob | null = null;

  usuarioActual!: Usuario;
  usuarios: Usuario[] = [];
  mensajes: Mensaje[] = [];
  mensajesOffline: Mensaje[] = [];
  mensajesCombinados: Mensaje[] = [];

  // Scroll infinito
  todosLosMensajes: Mensaje[] = [];
  mensajesMostrados = 30;
  incrementoMensajes = 30;
  cargandoMas = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private localStorage: LocalStorageService,
    private comunicacionService: ComunicacionService,
    private usuarioService: UsuarioService,
    private cdRef: ChangeDetectorRef,
    private utilsService: UtilsService,
  ) { }

  private convertirFecha(fecha: any): Date {
    if (fecha instanceof Date) return fecha;
    if (fecha && typeof fecha.toDate === 'function') return fecha.toDate();
    return new Date(fecha);
  }

  async ngOnInit() {
    // Cargar usuario actual
    const usuario = await this.usuarioService.getUsuarioActualConectado();
    if (usuario) {
      this.usuarioActual = usuario;
      await this.localStorage.setItem('usuarioActual', usuario);
    } else {
      return;
    }

    // Cargar usuarios reales
    await this.usuarioService.cargarUsuarios();
    this.usuarios = this.usuarioService.getUsuarios();

    this.idConversacionActual = this.route.snapshot.paramMap.get('id') ?? '';

    // Verifica conexión
    const online = await this.utilsService.checkInternetConnection();

    if (online) {
      this.mensajesSub = this.comunicacionService.mensajes$.subscribe(async mensajesOnline => {
        this.mensajes = mensajesOnline
          .filter(m => m.id_conversacion === this.idConversacionActual)
          .map(m => ({
            ...m,
            fecha_envio: m.fecha_envio instanceof Date
              ? m.fecha_envio
              : (m.fecha_envio && typeof (m.fecha_envio as any).toDate === 'function'
                ? (m.fecha_envio as any).toDate()
                : new Date(m.fecha_envio))
          }));

        this.mensajesOffline = (await this.comunicacionService.getMensajesOffline()).filter(
          m => m.id_conversacion === this.idConversacionActual &&
            m.id_usuario_emisor === this.usuarioActual.id_usuario
        ) || [];

        this.mensajesCombinados = [
          ...this.mensajes,
          ...this.mensajesOffline
        ].sort((a, b) => {
          const fechaA = this.convertirFecha(a.fecha_envio);
          const fechaB = this.convertirFecha(b.fecha_envio);
          return fechaA.getTime() - fechaB.getTime();
        });

        this.cdRef.detectChanges();

        if (!this.cargandoMas) {
          this.scrollToBottom(true);
        } else {
          this.cargandoMas = false;
        }

        await this.marcarMensajesRecibidosComoVistos();
      });

      // Busca la conversación actual y el usuario receptor real (online)
      this.conversacionesSub = this.comunicacionService.conversaciones$.subscribe(conversaciones => {
        const conversacion = conversaciones.find(
          c => String(c.id_conversacion) === this.idConversacionActual
        );

        let idUsuarioContraparte = conversacion?.id_usuario_emisor;
        if (idUsuarioContraparte === this.usuarioActual.id_usuario) {
          idUsuarioContraparte = conversacion?.id_usuario_receptor;
        }

        this.chatInfo = this.usuarios.find(u => String(u.id_usuario) === String(idUsuarioContraparte))!;
      });

    } else {
      // SIN internet: carga los mensajes online guardados en local
      this.mensajes = (await this.comunicacionService.getMensajesLocales())
        .filter(m => m.id_conversacion === this.idConversacionActual)
        .map(m => ({
          ...m,
          fecha_envio: m.fecha_envio instanceof Date
            ? m.fecha_envio
            : (m.fecha_envio && typeof (m.fecha_envio as any).toDate === 'function'
              ? (m.fecha_envio as any).toDate()
              : new Date(m.fecha_envio))
        }));

      this.mensajesOffline = (await this.comunicacionService.getMensajesOffline()).filter(
        m => m.id_conversacion === this.idConversacionActual &&
          m.id_usuario_emisor === this.usuarioActual.id_usuario
      ) || [];

      this.mensajesCombinados = [
        ...this.mensajes,
        ...this.mensajesOffline
      ].sort((a, b) => {
        const fechaA = this.convertirFecha(a.fecha_envio);
        const fechaB = this.convertirFecha(b.fecha_envio);
        return fechaA.getTime() - fechaB.getTime();
      });

      // Cargar conversaciones y usuario receptor desde localStorage
      const conversacionesLocales: Conversacion[] = await this.comunicacionService.getConversacionesLocales();
      const conversacion = conversacionesLocales.find(
        c => String(c.id_conversacion) === this.idConversacionActual
      );

      let idUsuarioContraparte = conversacion?.id_usuario_emisor;
      if (idUsuarioContraparte === this.usuarioActual.id_usuario) {
        idUsuarioContraparte = conversacion?.id_usuario_receptor;
      }
      this.chatInfo = this.usuarios.find(u => String(u.id_usuario) === String(idUsuarioContraparte))!;

      this.cdRef.detectChanges();
      if (!this.cargandoMas) {
        this.scrollToBottom(true);
      } else {
        this.cargandoMas = false;
      }
    }
  }

  ngOnDestroy() {
    this.mensajesSub?.unsubscribe();
    this.conversacionesSub?.unsubscribe();
  }

  // Scroll infinito: cargar más mensajes al hacer scroll arriba
  onScroll(event: any) {
    const scrollTop = event.detail.scrollTop;
    if (scrollTop === 0 && this.mensajes.length < this.todosLosMensajes.length) {
      this.cargarMasMensajes();
    }
  }

  async cargarMasMensajes() {
    if (this.cargandoMas) return;
    this.cargandoMas = true;

    const chatContainer = document.querySelector('.chat-container') as HTMLElement;
    const prevScrollHeight = chatContainer?.scrollHeight || 0;

    this.mensajesMostrados = Math.min(
      this.mensajesMostrados + this.incrementoMensajes,
      this.todosLosMensajes.length
    );

    this.mensajes = this.todosLosMensajes.slice(-this.mensajesMostrados);

    requestAnimationFrame(() => {
      setTimeout(() => {
        const newScrollHeight = chatContainer.scrollHeight;
        const scrollDiff = newScrollHeight - prevScrollHeight;

        this.ionContent.scrollByPoint(0, scrollDiff, 0); // sin animación
        this.cargandoMas = false;
      }, 50);
    });
  }

  async marcarMensajesRecibidosComoVistos() {
    const mensajesNoVistos = this.mensajes.filter(
      m =>
        m.id_usuario_emisor !== this.usuarioActual.id_usuario &&
        !m.estado_visto
    );
    if (mensajesNoVistos.length > 0) {
      await this.comunicacionService.marcarMensajesComoVistos(
        mensajesNoVistos,
        this.idConversacionActual,
        this.usuarioActual.id_usuario
      );
    }
  }

  autoResize(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.mensajeInput?.nativeElement.focus();
    }, 300);
  }

  ngAfterViewChecked() {
    //   this.scrollToBottom();
  }

  scrollToBottom(instant: boolean = false) {
    setTimeout(() => {
      try {
        this.endOfMessages?.nativeElement.scrollIntoView({ behavior: instant ? 'auto' : 'smooth' });
      } catch (e) { }
    }, 100);
  }

  onImageLoad() {
    if (!this.cargandoMas) {
      this.scrollToBottom();
    }
  }

  onMediaLoad() {
    if (!this.cargandoMas) {
      this.scrollToBottom();
    }
  }

  imagenBase64: string | null = null;
  mostrarModalArchivos = false;

  abrirBuscadorGiphy() {
    this.mostrarModalArchivos = false;
    setTimeout(() => {
      this.mostrarBuscadorGiphy = true;
    }, 200);
  }

  giphyResults: any[] = [];

  async buscarGiphy(query: string) {
    const giphyApiKey = environment.giphyApiKey;
    const url = `https://api.giphy.com/v1/gifs/search?api_key=${giphyApiKey}&q=${encodeURIComponent(query)}&limit=20&rating=g`;
    const resp = await fetch(url);
    const data = await resp.json();
    this.giphyResults = data.data;
  }

  mostrarBuscadorGiphy = false;

  seleccionarGifGiphy(url: string) {
    this.imagenBase64 = url;
    this.mostrarBuscadorGiphy = false;
  }

  async enviarGifGiphy(url: string) {
    const mensaje: Mensaje = {
      id_mensaje: new Date().getTime().toString(),
      id_conversacion: this.idConversacionActual,
      id_usuario_emisor: this.usuarioActual.id_usuario,
      contenido: url,
      estado_visto: false,
    };

    await this.comunicacionService.enviarMensaje(mensaje);
    this.mostrarBuscadorGiphy = false;
    this.scrollToBottom();
  }

  abrirSelectorArchivos() {
    this.fileInput.nativeElement.click();
  }

  async tomarFoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        saveToGallery: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      if (image && image.dataUrl) {
        await this.comunicacionService.enviarMensajeMultimedia(
          'imagen',
          image.dataUrl,
          this.idConversacionActual,
          this.usuarioActual.id_usuario,
        );
        this.scrollToBottom();
      }
    } catch (error: any) {
      if (error.message?.toLowerCase().includes('permission')) {
        alert('Debes permitir el acceso a la cámara o galería desde la configuración de tu dispositivo.');
      } else {
        console.warn('No se seleccionó ninguna imagen o se canceló la acción.');
      }
    }
  }

  abrirInputVideo() {
    this.videoInput.nativeElement.click();
  }

  async onVideoSeleccionado(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        await this.comunicacionService.enviarMensajeMultimedia(
          'video',
          base64,
          this.idConversacionActual,
          this.usuarioActual.id_usuario,
        );
        this.scrollToBottom();
      };
      reader.readAsDataURL(file);
    }
  }

  seleccionarArchivo() {
    this.fileInput.nativeElement.click();
  }

  async onArchivoSeleccionado(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = async () => {
        const base64 = reader.result as string;
        if (file.type.startsWith('image/')) {
          await this.comunicacionService.enviarMensajeMultimedia(
            'imagen',
            base64,
            this.idConversacionActual,
            this.usuarioActual.id_usuario,
          );
        } else if (file.type.startsWith('video/')) {
          await this.comunicacionService.enviarMensajeMultimedia(
            'video',
            base64,
            this.idConversacionActual,
            this.usuarioActual.id_usuario,
          );
        }
        this.scrollToBottom();

        event.target.value = '';
      };

      reader.readAsDataURL(file);
    }
  }

  async iniciarGrabacion() {
    this.grabando = true;
    await VoiceRecorder.startRecording();
  }

  async detenerGrabacion() {
    this.grabando = false;
    try {
      const result = await VoiceRecorder.stopRecording();
      if (result.value && result.value.recordDataBase64) {
        const audioBase64 = `data:audio/mp4;base64,${result.value.recordDataBase64}`;
        await this.enviarMensajeDeVoz(audioBase64);
      }
    } catch (error) {
      console.error('Error al detener la grabación:', error);
    }
  }

  async enviarMensajeDeVoz(audioBase64: string) {
    await this.comunicacionService.enviarMensajeMultimedia(
      'audio',
      audioBase64,
      this.idConversacionActual,
      this.usuarioActual.id_usuario,
    );
    this.scrollToBottom();
  }

  async enviarMensaje() {
    if (this.nuevoMensaje.trim() === '') return;

    const mensaje: Mensaje = {
      id_mensaje: '', // Temporal
      id_conversacion: this.idConversacionActual,
      id_usuario_emisor: this.usuarioActual.id_usuario,
      contenido: this.nuevoMensaje,
      estado_visto: false,
    };

    await this.comunicacionService.enviarMensaje(mensaje);

    // Recarga mensajesOffline y mensajesCombinados si estás offline
    const online = await this.utilsService.checkInternetConnection();
    if (!online) {
      this.mensajesOffline = (await this.comunicacionService.getMensajesOffline()).filter(
        m => m.id_conversacion === this.idConversacionActual &&
          m.id_usuario_emisor === this.usuarioActual.id_usuario
      ) || [];

      this.mensajesCombinados = [
        ...this.mensajes,
        ...this.mensajesOffline
      ].sort((a, b) => {
        const fechaA = this.convertirFecha(a.fecha_envio);
        const fechaB = this.convertirFecha(b.fecha_envio);
        return fechaA.getTime() - fechaB.getTime();
      });

      this.cdRef.detectChanges();
    }

    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.style.height = 'auto';
    }

    this.nuevoMensaje = '';
    this.scrollToBottom();
  }

  esMensajeOffline(id_mensaje: string): boolean {
    return this.mensajesOffline.some(m => m.id_mensaje === id_mensaje);
  }

  esPublicacion(mensaje: Mensaje): boolean {
    try {
      const obj = JSON.parse(mensaje.contenido);
      return obj && obj.id_publicacion && obj.contenido;
    } catch {
      return false;
    }
  }

  obtenerPublicacion(mensaje: Mensaje): any | null {
    try {
      return JSON.parse(mensaje.contenido);
    } catch {
      return null;
    }
  }

  verPerfil(usuario: Usuario | undefined) {
    if (usuario) {
      this.router.navigate(['/perfil-user', usuario.id_usuario]);
    }
  }

  ionViewWillLeave() {
    Keyboard.hide();
  }
}