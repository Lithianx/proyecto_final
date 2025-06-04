import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ViewChild, ElementRef } from '@angular/core';
import { VoiceRecorder } from 'capacitor-voice-recorder';
import { Keyboard } from '@capacitor/keyboard';

import { Usuario } from 'src/app/models/usuario.model';
import { Conversacion } from 'src/app/models/conversacion.model';


@Component({
  selector: 'app-chat-privado',
  templateUrl: './chat-privado.page.html',
  styleUrls: ['./chat-privado.page.scss'],
  standalone: false,
})
export class ChatPrivadoPage implements OnInit {

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  @ViewChild('audioInput', { static: false }) audioInput!: ElementRef;
  @ViewChild('endOfMessages') endOfMessages!: ElementRef;
  @ViewChild('mensajeInput') mensajeInput!: ElementRef<HTMLTextAreaElement>;

  chatId: string | null = '';
  chatInfo!: Usuario;
  idConversacionActual!: number;
  nuevoMensaje: string = '';

  grabando: boolean = false; // Variable para saber si está grabando
  mediaRecorder: any;
  audioChunks: any[] = [];
  audioBlob: Blob | null = null;

  // Usuarios simulados (modelo real)
  usuariosMock: Usuario[] = [
    {
      id_usuario: 1,
      nombre_usuario: 'johndoe',
      correo_electronico: 'john@correo.com',
      fecha_registro: new Date(),
      contrasena: '',
      avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
      estado_cuenta: true,
      estado_online: true
    },
    {
      id_usuario: 2,
      nombre_usuario: 'gamer123',
      correo_electronico: 'gamer@correo.com',
      fecha_registro: new Date(),
      contrasena: '',
      avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
      estado_cuenta: true,
      estado_online: false
    },
    {
      id_usuario: 3,
      nombre_usuario: 'petterpan',
      correo_electronico: 'petter@correo.com',
      fecha_registro: new Date(),
      contrasena: '',
      avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
      estado_cuenta: true,
      estado_online: true
    }
  ];


  // Conversaciones simuladas (cada mensaje es una Conversacion)
  mensajes: Conversacion[] = [
    {
      id_conversacion: 1,
      id_emisor: 1,
      id_receptor: 0,
      contenido_conversacion: '¡Hola!',
      fecha_envio: new Date(),
      estado_visto: true
    },
    {
      id_conversacion: 1,
      id_emisor: 0,
      id_receptor: 1,
      contenido_conversacion: '¿Cómo estás?',
      fecha_envio: new Date(),
      estado_visto: true
    },
    {
      id_conversacion: 2,
      id_emisor: 2,
      id_receptor: 0,
      contenido_conversacion: '¡Hola! Soy gamer123',
      fecha_envio: new Date(),
      estado_visto: true
    }
  ];

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    // Recibe el id de la conversación
    const idConversacionActual = Number(this.route.snapshot.paramMap.get('id'));
    // Filtra los mensajes de esa conversación
    this.mensajes = this.mensajes.filter(m => m.id_conversacion === idConversacionActual);

    // Si no hay mensajes, usa el usuario prueba
    if (this.mensajes.length === 0) {
      this.chatInfo = {
        id_usuario: 99,
        nombre_usuario: 'PRUEBA',
        correo_electronico: '',
        fecha_registro: new Date(),
        contrasena: '',
        avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
        estado_cuenta: true,
        estado_online: false
      };
    } else {
      // Busca el usuario contraparte (el que NO es "yo", asumiendo que "yo" es id 0)
      const mensajeEjemplo = this.mensajes[0];
      const idUsuarioContraparte = mensajeEjemplo.id_emisor !== 0 ? mensajeEjemplo.id_emisor : mensajeEjemplo.id_receptor;
      this.chatInfo = this.usuariosMock.find(u => u.id_usuario === idUsuarioContraparte) || {
        id_usuario: 99,
        nombre_usuario: 'PRUEBA',
        correo_electronico: '',
        fecha_registro: new Date(),
        contrasena: '',
        avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
        estado_cuenta: true,
        estado_online: false
      };
    }
  }


  autoResize(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto'; // Reinicia la altura para calcular correctamente
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.mensajeInput?.nativeElement.focus();
    }, 300); // Espera un poco para asegurar que el DOM esté listo
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
    this.scrollToBottom();  // Desplazar hacia abajo después de que la imagen se haya cargado
  }

  onMediaLoad() {
    this.scrollToBottom();  // Desplazar hacia abajo después de que el contenido multimedia (imagen o video) esté listo
  }






  seleccionarArchivo() {
    this.fileInput.nativeElement.click();
  }

  onArchivoSeleccionado(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = () => {
        const base64 = reader.result as string;
        const horaActual = new Date()

        const mensaje: Conversacion = {
          id_conversacion: new Date().getTime(),
          id_emisor: 0,
          id_receptor: Number(this.chatId),
          contenido_conversacion: '',
          fecha_envio: horaActual,
          estado_visto: false,
        };

        if (file.type.startsWith('image/')) {
          mensaje.contenido_conversacion = `[imagen] ${base64}`;
        } else if (file.type.startsWith('video/')) {
          mensaje.contenido_conversacion = `[video] ${base64}`;
        }

        this.mensajes.push(mensaje);
        this.scrollToBottom(); // 👈 Desplazarse al final

        // Simula respuesta
        setTimeout(() => {
          this.mensajes.push({
            id_conversacion: this.idConversacionActual, // o el id actual de la conversación
            id_emisor: this.chatInfo.id_usuario,        // <-- el usuario contraparte
            id_receptor: 0,                             // <-- tú
            contenido_conversacion: '¡Entendido!',
            fecha_envio: new Date(),
            estado_visto: false
          });
        }, 1000);

        // Resetear input para permitir reelección del mismo archivo
        event.target.value = '';
      };

      reader.readAsDataURL(file);
    }
  }


  async iniciarGrabacion() {
    this.grabando = true;
    const result = await VoiceRecorder.startRecording();
    console.log('Grabación iniciada:', result);
  }

  async detenerGrabacion() {
    this.grabando = false;
    console.log('Deteniendo grabación...');

    try {
      const result = await VoiceRecorder.stopRecording();
      console.log('Resultado de la grabación:', result);

      if (result.value && result.value.recordDataBase64) {
        console.log('Contenido grabado:', result.value.recordDataBase64); // 👈 Asegurar que hay datos
        const audioBase64 = `data:audio/mp4;base64,${result.value.recordDataBase64}`;
        this.enviarMensajeDeVoz(audioBase64);
        console.log('Mensaje de voz enviado automáticamente.');
      } else {
        console.error('No se obtuvo audio.');
      }
    } catch (error) {
      console.error('Error al detener la grabación:', error);
    }
  }


  async enviarMensajeDeVoz(audioBase64: string) {
    console.log('Mensaje de voz recibido:', audioBase64);

    const horaActual = new Date()
    console.log('Audio Base64 generado:', audioBase64);

    const mensaje: Conversacion = {
      id_conversacion: new Date().getTime(),
      id_emisor: 0,
      id_receptor: Number(this.chatId),
      contenido_conversacion: `[audio] ${audioBase64}`,
      fecha_envio: horaActual,
      estado_visto: false,
    };
    console.log('Mensaje de voz recibido:', mensaje.contenido_conversacion);

    this.mensajes.push(mensaje);
    this.scrollToBottom();

    // Simula respuesta
    setTimeout(() => {
      this.mensajes.push({
        id_conversacion: this.idConversacionActual, // o el id actual de la conversación
        id_emisor: this.chatInfo.id_usuario,        // <-- el usuario contraparte
        id_receptor: 0,                             // <-- tú
        contenido_conversacion: '¡Entendido!',
        fecha_envio: new Date(),
        estado_visto: false
      });
    }, 1000);

  }





  enviarMensaje() {
    if (this.nuevoMensaje.trim() === '') return;

    const horaActual = new Date()
    const mensaje: Conversacion = {
      id_conversacion: new Date().getTime(),
      id_emisor: 0,
      id_receptor: Number(this.chatId),
      contenido_conversacion: this.nuevoMensaje,
      fecha_envio: horaActual,
      estado_visto: false,
    };

    this.mensajes.push(mensaje);

    // Reinicia el tamaño del textarea
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.style.height = 'auto';
    }


    this.nuevoMensaje = '';


    this.scrollToBottom();

    // Simula respuesta
    setTimeout(() => {
      this.mensajes.push({
        id_conversacion: this.idConversacionActual, // o el id actual de la conversación
        id_emisor: this.chatInfo.id_usuario,        // <-- el usuario contraparte
        id_receptor: 0,                             // <-- tú
        contenido_conversacion: '¡Entendido!',
        fecha_envio: new Date(),
        estado_visto: false
      });
    }, 1000);

  }

  ionViewWillLeave() {
    Keyboard.hide();
  }
}
