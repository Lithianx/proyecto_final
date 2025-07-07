import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, ModalController, NavController } from '@ionic/angular';
import { Usuario } from 'src/app/models/usuario.model';
import { Comentario } from 'src/app/models/comentario.model';
import { Publicacion } from 'src/app/models/publicacion.model';
import { GuardaPublicacion } from 'src/app/models/guarda-publicacion.model';
import { Like } from 'src/app/models/like.model';
import { Seguir } from 'src/app/models/seguir.model';
import { LocalStorageService } from 'src/app/services/local-storage-social.service';
import { ToastController } from '@ionic/angular';
import { UsuarioService } from 'src/app/services/usuario.service';
import { PublicacionService } from 'src/app/services/publicacion.service';
import { GuardaPublicacionService } from 'src/app/services/guardarpublicacion.service';
import { LikeService } from 'src/app/services/like.service';
import { SeguirService } from 'src/app/services/seguir.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ComentarioService } from 'src/app/services/comentario.service';
import { ComunicacionService } from 'src/app/services/comunicacion.service';
import { AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { FiltroPalabraService } from 'src/app/services/filtropalabra.service';
import { Notificacion } from 'src/app/models/notificacion.model';

import { NotificacionesService } from 'src/app/services/notificaciones.service';


@Component({
  selector: 'app-comentario',
  templateUrl: './comentario.page.html',
  styleUrls: ['./comentario.page.scss'],
  standalone: false,
})
export class ComentarioPage implements OnInit, OnDestroy {

  @ViewChild('comentariosContainer', { static: false }) comentariosContainer!: ElementRef;

  postId: string | null = '';
  publicacion!: Publicacion;
  comentarios: Comentario[] = [];
  comentariosOffline: any[] = [];
  comentariosCombinados: any[] = [];
  nuevoComentario = '';

  mostrarDescripcion: boolean = false;

  usuarioActual: Usuario = {
    id_usuario: '999',
    nombre_usuario: 'Usuario no Demo',
    correo_electronico: 'demo@correo.com',
    fecha_registro: new Date(),
    contrasena: '',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
    estado_cuenta: true,
    estado_online: true,
    sub_name: '',
    descripcion: '',
    rol: 'usuario',
  };

  seguimientos: Seguir[] = [];
  likesComentarios: Like[] = [];
  publicacionesGuardadas: GuardaPublicacion[] = [];
  usuarios: Usuario[] = [];
  usuarioPost: Usuario | undefined;
  descripcionExpandida: { [id: string]: boolean } = {};
  publicacionesLikes: Like[] = [];
  usuariosFiltrados: Usuario[] = [];
  isModalOpen: boolean = false;
  selectedPost: Publicacion | undefined;
  followersfriend: Usuario[] = [];
  imagenSeleccionada: string | null = null;

  private likesPublicacionesSub?: Subscription;
  private likesComentariosSub?: Subscription;
  private comentariosSub?: Subscription;

  constructor(
    private notificacionesService: NotificacionesService,
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private actionSheetCtrl: ActionSheetController,
    private modalController: ModalController,
    private router: Router,
    private alertCtrl: AlertController,
    private localStorage: LocalStorageService,
    private likeService: LikeService,
    private seguirService: SeguirService,
    private guardaPublicacionService: GuardaPublicacionService,
    private publicacionService: PublicacionService,
    private usuarioService: UsuarioService,
    private UtilsService: UtilsService,
    private comentarioService: ComentarioService,
    private comunicacionService: ComunicacionService,
    private toastCtrl: ToastController,
    private filtroPalabra: FiltroPalabraService,
    private toastController: ToastController,
  ) { }

  toggleDescripcion(id: string) {
    this.descripcionExpandida[id] = !this.descripcionExpandida[id];
  }

  private async cargarDatos() {
    await this.usuarioService.cargarUsuarios();
    this.usuarios = this.usuarioService.getUsuarios();

    this.postId = this.route.snapshot.paramMap.get('id');
    this.publicacion = await this.publicacionService.getPublicacionById(this.postId!);

    this.usuarioPost = this.usuarioService.getUsuarioPorId(this.publicacion.id_usuario);

    await this.guardaPublicacionService.cargarGuardados();
    this.publicacionesGuardadas = this.guardaPublicacionService.getGuardados();

    await this.seguirService.cargarSeguimientos();
    this.seguimientos = this.seguirService.getSeguimientos();

    this.followersfriend = this.seguirService.getUsuariosSeguidos(this.usuarios, this.usuarioActual.id_usuario);

    setTimeout(() => {
      if (this.comentariosContainer) {
        this.comentariosContainer.nativeElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }

  async ngOnInit() {
    await this.cargarUsuarioYDatos();
    this.suscribirLikesYComentarios();
  }

  async ionViewWillEnter() {
    await this.cargarUsuarioYDatos();
  }

  private async cargarUsuarioYDatos() {
    const usuario = await this.usuarioService.getUsuarioActualConectado();
    if (usuario) {
      this.usuarioActual = usuario;
      await this.localStorage.setItem('usuarioActual', usuario);
    } else {
      return;
    }
    await this.cargarDatos();
  }

  private suscribirLikesYComentarios() {
    this.likesPublicacionesSub = this.likeService.likesPublicaciones$.subscribe(likes => {
      this.publicacionesLikes = likes;
    });

    this.likesComentariosSub = this.likeService.likesComentarios$.subscribe(likes => {
      this.likesComentarios = likes;
    });

    this.UtilsService.checkInternetConnection().then(online => {
      if (online) {
        this.comentariosSub = this.comentarioService.comentarios$.subscribe(async comentariosOnline => {
          this.comentarios = comentariosOnline
            .filter(c => c.id_publicacion === this.publicacion.id_publicacion)
            .map(c => ({
              ...c,
              fecha_comentario: c.fecha_comentario instanceof Date
                ? c.fecha_comentario
                : (c.fecha_comentario && typeof (c.fecha_comentario as any).toDate === 'function'
                  ? (c.fecha_comentario as any).toDate()
                  : new Date(c.fecha_comentario))
            }));

          this.comentariosOffline = (await this.comentarioService.getComentariosOffline()).filter(
            c => c.id_publicacion === this.publicacion.id_publicacion &&
              c.id_usuario === this.usuarioActual.id_usuario
          ) || [];

          this.comentariosCombinados = [
            ...this.comentarios,
            ...this.comentariosOffline
          ].sort((a, b) => b.fecha_comentario.getTime() - a.fecha_comentario.getTime());
        });
      } else {
        // SIN internet: carga los comentarios online guardados en local
        this.comentarioService.getComentariosOnlineLocal().then(comentariosLocal => {
          this.comentarios = comentariosLocal
            .filter(c => c.id_publicacion === this.publicacion.id_publicacion)
            .map(c => ({
              ...c,
              fecha_comentario: c.fecha_comentario instanceof Date
                ? c.fecha_comentario
                : (c.fecha_comentario && typeof (c.fecha_comentario as any).toDate === 'function'
                  ? (c.fecha_comentario as any).toDate()
                  : new Date(c.fecha_comentario))
            }));

          this.comentarioService.getComentariosOffline().then(comentariosOffline => {
            this.comentariosOffline = comentariosOffline.filter(
              c => c.id_publicacion === this.publicacion.id_publicacion &&
                c.id_usuario === this.usuarioActual.id_usuario
            ) || [];

            this.comentariosCombinados = [
              ...this.comentarios,
              ...this.comentariosOffline
            ].sort((a, b) => {
              const fechaA = a.fecha_comentario instanceof Date
                ? a.fecha_comentario
                : (a.fecha_comentario && typeof a.fecha_comentario.toDate === 'function'
                  ? a.fecha_comentario.toDate()
                  : new Date(a.fecha_comentario));
              const fechaB = b.fecha_comentario instanceof Date
                ? b.fecha_comentario
                : (b.fecha_comentario && typeof b.fecha_comentario.toDate === 'function'
                  ? b.fecha_comentario.toDate()
                  : new Date(b.fecha_comentario));
              return fechaB.getTime() - fechaA.getTime();
            });
          });
        });
      }
    });
  }

  ngOnDestroy() {
    this.likesPublicacionesSub?.unsubscribe();
    this.likesComentariosSub?.unsubscribe();
    this.comentariosSub?.unsubscribe();
  }

  async doRefresh(event: any) {
    await this.cargarDatos();
    event.target.complete();
  }

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

  getUsuarioComentario(id_usuario: string): Usuario | undefined {
    return this.usuarioService.getUsuarioPorId(id_usuario);
  }

  async publicarComentario() {
  const mensaje = this.nuevoComentario.trim();
  if (!mensaje) return;

  // Filtro de palabras vetadas
  if (this.filtroPalabra.contienePalabraVetada(mensaje)) {
    const toast = await this.toastCtrl.create({
      message: 'Tu comentario contiene palabras no permitidas.',
      duration: 2500,
      color: 'danger',
      position: 'top'
    });
    toast.present();
    return;
  }

  const nuevo: Comentario = {
    id_comentario: Date.now().toString(),
    id_publicacion: this.publicacion.id_publicacion,
    id_usuario: this.usuarioActual.id_usuario,
    contenido_comentario: mensaje,
    fecha_comentario: new Date(),
  };
  await this.comentarioService.agregarComentario(nuevo);
  this.nuevoComentario = '';

  // Crear notificación para autor de la publicación (solo si no es el mismo usuario)
  if (this.usuarioActual.id_usuario !== this.publicacion.id_usuario) {
    try {
      await this.notificacionesService.crearNotificacion(
        'Comento tu Publicacion ',
        this.usuarioActual.id_usuario,
        this.publicacion.id_usuario,
        this.publicacion.id_publicacion
      );
    } catch (error) {
      console.error('Error al crear notificación de comentario:', error);
    }
  }

  const online = await this.UtilsService.checkInternetConnection();

  await this.toastCtrl.create({
    message: online
      ? '¡Comentario publicado exitosamente!'
      : 'Comentario guardado offline. Se sincronizará cuando tengas conexión.',
    duration: 1000,
    position: 'top',
    color: online ? 'success' : 'warning'
  }).then(toast => toast.present());

  // Recarga solo la offline y la combinada
  this.comentariosOffline = (await this.comentarioService.getComentariosOffline()).filter(
    c => c.id_publicacion === this.publicacion.id_publicacion &&
      c.id_usuario === this.usuarioActual.id_usuario
  ) || [];
  this.comentariosCombinados = [
    ...this.comentarios,
    ...this.comentariosOffline
  ].sort((a, b) => b.fecha_comentario.getTime() - a.fecha_comentario.getTime());
}

  getLikesComentario(id_comentario: string): number {
    return this.likesComentarios.filter(l => l.id_comentario === id_comentario && l.estado_like).length;
  }

  usuarioLikeoComentario(id_comentario: string): boolean {
    return !!this.likesComentarios.find(
      l => l.id_comentario === id_comentario && l.id_usuario === this.usuarioActual.id_usuario && l.estado_like
    );
  }

  async comentariolikes(comentario: Comentario) {
  const idUsuarioActual = this.usuarioActual.id_usuario;
  const idComentario = comentario.id_comentario;
  const idAutorComentario = comentario.id_usuario;

  const yaLikeo = this.likesComentarios.some(
    l => l.id_comentario === idComentario && l.id_usuario === idUsuarioActual && l.estado_like
  );

  try {
    await this.likeService.toggleLikeComentario(idUsuarioActual, idComentario);

    if (!yaLikeo && idUsuarioActual !== idAutorComentario) {
      // Crear notificación de like en comentario
      await this.notificacionesService.crearNotificacion(
        'Le gusto tu comentario',
        idUsuarioActual,
        idAutorComentario,
        comentario.id_publicacion // Puedes pasar id_publicacion o id_comentario, según tu modelo

      );
      
    } else if (yaLikeo && idUsuarioActual !== idAutorComentario) {
      // Eliminar notificación al quitar like
      await this.notificacionesService.eliminarNotificacion(
        'Le gusto tu comentario',
        idUsuarioActual,
        idAutorComentario,
        comentario.id_publicacion

      );
      this.mostrarToast('Has quitado el like al comentario. Notificación eliminada.');
    }
  } catch (error) {
    console.error('Error al manejar like y notificación de comentario:', error);
    this.mostrarToast('Error al procesar like del comentario.', 'danger');
  }
}

  async likePublicacion(publicacion: Publicacion) {
  const idPublicacion = publicacion.id_publicacion;
  const idAutor = publicacion.id_usuario;
  const idUsuarioActual = this.usuarioActual.id_usuario;

  const yaLikeo = this.usuarioLikeoPublicacion(idPublicacion);

  try {
    await this.likeService.toggleLike(idUsuarioActual, idPublicacion);

    if (!yaLikeo && idUsuarioActual !== idAutor) {
      await this.notificacionesService.crearNotificacion(
        'Le gusto tu publicacion',
        idUsuarioActual,
        idAutor,
        idPublicacion
      );
    } else if (yaLikeo && idUsuarioActual !== idAutor) {
      await this.notificacionesService.eliminarNotificacion(
        'Le gusto tu publicacion',
        idUsuarioActual,
        idAutor,
        idPublicacion
      );
    }
  } catch (error) {
    console.error('Error al dar/quitar like o manejar notificación:', error);
    this.mostrarToast('Error al procesar like.', 'danger');
  }
}


  getLikesPublicacion(id_publicacion: string): number {
    return this.publicacionesLikes.filter(l => l.id_publicacion === id_publicacion && l.estado_like).length;
  }

  esComentarioOffline(id_comentario: string): boolean {
    return this.comentariosOffline.some(c => c.id_comentario === id_comentario);
  }

  usuarioLikeoPublicacion(id_publicacion: string): boolean {
    return !!this.publicacionesLikes.find(
      l => l.id_publicacion === id_publicacion &&
        l.id_usuario === this.usuarioActual.id_usuario &&
        l.estado_like
    );
  }

  enviar(publicacion: Publicacion) {
    this.isModalOpen = true;
    this.selectedPost = publicacion;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  async mostrarToast(mensaje: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'top',
      color
    });
    toast.present();
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

  async guardar(publicacion: Publicacion) {
    await this.guardaPublicacionService.toggleGuardado(this.usuarioActual.id_usuario, publicacion.id_publicacion);
    this.publicacionesGuardadas = this.guardaPublicacionService.getGuardados();
  }

  estaGuardada(publicacion: Publicacion): boolean {
    return this.guardaPublicacionService.estaGuardada(this.usuarioActual.id_usuario, publicacion.id_publicacion);
  }

async seguir(usuario: Usuario) {
  const idSeguidor = this.usuarioActual.id_usuario;
  const idSeguido = usuario.id_usuario;

  const yaLoSigue = this.seguirService.sigue(idSeguidor, idSeguido);

  try {
    await this.seguirService.toggleSeguir(idSeguidor, idSeguido);
    this.seguimientos = this.seguirService.getSeguimientos();
    this.followersfriend = this.seguirService.getUsuariosSeguidos(this.usuarios, idSeguidor);

    if (!yaLoSigue && idSeguidor !== idSeguido) {
      await this.notificacionesService.crearNotificacion(
        'Comenzo a seguirte',
        idSeguidor,
        idSeguido
      );
    } else if (yaLoSigue) {
      await this.notificacionesService.eliminarNotificacion(
        'Comenzo a seguirte',
        idSeguidor,
        idSeguido
      );
    }
  } catch (error) {
    console.error('Error al manejar la notificación de seguimiento:', error);
    this.mostrarToast('Error con la notificación de seguimiento.', 'danger');
  }
}


  sigueAlAutor(publicacion: Publicacion): boolean {
    if (publicacion.id_usuario === this.usuarioActual.id_usuario) {
      return false;
    }
    return this.seguirService.sigue(this.usuarioActual.id_usuario, publicacion.id_usuario);
  }

  getUsuarioPublicacion(id_usuario: string): Usuario | undefined {
    return this.usuarioService.getUsuarioPorId(id_usuario);
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

  irAReportar(publicacion: Publicacion) {
    this.router.navigate(['/reportar', publicacion.id_publicacion]);
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