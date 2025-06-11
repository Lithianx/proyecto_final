
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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



@Component({
  selector: 'app-comentario',
  templateUrl: './comentario.page.html',
  styleUrls: ['./comentario.page.scss'],
  standalone: false,
})
export class ComentarioPage implements OnInit {

  @ViewChild('comentariosContainer', { static: false }) comentariosContainer!: ElementRef;

  postId: string | null = '';
  publicacion!: Publicacion;
  comentarios: Comentario[] = [];
  nuevoComentario = '';

  mostrarDescripcion: boolean = false;

  // Simulación del usuario actual (en producción esto viene de un servicio de autenticación)
  usuarioActual: Usuario = {
    id_usuario: 0,
    nombre_usuario: 'Usuario Demo',
    correo_electronico: 'demo@correo.com',
    fecha_registro: new Date(),
    contrasena: '',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
    estado_cuenta: true,
    estado_online: true
  };

  seguimientos: Seguir[] = [];

  likesComentarios: Like[] = [];

  publicacionesGuardadas: GuardaPublicacion[] = [];
  usuarios: Usuario[] = [];
  usuarioPost: Usuario | undefined;

  descripcionExpandida: { [id: number]: boolean } = {};
  publicacionesLikes: Like[] = [];

  usuariosFiltrados: Usuario[] = [];

  isModalOpen: boolean = false;
  selectedPost: Publicacion | undefined;


  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private actionSheetCtrl: ActionSheetController,
    private modalController: ModalController,
    private router: Router,
    private localStorage: LocalStorageService,
    private likeService: LikeService,
    private seguirService: SeguirService,
    private guardaPublicacionService: GuardaPublicacionService,
    private publicacionService: PublicacionService,
    private usuarioService: UsuarioService,
    private UtilsService: UtilsService,
    private comentarioService: ComentarioService
  ) { }


  toggleDescripcion(id: number) {
    this.descripcionExpandida[id] = !this.descripcionExpandida[id];
  }

  private async cargarDatos() {
    // Usuarios
    await this.usuarioService.cargarUsuarios();
    this.usuarios = this.usuarioService.getUsuarios();

    // Obtener el ID de la publicación
    this.postId = this.route.snapshot.paramMap.get('id');
    this.publicacion = await this.publicacionService.getPublicacionById(Number(this.postId));

    this.usuarioPost = this.usuarioService.getUsuarioPorId(this.publicacion.id_usuario);

    // Cargar comentarios en memoria
    await this.comentarioService.cargarComentarios();
    this.comentarios = this.comentarioService.getComentariosPorPublicacion(this.publicacion.id_publicacion);



    // Likes de comentarios
    await this.likeService.cargarLikesComentarios();
    this.likesComentarios = this.likeService.getLikesComentarios();


    // Likes de publicaciones
    await this.likeService.cargarLikes();
    this.publicacionesLikes = this.likeService.getLikes();

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

  async ngOnInit() {
    await this.cargarDatos();
  }

  // Método para refrescar la lista de comentarios
  async doRefresh(event: any) {
    console.log('Recargando comentarios...');
    await this.cargarDatos();
    event.target.complete();
    console.log('Recarga completada');
  }







  followersfriend: Usuario[] = [];
  // Filtrado por texto SOLO para los usuarios que sigues
handleInput(event: any): void {
  const searchTerm = event.target.value?.toLowerCase() || '';
  this.followersfriend = this.seguirService.filtrarUsuariosSeguidos(
    this.usuarios,
    this.usuarioActual.id_usuario,
    searchTerm
  );
}


  imagenSeleccionada: string | null = null;

  verImagen(publicacion: Publicacion) {
    this.imagenSeleccionada = publicacion.imagen ?? null;
  }

  cerrarVisor() {
    this.imagenSeleccionada = null;
  }


  getUsuarioComentario(id_usuario: number): Usuario | undefined {
    console.log('Buscando usuario con ID:', id_usuario);
    console.log('Buscando', this.usuarioService.getUsuarioPorId(id_usuario));
    return this.usuarioService.getUsuarioPorId(id_usuario);
  }


  async publicarComentario() {
    const mensaje = this.nuevoComentario.trim();
    if (mensaje) {
      const nuevo: Comentario = {
        id_comentario: Date.now(),
        id_publicacion: this.publicacion.id_publicacion,
        id_usuario: this.usuarioActual.id_usuario,
        contenido_comentario: mensaje,
        fecha_comentario: new Date(),
      };
      await this.comentarioService.agregarComentario(nuevo);
      this.comentarios = this.comentarioService.getComentariosPorPublicacion(this.publicacion.id_publicacion);
      this.comentarios = this.comentarioService.getComentariosOrdenadosPorFecha(this.publicacion.id_publicacion);
      this.nuevoComentario = '';
    }
  }


  getLikesComentario(id_comentario: number): number {
    return this.likesComentarios.filter(l => l.id_comentario === id_comentario && l.estado_like).length;
  }

  usuarioLikeoComentario(id_comentario: number): boolean {
    return !!this.likesComentarios.find(
      l => l.id_comentario === id_comentario && l.id_usuario === this.usuarioActual.id_usuario && l.estado_like
    );
  }


  // Dar o quitar like a un comentario
  async comentariolikes(comentario: Comentario) {
    await this.likeService.toggleLikeComentario(this.usuarioActual.id_usuario, comentario.id_comentario);
    // Recarga los likes en memoria para actualizar la vista
    await this.likeService.cargarLikesComentarios();
    this.likesComentarios = this.likeService.getLikesComentarios();
  }

  // Dar o quitar like a una publicación
  async likePublicacion(publicacion: Publicacion) {
    await this.likeService.toggleLike(this.usuarioActual.id_usuario, publicacion.id_publicacion);
    // Vuelve a cargar los likes en memoria para actualizar la vista
    this.publicacionesLikes = await this.likeService.getLikes();
  }


  // Métodos síncronos para la vista
  getLikesPublicacion(publicacion: Publicacion): number {
    return this.likeService.getLikesCount(publicacion.id_publicacion);
  }

  usuarioLikeoPublicacion(publicacion: Publicacion): boolean {
    return this.likeService.usuarioLikeo(this.usuarioActual.id_usuario, publicacion.id_publicacion);
  }

  enviar(publicacion: Publicacion) {
    this.isModalOpen = true;
    this.selectedPost = publicacion;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  sendPostToUser(usuario: Usuario) {
    if (this.selectedPost) {
      const publicacion = this.selectedPost;
      console.log(`Enviando publicación con id ${publicacion.id_publicacion} a ${usuario.nombre_usuario}`);
      console.log(`Contenido: ${publicacion.contenido}`);
      console.log(`Imagen: ${publicacion.imagen}`);
      console.log(`Fecha: ${publicacion.fecha_publicacion}`);
    } else {
      console.log('No hay una publicación seleccionada');
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
    return this.seguirService.sigue(this.usuarioActual.id_usuario, publicacion.id_usuario);
  }

  // Utilidad para obtener el usuario de una publicación
  getUsuarioPublicacion(id_usuario: number): Usuario | undefined {
    return this.usuarioService.getUsuarioPorId(id_usuario);
  }


  opcion(publicacion: Publicacion) {
    this.actionSheetCtrl.create({
      header: 'Opciones',
      buttons: [
        {
          text: 'Compartir',
          icon: 'share-outline',
          handler: () => {
            this.compartir(publicacion);
            console.log('Compartir post');
          },
        },
        {
          text: 'Reportar',
          icon: 'alert-circle-outline',
          role: 'destructive',
          handler: () => {
            this.irAReportar(publicacion);
            console.log('Post reportado');
          },
        },
        {
          text: 'Cancelar',
          icon: 'close-outline',
          role: 'cancel',
        },
      ],
      cssClass: 'custom-action-sheet'
    }).then(actionSheet => actionSheet.present());
  }



  async compartir(publicacion: Publicacion) {
    await this.UtilsService.compartirPublicacion(publicacion);
  }

  irAReportar(publicacion: Publicacion) {
    this.router.navigate(['/reportar', publicacion.id_publicacion]);
  }



  volver() {
    this.navCtrl.back();
  }
}
