import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, ModalController, NavController } from '@ionic/angular';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

import { Usuario } from 'src/app/models/usuario.model';
import { Comentario } from 'src/app/models/comentario.model';
import { Publicacion } from 'src/app/models/publicacion.model';
import { GuardaPublicacion } from 'src/app/models/guarda-publicacion.model';
import { Like } from 'src/app/models/like.model';
import { Seguir } from 'src/app/models/seguir.model';

import { LocalStorageService } from 'src/app/services/local-storage-social.service';

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

@Component({
  selector: 'app-comentario',
  templateUrl: './comentario.page.html',
  styleUrls: ['./comentario.page.scss'],
  standalone: false,
})
export class ComentarioPage implements OnInit, OnDestroy  {

  @ViewChild('comentariosContainer', { static: false }) comentariosContainer!: ElementRef;

  postId: string | null = '';
  publicacion!: Publicacion;
  comentarios: Comentario[] = [];
  nuevoComentario = '';

  mostrarDescripcion: boolean = false;

  // Simulación del usuario actual (en producción esto viene de un servicio de autenticación)
  usuarioActual: Usuario = {
    id_usuario: '999', // string
    nombre_usuario: 'Usuario no Demo',
    correo_electronico: 'demo@correo.com',
    fecha_registro: new Date(),
    contrasena: '',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
    estado_cuenta: true,
    estado_online: true,
    sub_name: '',
    descripcion: ''
  };

  seguimientos: Seguir[] = [];

  likesComentarios: Like[] = [];

  publicacionesGuardadas: GuardaPublicacion[] = [];
  usuarios: Usuario[] = [];
  usuarioPost: Usuario | undefined;

  descripcionExpandida: { [id: string]: boolean } = {}; // string key
  publicacionesLikes: Like[] = [];

  usuariosFiltrados: Usuario[] = [];

  isModalOpen: boolean = false;
  selectedPost: Publicacion | undefined;

  followersfriend: Usuario[] = [];
  imagenSeleccionada: string | null = null;

  constructor(
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
  ) { }

  toggleDescripcion(id: string) {
    this.descripcionExpandida[id] = !this.descripcionExpandida[id];
  }

  private async cargarDatos() {
    // Usuarios
    await this.usuarioService.cargarUsuarios();
    this.usuarios = this.usuarioService.getUsuarios();

    // Obtener el ID de la publicación
    this.postId = this.route.snapshot.paramMap.get('id');
    this.publicacion = await this.publicacionService.getPublicacionById(this.postId!);

    this.usuarioPost = this.usuarioService.getUsuarioPorId(this.publicacion.id_usuario);

    // Guardados
    await this.guardaPublicacionService.cargarGuardados();
    this.publicacionesGuardadas = this.guardaPublicacionService.getGuardados();

    // Seguimientos
    await this.seguirService.cargarSeguimientos();
    this.seguimientos = this.seguirService.getSeguimientos();

    // Carga publicaciones de amigos
    this.followersfriend = this.seguirService.getUsuariosSeguidos(this.usuarios, this.usuarioActual.id_usuario);

    // Desplazar hacia la sección de comentarios después de cargar la página
    setTimeout(() => {
      if (this.comentariosContainer) {
        this.comentariosContainer.nativeElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }

  private likesPublicacionesSub?: Subscription;
  private likesComentariosSub?: Subscription;
  private comentariosSub?: Subscription;


  async ngOnInit() {

    // Cargar usuario actual
    const usuario = await this.usuarioService.getUsuarioActualConectado();
    if (usuario) {
      this.usuarioActual = usuario;
      await this.localStorage.setItem('usuarioActual', usuario);
    } else {
      // Si no hay usuario, podrías redirigir al login
      return;
    }

    await this.cargarDatos();

    this.likesPublicacionesSub = this.likeService.likesPublicaciones$.subscribe(likes => {
      this.publicacionesLikes = likes;
    });

    this.likesComentariosSub = this.likeService.likesComentarios$.subscribe(likes => {
      this.likesComentarios = likes;
    });

    this.comentariosSub = this.comentarioService.comentarios$.subscribe(comentarios => {
      this.comentarios = comentarios
        .filter(c => c.id_publicacion === this.publicacion.id_publicacion)
        .map(c => ({
          ...c,
          fecha_comentario: c.fecha_comentario instanceof Date
            ? c.fecha_comentario
            : (c.fecha_comentario && typeof (c.fecha_comentario as any).toDate === 'function'
              ? (c.fecha_comentario as any).toDate()
              : new Date(c.fecha_comentario))
        }))
        .sort((a, b) => b.fecha_comentario.getTime() - a.fecha_comentario.getTime());
    });
  }

  ngOnDestroy() {
    this.likesPublicacionesSub?.unsubscribe();
    this.likesComentariosSub?.unsubscribe();
    this.comentariosSub?.unsubscribe();
  }


  // Método para refrescar la lista de comentarios
  async doRefresh(event: any) {
    await this.cargarDatos();
    event.target.complete();
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

  getUsuarioComentario(id_usuario: string): Usuario | undefined {
    return this.usuarioService.getUsuarioPorId(id_usuario);
  }

  async publicarComentario() {
    const mensaje = this.nuevoComentario.trim();
    if (mensaje) {
      const nuevo: Comentario = {
        id_comentario: Date.now().toString(),
        id_publicacion: this.publicacion.id_publicacion,
        id_usuario: this.usuarioActual.id_usuario,
        contenido_comentario: mensaje,
        fecha_comentario: new Date(),
      };
      await this.comentarioService.agregarComentario(nuevo);
      this.nuevoComentario = '';
      // No actualices this.comentarios manualmente
    }
  }

  getLikesComentario(id_comentario: string): number {
    return this.likesComentarios.filter(l => l.id_comentario === id_comentario && l.estado_like).length;
  }

  usuarioLikeoComentario(id_comentario: string): boolean {
    return !!this.likesComentarios.find(
      l => l.id_comentario === id_comentario && l.id_usuario === this.usuarioActual.id_usuario && l.estado_like
    );
  }

  // Dar o quitar like a un comentario
  async comentariolikes(comentario: Comentario) {
    console.log('Like pulsado', comentario);
    await this.likeService.toggleLikeComentario(this.usuarioActual.id_usuario, comentario.id_comentario);
  }

  // Dar o quitar like a una publicación
  async likePublicacion(publicacion: Publicacion) {
    await this.likeService.toggleLike(this.usuarioActual.id_usuario, publicacion.id_publicacion);
    // No recargues likes manualmente, el observable lo hace
  }

  // Likes de publicaciones en tiempo real
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

  enviar(publicacion: Publicacion) {
    this.isModalOpen = true;
    this.selectedPost = publicacion;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  async sendPostToUser(usuario: Usuario) {
    if (this.selectedPost) {
      // Debes obtener o crear la conversación privada entre los dos usuarios
      const id_conversacion = await this.comunicacionService.obtenerOcrearConversacionPrivada(
        this.usuarioActual.id_usuario,
        usuario.id_usuario
      );
      await this.comunicacionService.enviarPublicacion(
        this.selectedPost,
        id_conversacion,
        this.usuarioActual.id_usuario
      );
    }
    this.closeModal();
  }

  // Guardar publicación
  async guardar(publicacion: Publicacion) {
    await this.guardaPublicacionService.toggleGuardado(this.usuarioActual.id_usuario, publicacion.id_publicacion);
    this.publicacionesGuardadas = this.guardaPublicacionService.getGuardados();
  }

  estaGuardada(publicacion: Publicacion): boolean {
    return this.guardaPublicacionService.estaGuardada(this.usuarioActual.id_usuario, publicacion.id_publicacion);
  }

  // Seguir/Dejar de seguir
  async seguir(usuario: Usuario) {
    await this.seguirService.toggleSeguir(this.usuarioActual.id_usuario, usuario.id_usuario);
    this.seguimientos = this.seguirService.getSeguimientos();
    // Actualizar lista de seguidos
    this.followersfriend = this.seguirService.getUsuariosSeguidos(this.usuarios, this.usuarioActual.id_usuario);
  }

  sigueAlAutor(publicacion: Publicacion): boolean {
    // Si el autor es el usuario actual, no mostrar opción de seguir
    if (publicacion.id_usuario === this.usuarioActual.id_usuario) {
      return false;
    }
    return this.seguirService.sigue(this.usuarioActual.id_usuario, publicacion.id_usuario);
  }

  // Utilidad para obtener el usuario de una publicación
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
    if (usuario) {
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
}