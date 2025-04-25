import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-lista-chat',
  templateUrl: './lista-chat.page.html',
  styleUrls: ['./lista-chat.page.scss'],
  standalone: false,
})
export class ListaChatPage implements OnInit {

  postsOriginal: any[] = [
    {
      id: 1,
      username: 'johndoe',
      userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
      mensage: '¡Hola! ¿Cómo estás?',
    },
    {
      id: 2,
      username: 'gamer123',
      userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
      image: 'https://ionicframework.com/docs/img/demos/card-media.png',
      mensage: 'gracias por la invitación a jugar.',
    },
    {
      id: 3,
      username: 'petterpan',
      userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
      image: 'https://ionicframework.com/docs/img/demos/card-media.png',
      mensage: 'si quieres jugar, avísame.',
    }
  ];

  posts: any[] = [];

  constructor() {}

  ngOnInit() {
    this.posts = [...this.postsOriginal];
  }

  handleInput(event: any): void {
    const query = event.target.value?.toLowerCase() || '';
    this.posts = this.postsOriginal.filter(post =>
      post.username.toLowerCase().includes(query)
    );
  }
}
