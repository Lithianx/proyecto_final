import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActionSheetController, AlertController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { UsuarioService } from 'src/app/services/usuario.service';
import { PublicacionService } from 'src/app/services/publicacion.service';
import { LikeService } from 'src/app/services/like.service';
import { SeguirService } from 'src/app/services/seguir.service';
import { Usuario } from 'src/app/models/usuario.model';
import { Publicacion } from 'src/app/models/publicacion.model';
import { LocalStorageService } from '../../services/local-storage-social.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
    standalone: false,
})
export class PerfilPage implements OnInit {
  @ViewChild('publicacionesNav', { read: ElementRef }) publicacionesNav!: ElementRef;

  publicaciones: Publicacion[] = [];
  publicacionesFiltradas: Publicacion[] = [];

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

  fotoPerfil: string = 'https://ionicframework.com/docs/img/demos/avatar.svg';
  nombreUsuario: string = 'nombre_de_usuario';
  descripcionBio: string = 'No hay descripcion';
  subname: string = '';

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
    private localStorageService: LocalStorageService,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController,
    private router: Router,
    private navCtrl: NavController,
    private usuarioService: UsuarioService,
    private publicacionService: PublicacionService,
    private likeService: LikeService,
    private seguirService: SeguirService
  ) {}

  async ionViewWillEnter() {
    await this.cargarDatosUsuario();
    await this.cargarUsuarios();
    await this.cargarCantidadSeguidosYSeguidores();
    await this.cargarPublicaciones();
    this.segmentChanged({ detail: { value: this.vistaSeleccionada } });
  }

  ngOnInit() {}

  private async cargarDatosUsuario() {
    const id_usuario: string | null = await this.localStorageService.getItem('id_usuario');
    if (!id_usuario) {
      console.warn('No hay id_usuario en localStorage');
      return;
    }

    try {
      const usuario = await this.usuarioService.getUsuarioPorId(id_usuario);
      if (usuario) {
        this.usuarioActual = usuario;
        this.fotoPerfil = usuario.avatar || this.fotoPerfil;
        this.nombreUsuario = usuario.nombre_usuario || this.nombreUsuario;
        this.descripcionBio = usuario.descripcion || this.descripcionBio;
        this.subname = usuario.sub_name || this.subname;
      }
    } catch (error) {
      console.error('Error al cargar el usuario:', error);
    }
  }

  private async cargarUsuarios() {
    try {
      this.usuarios = await this.usuarioService.getUsuarios();
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  }

  private async cargarCantidadSeguidosYSeguidores() {
    const id = this.usuarioActual.id_usuario;
    if (!id) {
      this.estadisticas.seguidos = 0;
      this.estadisticas.seguidores = 0;
      return;
    }

    try {
      const seguidos = this.seguirService.getUsuariosSeguidos(this.usuarios, id);
      const seguidores = this.seguirService.getSeguidores(this.usuarios, id);
      this.estadisticas.seguidos = seguidos.length;
      this.estadisticas.seguidores = seguidores.length;
    } catch (error) {
      console.error('Error al obtener seguidos/seguidores:', error);
    }
  }

  private async cargarPublicaciones() {
    const id = this.usuarioActual.id_usuario;
    if (!id) return;

    try {
      const todasPublicaciones = await this.publicacionService.getPublicaciones();
      this.publicaciones = todasPublicaciones.filter(p => p.id_usuario === id);
      this.publicacionesFiltradas = [...this.publicaciones];
      this.estadisticas.publicaciones = this.publicaciones.length;
    } catch (error) {
      console.error('Error al cargar publicaciones:', error);
    }
  }

  getUsuarioPublicacion(id_usuario: string): Usuario | undefined {
    return this.usuarios.find(u => u.id_usuario === id_usuario);
  }

  async opcion(publicacion: Publicacion) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Opciones de publicación',
      buttons: [
        {
          text: 'Editar',
          cssClass: 'icono-verde',
          icon: 'pencil-outline',
          handler: () => this.modificar(publicacion)
        },
        {
          text: 'Eliminar publicación',
          icon: 'alert-circle-outline',
          cssClass: 'icono-verde',
          role: 'destructive',
          handler: () => this.confirmarEliminacion(publicacion)
        },
        {
          text: 'Cancelar',
          icon: 'close-outline',
          cssClass: 'icono-verde',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async confirmarEliminacion(publicacion: Publicacion) {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar publicación?',
      message: '¿Estás seguro de que deseas eliminar esta publicación?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'alert-button-cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          cssClass: 'alert-button-delete',
          handler: async () => {
            await this.publicacionService.removePublicacion(publicacion.id_publicacion);
            await this.cargarPublicaciones();
          }
        }
      ]
    });
    await alert.present();
  }

  volver() {
    this.navCtrl.back();
  }

  modificar(publicacion: Publicacion) {
    this.router.navigate(['/editar-publicacion', publicacion.id_publicacion]);
  }

  comentario(publicacion: Publicacion) {
    this.router.navigate(['/comentario', publicacion.id_publicacion]);
  }

  verImagen(publicacion: Publicacion) {
    this.router.navigate(['/comentario', publicacion.id_publicacion]);
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
    if (!segmentElement) return;

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
          text: 'Editar perfil',
          icon: 'person-outline',
          cssClass: 'icono-verde',
          handler: () => this.router.navigate(['/editar-perfil'])
        },
        {
          text: 'Historial de eventos',
          icon: 'time-outline',
          cssClass: 'icono-verde',
          handler: () => this.router.navigate(['/historial-eventos'])
        },
        {
          text: 'Guardados',
          icon: 'bookmark',
          cssClass: 'icono-verde',
          handler: () => this.router.navigate(['/publicaciones-guardadas'])
        },
        {
          text: 'Términos y condiciones',
          icon: 'school-outline',
          cssClass: 'icono-verde',
          handler: () => this.router.navigate(['/info-cuenta-institucional'])
        },
        {
          text: 'Cerrar sesión',
          icon: 'log-out-outline',
          role: 'destructive',
          cssClass: 'cerrar-sesion-btn',
          handler: async () => {
            await this.usuarioService.logout();
            this.router.navigate(['/login']);
          }
        }
      ]
    });
    await actionSheet.present();
  }
}
