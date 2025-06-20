import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Usuario } from 'src/app/models/usuario.model';
import { PublicacionService } from 'src/app/services/publicacion.service';
import { Publicacion } from 'src/app/models/publicacion.model';
import { UtilsService } from 'src/app/services/utils.service';
import { SeguirService } from 'src/app/services/seguir.service';

@Component({
  selector: 'app-perfil-user',
  templateUrl: './perfil-user.page.html',
  styleUrls: ['./perfil-user.page.scss'],
  standalone: false,
})
export class PerfilUserPage implements OnInit {
  @ViewChild('publicacionesNav', { read: ElementRef }) publicacionesNav!: ElementRef;

  publicaciones: Publicacion[] = [];
  publicacionesFiltradas: Publicacion[] = [];

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
  idUsuario: string = '';  // Usuario del perfil visto
  idUsuarioLogueado: string = ''; // Usuario que está viendo el perfil

  fotoPerfil: string = 'https://ionicframework.com/docs/img/demos/avatar.svg';
  nombreUsuario: string = 'nombre_de_usuario';
  descripcionBio: string = `No hay descripcion`;
  subname: string = ``;

  estadisticas = {
    publicaciones: 0,
    seguidores: 0,
    seguidos: 0
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
    private usuarioService: UsuarioService,
    private publicacionService: PublicacionService,
    private utilsService: UtilsService,
    private seguirService: SeguirService
  ) {}

  ngOnInit() {
    // Escuchar cambios en el parámetro 'id' para actualizar datos dinámicamente
    this.route.paramMap.subscribe(async params => {
      const id = params.get('id');
      if (id) {
        this.idUsuario = id;
        this.idUsuarioLogueado = localStorage.getItem('id_usuario') || '';

        await this.seguirService.cargarSeguimientos();
        await this.cargarDatosUsuario(id);
        await this.cargarPublicaciones(id);

        this.actualizarEstadoSeguir();
        this.actualizarEstadisticasSeguir(id);
      }
    });
  }

  async ionViewWillEnter() {
    // Actualiza la vista cada vez que la página entra en pantalla
    if (this.idUsuario) {
      await this.seguirService.cargarSeguimientos();
      await this.cargarDatosUsuario(this.idUsuario);
      await this.cargarPublicaciones(this.idUsuario);
      this.actualizarEstadoSeguir();
      this.actualizarEstadisticasSeguir(this.idUsuario);
    }

    this.segmentChanged({ detail: { value: this.vistaSeleccionada } });
  }

  private actualizarEstadoSeguir() {
    if (!this.idUsuarioLogueado || !this.idUsuario) {
      this.siguiendo = false;
      return;
    }
    this.siguiendo = this.seguirService.sigue(this.idUsuarioLogueado, this.idUsuario);
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

  async cargarPublicaciones(id_usuario: string) {
    try {
      const todasPublicaciones = await this.publicacionService.getPublicaciones();
      this.publicaciones = todasPublicaciones.filter(p => p.id_usuario === id_usuario);
      this.publicacionesFiltradas = [...this.publicaciones];
      this.estadisticas.publicaciones = this.publicaciones.length;
    } catch (error) {
      console.error('Error cargando publicaciones:', error);
    }
  }

private actualizarEstadisticasSeguir(id_usuario: string) {
  const seguimientos = this.seguirService.getSeguimientos() || [];

  const seguidores = seguimientos.filter(
    s => s.id_usuario_seguido === id_usuario && s.estado_seguimiento === true
  ).length;

  const seguidos = seguimientos.filter(
    s => s.id_usuario_seguidor === id_usuario && s.estado_seguimiento === true
  ).length;

  this.estadisticas.seguidores = seguidores;
  this.estadisticas.seguidos = seguidos;
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
        position = 320 / 3;
        break;
      case 'eventos-creados':
        position = (315 / 3) * 2;
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
          handler: async () => {
            await this.seguirService.toggleSeguir(this.idUsuarioLogueado, this.idUsuario);
            this.siguiendo = !this.siguiendo;
            this.actualizarEstadisticasSeguir(this.idUsuario);
          }
        },
        {
          text: 'Mandar mensaje',
          icon: 'chatbubble-ellipses-outline',
          handler: () => {
            this.router.navigate(['/chat-privado', this.idUsuario]);
          }
        },
        {
          text: 'Reportar',
          role: 'destructive',
          icon: 'alert-circle-outline',
          handler: () => {
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

  async opcion(publicacion: Publicacion) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Opciones',
      buttons: [
        {
          text: 'Compartir',
          icon: 'share-outline',
          handler: async () => {
            await this.compartir(publicacion);
          },
        },
        {
          text: 'Reportar',
          icon: 'alert-circle-outline',
          role: 'destructive',
          handler: () => {
            this.irAReportar(publicacion);
          },
        },
        {
          text: 'Cancelar',
          icon: 'close-outline',
          role: 'cancel',
        },
      ],
      cssClass: 'custom-action-sheet'
    });

    await actionSheet.present();
  }

  async compartir(publicacion: Publicacion) {
    await this.utilsService.compartirPublicacion(publicacion);
  }

  comentario(publicacion: Publicacion) {
    this.router.navigate(['/comentario', publicacion.id_publicacion]);
  }

  irAReportar(publicacion: Publicacion) {
    this.router.navigate(['/reportar-post', publicacion.id_publicacion]);
  }
}
