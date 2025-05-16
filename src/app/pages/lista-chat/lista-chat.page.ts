import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';


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

interface ChatPrivado {
  id: string;
  participante: Usuario;
  ultimoMensaje?: Mensaje;
}


@Component({
  selector: 'app-lista-chat',
  templateUrl: './lista-chat.page.html',
  styleUrls: ['./lista-chat.page.scss'],
  standalone: false,
})
export class ListaChatPage implements OnInit {

  // Lista original de chats, tipificada con la interface ChatPrivado
  chatsOriginal: ChatPrivado[] = [
    {
      id: '1',
      participante: {
        id: 'u123',
        username: 'johndoe',
        userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
      },
      ultimoMensaje: {
        id: 'm1',
        emisorId: 'u123',
        receptorId: 'yo',
        contenido: '¡Hola! ¿Cómo estás?',
        timestamp: '2025-04-29T10:00:00',
        leido: true
      },
    },
    {
      id: '2',
      participante: {
        id: 'u124',
        username: 'gamer123',
        userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
      },
      ultimoMensaje: {
        id: 'm2',
        emisorId: 'u124',
        receptorId: 'yo',
        contenido: 'Gracias por la invitación a jugar.',
        timestamp: '2025-04-29T10:15:00',
        leido: false
      },
    },
    {
      id: '3',
      participante: {
        id: 'u125',
        username: 'petterpan',
        userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
      },
      ultimoMensaje: {
        id: 'm3',
        emisorId: 'u125',
        receptorId: 'yo',
        contenido: '',
        timestamp: '2025-04-29T10:30:00',
        imagen: 'https://ionicframework.com/docs/img/demos/thumbnail.svg',
        leido: true,
      },
    },
    {
      id: '4',
      participante: {
        id: 'u126',
        username: 'videofan',
        userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
      },
      ultimoMensaje: {
        id: 'm4',
        emisorId: 'u126',
        receptorId: 'yo',
        contenido: '',
        timestamp: '2025-04-29T10:45:00',
        video: 'https://example.com/videos/video-demo.mp4',
        leido: true,
      },
    },
    {
      id: '5',
      participante: {
        id: 'u127',
        username: 'audiolover',
        userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
      },
      ultimoMensaje: {
        id: 'm5',
        emisorId: 'u127',
        receptorId: 'yo',
        contenido: '',
        timestamp: '2025-04-29T10:50:00',
        audio: 'https://example.com/audio/audio-demo.mp3',
        leido: false,
      },
    }
  ];

  chats: ChatPrivado[] = [];

  constructor(private navCtrl: NavController) {}

  ngOnInit() {
    this.chats = [...this.chatsOriginal];
  }

  // Filtrado de la lista de chats por el nombre del participante
  handleInput(event: any): void {
    const query = event.target.value?.toLowerCase() || '';
    this.chats = this.chatsOriginal.filter(chat =>
      chat.participante.username.toLowerCase().includes(query)
    );
  }

  volver() {
    this.navCtrl.back();
  }
}
