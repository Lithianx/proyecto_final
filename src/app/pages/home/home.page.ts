import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController, ModalController, NavController } from '@ionic/angular';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

import { Usuario } from 'src/app/models/usuario.model';
import { Publicacion } from 'src/app/models/publicacion.model';
import { GuardaPublicacion } from 'src/app/models/guarda-publicacion.model';
import { Like } from 'src/app/models/like.model';
import { Seguir } from 'src/app/models/seguir.model';
import { ToastController } from '@ionic/angular';
import { LocalStorageService } from 'src/app/services/local-storage-social.service';

import { UsuarioService } from 'src/app/services/usuario.service';
import { PublicacionService } from 'src/app/services/publicacion.service';
import { GuardaPublicacionService } from 'src/app/services/guardarpublicacion.service';
import { LikeService } from 'src/app/services/like.service';
import { SeguirService } from 'src/app/services/seguir.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ComunicacionService } from 'src/app/services/comunicacion.service';
import { AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit, OnDestroy {

  usuarioActual: Usuario = {
    id_usuario: '0', // string
    nombre_usuario: 'Usuario Demo',
    correo_electronico: 'demo@correo.com',
    fecha_registro: new Date(),
    contrasena: '',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
    estado_cuenta: true,
    estado_online: true,
    sub_name: '',
    descripcion: '',
    rol: ''
  };

  publicaciones: Publicacion[] = [];
  descripcionExpandida: { [id: string]: boolean } = {}; // string key

  usuarios: Usuario[] = [];

  seguimientos: Seguir[] = [];

  publicacionesLikes: Like[] = [];
  publicacionesGuardadas: GuardaPublicacion[] = [];

  isModalOpen: boolean = false;
  selectedPost: Publicacion | undefined;

  modalCompartirAbierto: boolean = false;
  publicacionCompartir: Publicacion | null = null;

  publicacionesAmigos: Publicacion[] = [];
  followersfriend: Usuario[] = [];

  imagenSeleccionada: string | null = null;

  filtroPublicaciones: 'publico' | 'seguidos' = 'publico';

  constructor(
    private actionSheetCtrl: ActionSheetController,
    private modalController: ModalController,
    private router: Router,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private localStorage: LocalStorageService,
    private likeService: LikeService,
    private seguirService: SeguirService,
    private guardaPublicacionService: GuardaPublicacionService,
    private publicacionService: PublicacionService,
    private usuarioService: UsuarioService,
    private UtilsService: UtilsService,
    private comunicacionService: ComunicacionService,
    private toastController: ToastController,
  ) { }

  async mostrarToast(mensaje: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'top',
      color
    });
    toast.present();
  }

  toggleDescripcion(id: string) {
    this.descripcionExpandida[id] = !this.descripcionExpandida[id];
  }

  async verificarConexion() {
    const online = await this.UtilsService.checkInternetConnection();
    console.log('¿Estoy online?', online);
  }

  private publicacionesSub?: Subscription;
  private likesPublicacionesSub?: Subscription;

async ngOnInit() {
  await this.verificarConexion();
  const usuario = await this.usuarioService.getUsuarioActualConectado();
  if (usuario) {
    this.usuarioActual = usuario;
    await this.localStorage.setItem('usuarioActual', usuario);
  } else {
    return;
  }

  await this.usuarioService.cargarUsuarios();
  this.usuarios = this.usuarioService.getUsuarios();

  const online = await this.UtilsService.checkInternetConnection();

  if (online) {
    // Publicaciones en tiempo real
    this.publicacionesSub = this.publicacionService.publicaciones$.subscribe(async publicaciones => {
      this.publicaciones = publicaciones.map(pub => ({
        ...pub,
        fecha_publicacion: pub.fecha_publicacion instanceof Date
          ? pub.fecha_publicacion
          : (pub.fecha_publicacion && typeof (pub.fecha_publicacion as any).toDate === 'function'
            ? (pub.fecha_publicacion as any).toDate()
            : new Date(pub.fecha_publicacion))
      }));
      this.publicaciones.sort((a, b) => b.fecha_publicacion.getTime() - a.fecha_publicacion.getTime());
      this.publicacionesAmigos = [...this.publicaciones];
      await this.localStorage.setItem('publicaciones', this.publicaciones);
    });
  } else {
    // Cargar publicaciones desde localStorage
    this.publicaciones = await this.localStorage.getList<Publicacion>('publicaciones') || [];
    this.publicaciones.sort((a, b) => b.fecha_publicacion.getTime() - a.fecha_publicacion.getTime());
    this.publicacionesAmigos = [...this.publicaciones];
  }

  // Likes de publicaciones en tiempo real
  this.likesPublicacionesSub = this.likeService.likesPublicaciones$.subscribe(likes => {
    this.publicacionesLikes = likes;
  });

  await this.guardaPublicacionService.cargarGuardados();
  this.publicacionesGuardadas = this.guardaPublicacionService.getGuardados();

  await this.seguirService.cargarSeguimientos();
  this.seguimientos = this.seguirService.getSeguimientos();

  this.followersfriend = this.seguirService.getUsuariosSeguidos(this.usuarios, this.usuarioActual.id_usuario);

  this.publicacionesAmigos = [...this.publicaciones];
}

  ngOnDestroy() {
    this.publicacionesSub?.unsubscribe();
    this.likesPublicacionesSub?.unsubscribe();
  }

  // Método para refrescar la lista de publicaciones
  async doRefresh(event: any) {
    // Refresca solo datos NO observables
    await this.usuarioService.cargarUsuarios();
    this.usuarios = this.usuarioService.getUsuarios();

    await this.guardaPublicacionService.cargarGuardados();
    this.publicacionesGuardadas = this.guardaPublicacionService.getGuardados();

    await this.seguirService.cargarSeguimientos();
    this.seguimientos = this.seguirService.getSeguimientos();
    this.followersfriend = this.seguirService.getUsuariosSeguidos(this.usuarios, this.usuarioActual.id_usuario);

    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  // Dar o quitar like
  async likePublicacion(publicacion: Publicacion) {
    await this.likeService.toggleLike(this.usuarioActual.id_usuario, publicacion.id_publicacion);
  }

  // Métodos síncronos para la vista
  getLikesPublicacion(id_publicacion: string): number {
    return this.publicacionesLikes.filter(l => l.id_publicacion === id_publicacion && l.estado_like).length;
  }

  usuarioLikeoPublicacion(id_publicacion: string): boolean {
    return !!this.publicacionesLikes.find(
      l => l.id_publicacion === id_publicacion &&
        l.id_usuario === this.usuarioActual.id_usuario &&
        l.estado_like
    );
  }


// Guardar o eliminar publicación
async guardar(publicacion: Publicacion) {
  const yaEstaGuardada = this.guardaPublicacionService.estaGuardada(
    this.usuarioActual.id_usuario,
    publicacion.id_publicacion
  );

  if (yaEstaGuardada) {
    // Eliminar completamente de Firebase y del almacenamiento local
    await this.guardaPublicacionService.eliminarGuardado(
      this.usuarioActual.id_usuario,
      publicacion.id_publicacion
    );
  } else {
    // Agregar como nuevo guardado
    await this.guardaPublicacionService.toggleGuardado(
      this.usuarioActual.id_usuario,
      publicacion.id_publicacion
    );
  }

  // Actualizar la lista después de la acción
  this.publicacionesGuardadas = this.guardaPublicacionService.getGuardados();
}
// Verifica si la publicación está guardada por el usuario actual
estaGuardada(publicacion: Publicacion): boolean {
  return this.guardaPublicacionService.estaGuardada(
    this.usuarioActual.id_usuario,
    publicacion.id_publicacion
  );
}

  // Seguir/Dejar de seguir
  async seguir(usuario: Usuario) {
    await this.seguirService.toggleSeguir(this.usuarioActual.id_usuario, usuario.id_usuario);
    this.seguimientos = this.seguirService.getSeguimientos();
    this.followersfriend = this.seguirService.getUsuariosSeguidos(this.usuarios, this.usuarioActual.id_usuario);
  }

  sigueAlAutor(publicacion: Publicacion): boolean {
    // Si el autor es el usuario actual, no mostrar opción de seguir
    if (publicacion.id_usuario === this.usuarioActual.id_usuario) {
      return false;
    }
    return this.seguirService.sigue(this.usuarioActual.id_usuario, publicacion.id_usuario);
  }

  // Filtrado por texto SOLO para los usuarios que sigues
  handleInput(event: any): void {
    const searchTerm = event.target.value?.toLowerCase() || '';
    this.followersfriend = this.seguirService.filtrarUsuariosSeguidos(
      this.usuarios,
      this.usuarioActual.id_usuario,
      searchTerm
    );
  }

  verImagen(publicacion: Publicacion) {
    this.imagenSeleccionada = publicacion.imagen ?? null;
  }

  cerrarVisor() {
    this.imagenSeleccionada = null;
  }

  // Modal de compartir
  enviar(publicacion: Publicacion) {
    this.isModalOpen = true;
    this.selectedPost = publicacion;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  async sendPostToUser(usuario: Usuario) {
    if (this.selectedPost) {
      try {
        const id_conversacion = await this.comunicacionService.obtenerOcrearConversacionPrivada(
          this.usuarioActual.id_usuario,
          usuario.id_usuario
        );
        await this.comunicacionService.enviarPublicacion(
          this.selectedPost,
          id_conversacion,
          this.usuarioActual.id_usuario
        );
        this.mostrarToast('¡Publicación enviada correctamente!');
      } catch (error) {
        this.mostrarToast('No se pudo enviar la publicación.', 'danger');
      }
    }
    this.closeModal();
  }

  opcion(publicacion: any) {
    localStorage.setItem('id_usuario', this.usuarioActual.id_usuario);
    const idUsuarioActual = localStorage.getItem('id_usuario') ?? '';
    const esPropietario = publicacion.id_usuario === idUsuarioActual;
    const botones = esPropietario
      ? [
        {
          text: 'Editar',
          icon: 'pencil-outline',
          handler: () => {
            this.modificar(publicacion);
          },
        },
        {
          text: 'Eliminar publicacion',
          icon: 'alert-circle-outline',
          role: 'destructive',
          handler: () => {
            this.confirmarEliminacion(publicacion);
          },
        },
        {
          text: 'Cancelar',
          icon: 'close-outline',
          role: 'cancel',
          handler: () => { }
        }
      ]
      : [
        {
          text: 'Compartir',
          icon: 'share-outline',
          handler: () => {
            this.compartir(publicacion);
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
          handler: () => { }
        }
      ];

    this.actionSheetCtrl.create({
      header: 'Opciones',
      buttons: botones,
      cssClass: 'custom-action-sheet'
    }).then(actionSheet => {
      actionSheet.present();
    });
  }

  modificar(publicacion: Publicacion) {
    this.router.navigate(['/editar-publicacion', publicacion.id_publicacion]);
  }

  volver() {
    this.navCtrl.back();
  }

  async confirmarEliminacion(publicacion: any) {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar publicación?',
      message: '¿Estás seguro de que deseas eliminar esta publicación?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'alert-button-cancel',
          handler: () => { }
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          cssClass: 'alert-button-delete',
          handler: async () => {
            await this.publicacionService.removePublicacion(publicacion.id_publicacion);
            this.volver();
          }
        }
      ]
    });

    await alert.present();
  }

verPerfil(usuario: Usuario | undefined) {
  if (!usuario) return;
  if (usuario.id_usuario === this.usuarioActual.id_usuario) {
    this.router.navigate(['/perfil']);
  } else {
    this.router.navigate(['/perfil-user', usuario.id_usuario]);
  }
}


  async compartir(publicacion: Publicacion) {
    await this.UtilsService.compartirPublicacion(publicacion);
  }

  comentario(publicacion: Publicacion) {
    this.router.navigate(['/comentario', publicacion.id_publicacion]);
  }

  irAReportar(publicacion: Publicacion) {
    this.router.navigate(['/reportar', publicacion.id_publicacion]);
  }

  // Utilidad para obtener el usuario de una publicación
  getUsuarioPublicacion(id_usuario: string): Usuario | undefined {
    return this.usuarioService.getUsuarioPorId(id_usuario);
  }

  get publicacionesFiltradas(): Publicacion[] {
    return this.publicacionService.getPublicacionesFiltradas(
      this.publicaciones,
      this.seguimientos,
      this.usuarioActual.id_usuario,
      this.filtroPublicaciones
    );
  }

async confirmarDejarDeSeguir(usuario: Usuario) {
  const alert = await this.alertCtrl.create({
    header: '¿Dejar de seguir?',
    message: `¿Estás seguro de que deseas dejar de seguir a ${usuario.nombre_usuario}?`,
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel',
        cssClass: 'alert-button-cancel',
        handler: () => { }
      },
      {
        text: 'Dejar de seguir',
        role: 'destructive',
        cssClass: 'alert-button-delete',
        handler: async () => {
          await this.seguir(usuario);
        }
      }
    ]
  });

  await alert.present();
}

}