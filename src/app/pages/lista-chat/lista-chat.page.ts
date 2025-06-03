
import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

import { Usuario } from 'src/app/models/usuario.model';
import { ConversacionUsuario } from 'src/app/models/conversacion-usuario.model';


@Component({
  selector: 'app-lista-chat',
  templateUrl: './lista-chat.page.html',
  styleUrls: ['./lista-chat.page.scss'],
  standalone: false,
})
export class ListaChatPage implements OnInit {

usuarios: Usuario[] = [
  {
    id_usuario: 123,
    nombre_usuario: 'johndoe',
    correo_electronico: 'john@correo.com',
    fecha_registro: new Date('2024-01-01'),
    contrasena: '',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
    estado_cuenta: true,
    estado_online: true
  },
  {
    id_usuario: 456,
    nombre_usuario: 'janedoe',
    correo_electronico: 'jane@correo.com',
    fecha_registro: new Date('2024-02-01'),
    contrasena: '',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
    estado_cuenta: true,
    estado_online: false
  },
  {
    id_usuario: 789,
    nombre_usuario: 'pedrogamer',
    correo_electronico: 'pedro@gamer.com',
    fecha_registro: new Date('2024-03-01'),
    contrasena: '',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
    estado_cuenta: true,
    estado_online: true
  },
  {
    id_usuario: 900,
    nombre_usuario: 'pedrogamer',
    correo_electronico: 'pedro@gamer.com',
    fecha_registro: new Date('2024-03-01'),
    contrasena: '',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
    estado_cuenta: true,
    estado_online: true
  },
  {
    id_usuario: 9000,
    nombre_usuario: 'pedrogamer',
    correo_electronico: 'pedro@gamer.com',
    fecha_registro: new Date('2024-03-01'),
    contrasena: '',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
    estado_cuenta: true,
    estado_online: true
  }
];



  // Simulación de lista de chats usando el modelo real
chatsOriginal: ConversacionUsuario[] = [
  {
    id_conversacion: 1,
    id_usuario: 123,
    ultimo_mensaje: '[imagen] https://ejemplo.com/imagen.jpg',
    fecha_ultimo_mensaje: new Date(),
    leido: true, // Indica que el último mensaje fue leído
  },
  {
    id_conversacion: 2,
    id_usuario: 789,
    ultimo_mensaje: '[audio] https://ejemplo.com/audio.mp3',
    fecha_ultimo_mensaje: new Date(),
    leido: false, // Indica que el último mensaje no fue leído
  },
  {
    id_conversacion: 3,
    id_usuario: 456,
    ultimo_mensaje: '[video] https://ejemplo.com/video.mp4',
    fecha_ultimo_mensaje: new Date(),
    leido: true, // Indica que el último mensaje fue leído
  },
  {
    id_conversacion: 4,
    id_usuario: 900,
    ultimo_mensaje: '¡Hola! ¿Cómo estás?',
    fecha_ultimo_mensaje: new Date(),
    leido: false, // Indica que el último mensaje no fue leído
  }
];

  chats: ConversacionUsuario[] = [];

  constructor(private navCtrl: NavController) {}

  ngOnInit() {
    this.chats = [...this.chatsOriginal];
  }

  // Filtrado de la lista de chats por el nombre del participante
  handleInput(event: any): void {
    const query = event.target.value?.toLowerCase() || '';
    this.chats = this.chatsOriginal.filter(chat => {
      const usuario = this.usuarios.find(u => u.id_usuario === chat.id_usuario);
      return usuario ? usuario.nombre_usuario.toLowerCase().includes(query) : false;
    });
  }


getUsuario(id_usuario: number) {
  return this.usuarios.find(u => u.id_usuario === id_usuario);
}

  volver() {
    this.navCtrl.back();
  }
}
