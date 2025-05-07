import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ViewChild, ElementRef } from '@angular/core';

interface Usuario {
  id: string;
  username: string;
  userAvatar: string;
}

interface Mensaje {
  id: string;
  emisorId: string;
  receptorId: string;
  contenido: string;
  timestamp: string;
  imagen?: string;
  video?: string;
  audio?: string;
  leido?: boolean;
}

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

  chatId: string | null = '';
  chatInfo: Usuario = { id: '', username: '', userAvatar: '' };

  nuevoMensaje: string = '';

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.chatId = this.route.snapshot.paramMap.get('id');
    this.chatInfo = this.usuariosMock.find(user => user.id === this.chatId) || { id: '', username: '', userAvatar: '' };
  }

  mensajes: Mensaje[] = [
    { id: 'm1', emisorId: '1', receptorId: 'yo', contenido: '¡Hola!', timestamp: '10:00', leido: true },
    { id: 'm2', emisorId: 'yo', receptorId: '1', contenido: '¿Cómo estás?', timestamp: '10:01', leido: false },
    { id: 'm3', emisorId: '1', receptorId: 'yo', contenido: 'Todo bien, ¿y tú?', timestamp: '10:02', leido: true }
  ];

  usuariosMock: Usuario[] = [
    { id: '1', username: 'johndoe', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg' },
    { id: '2', username: 'gamer123', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg' },
    { id: '3', username: 'petterpan', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg' },
  ];





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
        const horaActual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const mensaje: Mensaje = {
          id: new Date().getTime().toString(),
          emisorId: 'yo',
          receptorId: this.chatId!,
          contenido: '',  // No hay texto
          timestamp: horaActual,
          leido: false,
        };

        if (file.type.startsWith('image/')) {
          mensaje.imagen = base64;
        } else if (file.type.startsWith('video/')) {
          mensaje.video = base64;
        }

        this.mensajes.push(mensaje);
        this.scrollToBottom(); // 👈 Desplazarse al final

        // Resetear input para permitir reelección del mismo archivo
        event.target.value = '';
      };

      reader.readAsDataURL(file);
    }
  }

  seleccionarAudio() {
    this.audioInput.nativeElement.click();
  }

  onAudioSeleccionado(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const audioBase64 = reader.result as string;
        const horaActual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        this.mensajes.push({
          id: new Date().getTime().toString(),
          emisorId: 'yo',
          receptorId: this.chatId!,
          contenido: '',
          timestamp: horaActual,
          audio: audioBase64,
          leido: false,
        });
        // Resetear input para permitir reelección del mismo archivo
        this.scrollToBottom(); // 👈 Desplazarse al final
        event.target.value = '';
      };
      reader.readAsDataURL(file);
    }
  }

  enviarMensaje() {
    if (this.nuevoMensaje.trim() === '') return;

    const horaActual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const mensaje: Mensaje = {
      id: new Date().getTime().toString(),
      emisorId: 'yo',
      receptorId: this.chatId!,
      contenido: this.nuevoMensaje,
      timestamp: horaActual,
      leido: false,
    };

    this.mensajes.push(mensaje);

    this.nuevoMensaje = '';


    this.scrollToBottom();
  }
}
