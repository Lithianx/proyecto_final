import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VoiceRecorder } from 'capacitor-voice-recorder';
import { Keyboard } from '@capacitor/keyboard';

import { Usuario } from 'src/app/models/usuario.model';
import { Mensaje } from 'src/app/models/mensaje.model';

import { LocalStorageService } from 'src/app/services/local-storage-social.service';
import { ComunicacionService } from 'src/app/services/comunicacion.service';

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-chat-privado',
  templateUrl: './chat-privado.page.html',
  styleUrls: ['./chat-privado.page.scss'],
  standalone: false,
})
export class ChatPrivadoPage implements OnInit {

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  @ViewChild('audioInput', { static: false }) audioInput!: ElementRef;
  @ViewChild('videoInput') videoInput!: ElementRef<HTMLInputElement>;
  @ViewChild('endOfMessages') endOfMessages!: ElementRef;
  @ViewChild('mensajeInput') mensajeInput!: ElementRef<HTMLTextAreaElement>;

  chatId: string | null = '';
  chatInfo!: Usuario;
  idConversacionActual!: string;
  nuevoMensaje: string = '';

  grabando: boolean = false;
  mediaRecorder: any;
  audioChunks: any[] = [];
  audioBlob: Blob | null = null;

  // id_usuario ahora es string
  usuarioActual: Usuario = {
    id_usuario: '999',
    nombre_usuario: 'Usuario no Demo',
    correo_electronico: 'demo@correo.com',
    fecha_registro: new Date(),
    contrasena: '',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
    estado_cuenta: true,
    estado_online: true
  };

  usuariosMock: Usuario[] = [
    {
      id_usuario: '900',
      nombre_usuario: 'Bot',
      correo_electronico: 'bot@correo.com',
      fecha_registro: new Date(),
      contrasena: '',
      avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
      estado_cuenta: true,
      estado_online: true
    }
  ];

  mensajes: Mensaje[] = [];

  constructor(
    private route: ActivatedRoute,
    private localStorage: LocalStorageService,
    private comunicacionService: ComunicacionService
  ) { }

  async ngOnInit() {
    // Cargar usuario actual desde Ionic Storage
    const usuarioGuardado = await this.localStorage.getItem<Usuario>('usuarioActual');
    if (usuarioGuardado) {
      this.usuarioActual = usuarioGuardado;
    }

    // idConversacionActual ahora es string
    this.idConversacionActual = this.route.snapshot.paramMap.get('id') ?? '';

    // Suscríbete a los mensajes del service
    this.comunicacionService.mensajes$.subscribe(mensajes => {
      this.mensajes = mensajes.filter(m => m.id_conversacion === this.idConversacionActual);
    });

    // Busca la conversación actual
    this.comunicacionService.conversaciones$.subscribe(conversaciones => {
      const conversacion = conversaciones.find(
        c => String(c.id_conversacion) === this.idConversacionActual
      );

      // Deducir el id del usuario contraparte
      let idUsuarioContraparte = conversacion?.id_usuario_emisor;
      if (idUsuarioContraparte === this.usuarioActual.id_usuario) {
        idUsuarioContraparte = conversacion?.id_usuario_receptor;
      }

      // Buscar el usuario contraparte en el mock (o en tu base real)
      this.chatInfo = this.usuariosMock.find(u => u.id_usuario === idUsuarioContraparte)!;
    });
    // Marcar como vistos los mensajes recibidos
    await this.marcarMensajesRecibidosComoVistos();
  }

  async marcarMensajesRecibidosComoVistos() {
    await this.comunicacionService.marcarMensajesComoVistos(this.idConversacionActual, this.usuarioActual.id_usuario);
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
    this.scrollToBottom();
  }

  scrollToBottom() {
    try {
      this.endOfMessages.nativeElement.scrollIntoView({ behavior: 'smooth' });
    } catch (err) { }
  }

  onImageLoad() {
    this.scrollToBottom();
  }

  onMediaLoad() {
    this.scrollToBottom();
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
    const horaActual = new Date();
    const mensaje: Mensaje = {
      id_mensaje: new Date().getTime().toString(),
      id_conversacion: this.idConversacionActual,
      id_usuario_emisor: this.usuarioActual.id_usuario,
      contenido: url,
      fecha_envio: horaActual,
      estado_visto: false,
    };

    await this.comunicacionService.enviarMensaje(mensaje);
    this.mostrarBuscadorGiphy = false;
    this.scrollToBottom();

    // Simula respuesta
    setTimeout(async () => {
      await this.comunicacionService.enviarRespuestaAutomatica(
        this.idConversacionActual,
        this.chatInfo.id_usuario
      );
      await this.marcarMensajesRecibidosComoVistos();
    }, 1000);
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

        setTimeout(async () => {
          await this.comunicacionService.enviarRespuestaAutomatica(
            this.idConversacionActual,
            this.chatInfo.id_usuario
          );
          await this.marcarMensajesRecibidosComoVistos();
        }, 1000);
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

        setTimeout(async () => {
          await this.comunicacionService.enviarRespuestaAutomatica(
            this.idConversacionActual,
            this.chatInfo.id_usuario
          );
          await this.marcarMensajesRecibidosComoVistos();
        }, 1000);

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

    setTimeout(async () => {
      await this.comunicacionService.enviarRespuestaAutomatica(
        this.idConversacionActual,
        this.chatInfo.id_usuario
      );
      await this.marcarMensajesRecibidosComoVistos();
    }, 1000);
  }

  async enviarMensaje() {
    if (this.nuevoMensaje.trim() === '') return;

    const horaActual = new Date();
    const mensaje: Mensaje = {
      id_mensaje: new Date().getTime().toString(),
      id_conversacion: this.idConversacionActual,
      id_usuario_emisor: this.usuarioActual.id_usuario,
      contenido: this.nuevoMensaje,
      fecha_envio: horaActual,
      estado_visto: false,
    };

    await this.comunicacionService.enviarMensaje(mensaje);

    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.style.height = 'auto';
    }

    this.nuevoMensaje = '';
    this.scrollToBottom();

    setTimeout(async () => {
      await this.comunicacionService.enviarRespuestaAutomatica(
        this.idConversacionActual,
        this.chatInfo.id_usuario
      );
      await this.marcarMensajesRecibidosComoVistos();
    }, 1000);
  }

  ionViewWillLeave() {
    Keyboard.hide();
  }
}