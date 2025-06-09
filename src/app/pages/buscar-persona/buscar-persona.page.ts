import { Component, OnInit } from '@angular/core';

import { Usuario } from 'src/app/models/usuario.model';
import { UsuarioService } from 'src/app/services/usuario.service';
import { LocalStorageService } from 'src/app/services/local-storage-social.service';

@Component({
  selector: 'app-buscar-persona',
  templateUrl: './buscar-persona.page.html',
  styleUrls: ['./buscar-persona.page.scss'],
  standalone: false
})
export class BuscarPersonaPage implements OnInit {

<<<<<<< HEAD



  // Lista original de chats, tipificada con la interface ChatPrivado
  todosusuarios: Usuario[] = [
  {
    id_usuario: 1,
    nombre_usuario: 'techguru',
    correo_electronico: 'techguru@correo.com',
    fecha_registro: new Date('2024-01-01'),
    contrasena: '',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
    estado_cuenta: true,
    estado_online: true
  },
  {
    id_usuario: 134,
    nombre_usuario: 'catlover',
    correo_electronico: 'catlover@correo.com',
    fecha_registro: new Date('2024-01-01'),
    contrasena: '',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
    estado_cuenta: false,
    estado_online: true
  },
  {
    id_usuario: 135,
    nombre_usuario: 'bookworm',
    correo_electronico: 'bookworm@correo.com',
    fecha_registro: new Date('2024-01-01'),
    contrasena: '',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
    estado_cuenta: true,
    estado_online: true
  },
  {
    id_usuario: 136,
    nombre_usuario: 'nightowl',
    correo_electronico: 'nightowl@correo.com',
    fecha_registro: new Date('2024-01-01'),
    contrasena: '',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
    estado_cuenta: false,
    estado_online: true
  },
  {
    id_usuario: 137,
    nombre_usuario: 'traveler',
    correo_electronico: 'traveler@correo.com',
    fecha_registro: new Date('2024-01-01'),
    contrasena: '',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
    estado_cuenta: true,
    estado_online: true
  },
  {
    id_usuario: 138,
    nombre_usuario: 'foodie',
    correo_electronico: 'foodie@correo.com',
    fecha_registro: new Date('2024-01-01'),
    contrasena: '',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
    estado_cuenta: false,
    estado_online: true
  },
  {
    id_usuario: 139,
    nombre_usuario: 'photoguy',
    correo_electronico: 'photoguy@correo.com',
    fecha_registro: new Date('2024-01-01'),
    contrasena: '',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
    estado_cuenta: true,
    estado_online: true
  },
  {
    id_usuario: 140,
    nombre_usuario: 'runner',
    correo_electronico: 'runner@correo.com',
    fecha_registro: new Date('2024-01-01'),
    contrasena: '',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
    estado_cuenta: false,
    estado_online: true
  },
  {
    id_usuario: 141,
    nombre_usuario: 'gamerchick',
    correo_electronico: 'gamerchick@correo.com',
    fecha_registro: new Date('2024-01-01'),
    contrasena: '',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
    estado_cuenta: true,
    estado_online: true
  },
  {
    id_usuario: 142,
    nombre_usuario: 'coder123',
    correo_electronico: 'coder123@correo.com',
    fecha_registro: new Date('2024-01-01'),
    contrasena: '',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
    estado_cuenta: false,
    estado_online: true
  },
  {
    id_usuario: 143,
    nombre_usuario: 'musician',
    correo_electronico: 'musician@correo.com',
    fecha_registro: new Date('2024-01-01'),
    contrasena: '',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
    estado_cuenta: true,
    estado_online: true
  },
  {
    id_usuario: 144,
    nombre_usuario: 'hiker',
    correo_electronico: 'hiker@correo.com',
    fecha_registro: new Date('2024-01-01'),
    contrasena: '',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
    estado_cuenta: true,
    estado_online: true
  },
  {
    id_usuario: 145,
    nombre_usuario: 'artist',
    correo_electronico: 'artist@correo.com',
    fecha_registro: new Date('2024-01-01'),
    contrasena: '',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
    estado_cuenta: false,
    estado_online: true
  },
  {
    id_usuario: 146,
    nombre_usuario: 'dancer',
    correo_electronico: 'dancer@correo.com',
    fecha_registro: new Date('2024-01-01'),
    contrasena: '',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
    estado_cuenta: true,
    estado_online: true
  },
  {
    id_usuario: 147,
    nombre_usuario: 'chefmaster',
    correo_electronico: 'chefmaster@correo.com',
    fecha_registro: new Date('2024-01-01'),
    contrasena: '',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
    estado_cuenta: false,
    estado_online: true
  },
  {
    id_usuario: 148,
    nombre_usuario: 'bookreader',
    correo_electronico: 'bookreader@correo.com',
    fecha_registro: new Date('2024-01-01'),
    contrasena: '',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
    estado_cuenta: true,
    estado_online: true
  },
  {
    id_usuario: 149,
    nombre_usuario: 'fitnessfan',
    correo_electronico: 'fitnessfan@correo.com',
    fecha_registro: new Date('2024-01-01'),
    contrasena: '',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
    estado_cuenta: false,
    estado_online: true
  },
  {
    id_usuario: 150,
    nombre_usuario: 'gadgetlover',
    correo_electronico: 'gadgetlover@correo.com',
    fecha_registro: new Date('2024-01-01'),
    contrasena: '',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
    estado_cuenta: true,
    estado_online: true
  },
  {
    id_usuario: 151,
    nombre_usuario: 'swimmer',
    correo_electronico: 'swimmer@correo.com',
    fecha_registro: new Date('2024-01-01'),
    contrasena: '',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
    estado_cuenta: false,
    estado_online: true
  },
  {
    id_usuario: 152,
    nombre_usuario: 'yogagirl',
    correo_electronico: 'yogagirl@correo.com',
    fecha_registro: new Date('2024-01-01'),
    contrasena: '',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
    estado_cuenta: true,
    estado_online: true
  }
]
;

=======
  todosusuarios: Usuario[] = [];
>>>>>>> PruebaFelipe
  usuarios: Usuario[] = [];
  busquedaActiva: boolean = false;

  constructor(
    private localStorage: LocalStorageService,
    private usuarioService: UsuarioService
  ) { }

  async ngOnInit() {
    this.todosusuarios = await this.usuarioService.getUsuarios();
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
      usuario.nombre_usuario.toLowerCase().includes(query)
    );
  }

}
