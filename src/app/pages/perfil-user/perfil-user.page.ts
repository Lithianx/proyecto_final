import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Usuario } from 'src/app/models/usuario.model';

@Component({
  selector: 'app-perfil-user',
  templateUrl: './perfil-user.page.html',
  styleUrls: ['./perfil-user.page.scss'],
  standalone: false,
})
export class PerfilUserPage implements OnInit {
  @ViewChild('publicacionesNav', { read: ElementRef }) publicacionesNav!: ElementRef;

  usuarios: Usuario[] = [];

  usuarioActual: Usuario = {
    id_usuario: '0',
    nombre_usuario: 'Usuario Demo',
    correo_electronico: 'demo@correo.com',
    fecha_registro: new Date(),
    contrasena: '',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
    estado_cuenta: true,
    estado_online: true,
    sub_name: '',
    descripcion: ''
  };

  siguiendo: boolean = false;
  idUsuario: string = '';  // Será asignado desde la ruta

  fotoPerfil: string = 'https://ionicframework.com/docs/img/demos/avatar.svg';
  nombreUsuario: string = 'nombre_de_usuario';
  descripcionBio: string = `No hay descripcion`;
  subname: string = ``;

  publicaciones = [
    { id: 1, img: 'https://raw.githubusercontent.com/R-CoderDotCom/samples/main/bird.png', alt: 'Publicación 1', link: '/detalles-publicacion-personal' },
    { id: 2, img: 'https://ionicframework.com/docs/img/demos/card-media.png', alt: 'Publicación 2', link: '/detalles-publicacion-personal' },
    { id: 3, img: 'https://raw.githubusercontent.com/R-CoderDotCom/samples/main/bird.png', alt: 'Publicación 3', link: '/detalles-publicacion-personal' },
    { id: 4, img: 'https://ionicframework.com/docs/img/demos/card-media.png', alt: 'Publicación 4', link: '/detalles-publicacion-personal' },
    { id: 5, img: 'https://raw.githubusercontent.com/R-CoderDotCom/samples/main/bird.png', alt: 'Publicación 5', link: '/detalles-publicacion-personal' },
    { id: 6, img: 'https://ionicframework.com/docs/img/demos/card-media.png', alt: 'Publicación 6', link: '/detalles-publicacion-personal' },
  ];

  estadisticas = {
    publicaciones: this.publicaciones.length,
    seguidores: 300,
    seguidos: 180
  };

  eventosinscritos = [
    { id: 1, nombre: 'Campeonato de LoL', fecha: '12/05/2025', juego: 'League of Legends', creador: 'usuario1' },
    { id: 2, nombre: 'Torneo Valorant', fecha: '19/05/2025', juego: 'Valorant', creador: 'usuario2' },
  ];

  eventosCreados = [
    { id: 1, nombre: 'Campeonato de LoL', fecha: '12/05/2025', juego: 'League of Legends' },
    { id: 2, nombre: 'Torneo Valorant', fecha: '19/05/2025', juego: 'Valorant' }
  ];

  private _vistaSeleccionada: string = 'publicaciones';

  get vistaSeleccionada(): string {
    return this._vistaSeleccionada;
  }

  set vistaSeleccionada(value: string) {
    this._vistaSeleccionada = value;
    if (value !== 'publicaciones') {
      this.mostrarModal = false;
    }
  }

  mostrarModal: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private actionSheetCtrl: ActionSheetController,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit() {
    // Obtiene el id_usuario desde la ruta y carga el perfil
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.idUsuario = id;
        this.cargarDatosUsuario(id);
      } else {
        console.warn('No se recibió id_usuario en la ruta');
      }
    });
  }

  // Mejor usar ionViewWillEnter para refrescar cada vez que se entra a la página
  async ionViewWillEnter() {
    if (this.idUsuario) {
      await this.cargarDatosUsuario(this.idUsuario);
    }
    this.segmentChanged({ detail: { value: this.vistaSeleccionada } });
  }

  private async cargarDatosUsuario(id_usuario: string) {
    try {
      const usuario = await this.usuarioService.getUsuarioPorId(id_usuario);
      if (usuario) {
        this.usuarioActual = usuario;
        this.fotoPerfil = usuario.avatar || this.fotoPerfil;
        this.nombreUsuario = usuario.nombre_usuario || this.nombreUsuario;
        this.descripcionBio = usuario.descripcion || this.descripcionBio;
        this.subname = usuario.sub_name || this.subname;
      } else {
        console.warn('Usuario no encontrado para id:', id_usuario);
      }
    } catch (error) {
      console.error('Error al cargar el usuario:', error);
    }
  }

  ionViewDidEnter() {
    this.applySliderTransform(this.vistaSeleccionada);
  }

  segmentChanged(event: any) {
    const value = event.detail.value;
    this.vistaSeleccionada = value;
    this.applySliderTransform(value);
  }

  applySliderTransform(value: string) {
    const segmentElement = this.publicacionesNav?.nativeElement as HTMLElement;
    if (!segmentElement) {
      console.warn('Elemento publicacionesNav no encontrado');
      return;
    }

    let position = 0;

    switch (value) {
      case 'publicaciones':
        position = 3;
        break;
      case 'eventos-inscritos':
        position = 320 / 3; // ~33.33%
        break;
      case 'eventos-creados':
        position = (315 / 3) * 2; // ~66.66%
        break;
    }

    segmentElement.style.setProperty('--slider-transform', `translateX(${position}%)`);
  }

  async abrirOpciones() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Opciones',
      buttons: [
        {
          text: this.siguiendo ? 'Dejar de seguir' : 'Seguir',
          icon: this.siguiendo ? 'person-remove-outline' : 'person-add-outline',
          handler: () => {
            this.siguiendo = !this.siguiendo;
            console.log(this.siguiendo ? 'Ahora estás siguiendo' : 'Has dejado de seguir');
          }
        },
        {
          text: 'Mandar mensaje',
          icon: 'chatbubble-ellipses-outline',
          handler: () => {
            console.log('Mandar mensaje a ID:', this.idUsuario);
            this.router.navigate(['/chat-privado', this.idUsuario]);
          }
        },
        {
          text: 'Reportar',
          role: 'destructive',
          icon: 'alert-circle-outline',
          handler: () => {
            console.log('Reportar usuario');
            this.router.navigate(['/reportar-cuenta', this.idUsuario]);
          }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  comentario(publicacion: any) {
    this.router.navigate(['/comentario', publicacion.id]);
  }
}
