import { Component, OnInit } from '@angular/core';


interface Usuario {
  id: string;
  username: string;
  userAvatar: string;
  estado: boolean; // Indica si el usuario está en línea o no
}



@Component({
  selector: 'app-buscar-persona',
  templateUrl: './buscar-persona.page.html',
  styleUrls: ['./buscar-persona.page.scss'],
  standalone: false
})
export class BuscarPersonaPage implements OnInit {




  // Lista original de chats, tipificada con la interface ChatPrivado
  todosusuarios: Usuario[] = [
    { id: 'u133', username: 'techguru', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: true },
    { id: 'u134', username: 'catlover', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: false },
    { id: 'u135', username: 'bookworm', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: true },
    { id: 'u136', username: 'nightowl', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: false },
    { id: 'u137', username: 'traveler', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: true },
    { id: 'u138', username: 'foodie', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: false },
    { id: 'u139', username: 'photoguy', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: true },
    { id: 'u140', username: 'runner', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: false },
    { id: 'u141', username: 'gamerchick', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: true },
    { id: 'u142', username: 'coder123', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: false },
    { id: 'u143', username: 'musician', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: true },
    { id: 'u144', username: 'hiker', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: true },
    { id: 'u145', username: 'artist', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: false },
    { id: 'u146', username: 'dancer', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: true },
    { id: 'u147', username: 'chefmaster', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: false },
    { id: 'u148', username: 'bookreader', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: true },
    { id: 'u149', username: 'fitnessfan', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: false },
    { id: 'u150', username: 'gadgetlover', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: true },
    { id: 'u151', username: 'swimmer', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: false },
    { id: 'u152', username: 'yogagirl', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: true },
    { id: 'u153', username: 'skater', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: false },
    { id: 'u154', username: 'traveller', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: true },
    { id: 'u155', username: 'moviebuff', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: false },
    { id: 'u156', username: 'catmom', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: true },
    { id: 'u157', username: 'dogdad', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: false },
    { id: 'u158', username: 'pianoplayer', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: true },
    { id: 'u159', username: 'gardener', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: false },
    { id: 'u160', username: 'techlover', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: true },
    { id: 'u161', username: 'biker', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: false },
    { id: 'u162', username: 'painter', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: true },
    { id: 'u163', username: 'traveller', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: true },
    { id: 'u164', username: 'foodlover', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: false },
    { id: 'u165', username: 'runnergirl', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: true },
    { id: 'u166', username: 'drummer', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: false },
    { id: 'u167', username: 'coderboy', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: true },
    { id: 'u168', username: 'skatergirl', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: false },
    { id: 'u169', username: 'filmfan', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: true },
    { id: 'u170', username: 'writer', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: false },
    { id: 'u171', username: 'photogirl', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: true },
    { id: 'u172', username: 'travelerboy', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: false },
    { id: 'u173', username: 'musicfan', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: true },
    { id: 'u174', username: 'yogaman', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: false },
    { id: 'u175', username: 'gamerboy', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: true },
    { id: 'u176', username: 'bookgirl', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: false },
    { id: 'u177', username: 'chef', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: true },
    { id: 'u178', username: 'artistgirl', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado: false },

  ];

  usuarios: Usuario[] = [];
  busquedaActiva: boolean = false;



  constructor() { }

  ngOnInit() {

  }


  // Filtrado de la lista de chats por el nombre del participante
  handleInput(event: any): void {
    const query = event.target.value?.toLowerCase().trim();

    this.busquedaActiva = !!query; // true si hay texto, false si está vacío

    if (!query) {
      this.usuarios = [];
      return;
    }

    this.usuarios = this.todosusuarios.filter(usuario =>
      usuario.username.toLowerCase().includes(query)
    );
  }

}
