
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

import { AlertController } from '@ionic/angular';


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

  // Ejemplo de likes para comentarios
  likesComentarios: Like[] = [
    {
      id_usuario: 1,
      id_comentario: 1,
      fecha_like: new Date('2024-06-01T12:00:00'),
      estado_like: true
    },
    {
      id_usuario: 3,
      id_comentario: 1,
      fecha_like: new Date('2024-06-02T08:00:00'),
      estado_like: true
    }
  ];


  usuarios: Usuario[] = [];
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
    private alertCtrl: AlertController
,
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

  async ngOnInit() {


    // Usuarios
    await this.usuarioService.cargarUsuarios(); // primero carga
    this.usuarios = this.usuarioService.getUsuarios(); // luego los asignas desde memoria





    this.postId = this.route.snapshot.paramMap.get('id');
    await this.obtenerPublicacion();
    this.likesComentarios = await this.localStorage.getList<Like>('comentarioLikes');
    this.publicacionLikes = await this.localStorage.getList<Like>('publicacionLikes');




    
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
    }, 100); // Se le da un pequeño retraso para asegurarse que todo esté cargado

  }  



  // Método para refrescar la lista de comentarios
  async doRefresh(event: any) {
    console.log('Recargando comentarios...');
    setTimeout(async () => {
      await this.obtenerPublicacion(); // Recarga los comentarios desde el local storage
      event.target.complete();
      console.log('Recarga completada');
    }, 1500);
  }







  followersfriend: Usuario[] = [];
  // Filtrado por texto SOLO para los usuarios que sigues
  handleInput(event: any): void {
    const searchTerm = event.target.value?.toLowerCase() || '';
    console.log('Valor ingresado en el input:', searchTerm);

    // Usa el método del servicio para obtener los seguidos
    const seguidos = this.seguirService.getUsuariosSeguidos(this.usuarios, this.usuarioActual.id_usuario);

    // Aplica filtro por nombre
    this.followersfriend = seguidos.filter(user =>
      user.nombre_usuario.toLowerCase().includes(searchTerm)
    );

    console.log('Usuarios filtrados:', this.followersfriend);
  }


  imagenSeleccionada: string | null = null;

  verImagen(publicacion: Publicacion) {
    this.imagenSeleccionada = publicacion.imagen ?? null;
  }

  cerrarVisor() {
    this.imagenSeleccionada = null;
  }



  usuarioPost!: Usuario;

  async obtenerPublicacion() {
    // Obtiene la publicación desde el local storage
    const publicaciones = await this.localStorage.getList<Publicacion>('publicaciones');
    this.publicacion = publicaciones.find(p => p.id_publicacion === Number(this.postId))!;

    // Busca el usuario de la publicación
    this.usuarioPost = this.usuarios.find(u => u.id_usuario === this.publicacion.id_usuario)!;

    // Obtiene los comentarios asociados a la publicación desde el local storage
    let comentarios = await this.localStorage.getListByProp<Comentario>('comentarios', 'id_publicacion', this.publicacion.id_publicacion);

    // Si no hay comentarios en el local, inicializa con simulados y guárdalos
    if (!comentarios || comentarios.length === 0) {
      comentarios = [
        {
          id_comentario: Number(`${this.publicacion.id_publicacion}01`), // Ej: 101 para publicación 1, 201 para publicación 2
          id_publicacion: this.publicacion.id_publicacion,
          id_usuario: 2,
          contenido_comentario: '¡Increíble jugada, ¿cómo lo hiciste?!',
          fecha_comentario: new Date('2023-05-01T09:00:00')
        },
        {
          id_comentario: Number(`${this.publicacion.id_publicacion}02`),
          id_publicacion: this.publicacion.id_publicacion,
          id_usuario: 3,
          contenido_comentario: 'Me perdí esa parte, ¿hay video?',
          fecha_comentario: new Date('2022-06-01T09:00:00')
        },
        {
          id_comentario: Number(`${this.publicacion.id_publicacion}03`),
          id_publicacion: this.publicacion.id_publicacion,
          id_usuario: 1,
          contenido_comentario: 'Gracias a todos por el apoyo, ¡fue un gran equipo!',
          fecha_comentario: new Date('2021-06-01T09:00:00')
        },
        {
          id_comentario: Number(`${this.publicacion.id_publicacion}04`),
          id_publicacion: this.publicacion.id_publicacion,
          id_usuario: 3,
          contenido_comentario: '¡Quiero jugar la próxima vez!',
          fecha_comentario: new Date('2023-07-01T09:00:00')
        },
        {
          id_comentario: Number(`${this.publicacion.id_publicacion}05`),
          id_publicacion: this.publicacion.id_publicacion,
          id_usuario: 3,
          contenido_comentario: '¿Qué personaje usaste?',
          fecha_comentario: new Date('2023-06-01T09:00:00')
        }
      ];
      // Guarda los comentarios simulados en el local storage
      for (const comentario of comentarios) {
        await this.localStorage.addToList<Comentario>('comentarios', comentario);
      }
    }

    // Asigna los comentarios ordenados
    this.comentarios = await this.localStorage.getListByProp<Comentario>('comentarios', 'id_publicacion', this.publicacion.id_publicacion);
    this.comentarios.sort((a, b) => b.fecha_comentario.getTime() - a.fecha_comentario.getTime());
  }

  getUsuarioComentario(id_usuario: number): Usuario | undefined {
    return this.usuarios.find(u => u.id_usuario === id_usuario);
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
      await this.localStorage.addToList<Comentario>('comentarios', nuevo);
      this.comentarios = await this.localStorage.getListByProp<Comentario>('comentarios', 'id_publicacion', this.publicacion.id_publicacion);
      this.comentarios.sort((a, b) => b.fecha_comentario.getTime() - a.fecha_comentario.getTime());
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

  comentariolikes(comentario: Comentario) {
    const like = this.likesComentarios.find(
      l => l.id_usuario === this.usuarioActual.id_usuario && l.id_comentario === comentario.id_comentario
    );

    if (like) {
      like.estado_like = !like.estado_like;
      like.fecha_like = new Date();
    } else {
      this.likesComentarios.push({
        id_usuario: this.usuarioActual.id_usuario,
        id_comentario: comentario.id_comentario,
        fecha_like: new Date(),
        estado_like: true
      });
    }
    this.localStorage.setItem('comentarioLikes', this.likesComentarios);
  }

  publicacionLikes: Like[] = [];

  // Dar o quitar like
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

  publicacionesGuardadas: GuardaPublicacion[] = [];

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


opcion(publicacion: any) {
  console.log('publicacion recibida:', publicacion);
//para que se mustre una opcion o otra, con datos dumi

    localStorage.setItem('id_usuario', '1');
   // localStorage.removeItem('id_usuario');

  const idUsuarioActual = Number(localStorage.getItem('id_usuario'));

  console.log('idUsuarioActual (desde localStorage):', idUsuarioActual);

  const esPropietario = publicacion.id_usuario === idUsuarioActual;
  console.log('esPropietario:', esPropietario);
  console.log('ID de usaurio publicacion:', publicacion.id_usuario);
  const botones = esPropietario
    ? [
        {
          text: 'Editar',
          icon: 'pencil-outline',
          handler: () => {
            console.log('Editar seleccionado');
            this.modificar(publicacion);
          },
        },
        {
          text: 'Eliminar publicacion',
          icon: 'alert-circle-outline',
          role: 'destructive',
          handler: () => {
            console.log('Eliminar seleccionado');
            this.confirmarEliminacion(publicacion);
          },
        },

        {
          text: 'Cancelar',
          icon: 'close-outline',
          role: 'cancel',
          handler: () => {
            console.log('Cancelado');
          }
        }
      ]
    : [
        {
          text: 'Compartir',
          icon: 'share-outline',
          handler: () => {
            console.log('Compartir seleccionado');
            this.compartir(publicacion);
          },
        },
        {
          text: 'Reportar',
          icon: 'alert-circle-outline',
          role: 'destructive',
          handler: () => {
            console.log('Reportar seleccionado');
            this.irAReportar(publicacion);
          },
        },
        {
          text: 'Cancelar',
          icon: 'close-outline',
          role: 'cancel',
          handler: () => {
            console.log('Cancelado');
          }
        }
      ];

  console.log('Botones a mostrar:', botones);

  this.actionSheetCtrl.create({
    header: 'Opciones',
    buttons: botones,
    cssClass: 'custom-action-sheet'
  }).then(actionSheet => {
    console.log('Mostrando action sheet');
    actionSheet.present();
  });
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
        handler: () => {
          console.log('Eliminación cancelada');
        }
      },
      {
        text: 'Eliminar',
        role: 'destructive',
        cssClass: 'alert-button-delete',
        handler: () => {
          console.log('Confirmado eliminar publicación');
          this.volver(); 
         // Aquí puedes usar tu función de eliminación real
        }
      }
    ]
  });

  await alert.present();
}

}
