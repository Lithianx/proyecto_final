import { Component, OnInit,ViewChild,ElementRef  } from '@angular/core';
import { ActivatedRoute,Router } from '@angular/router';
import { ActionSheetController, ModalController,NavController } from '@ionic/angular';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

// interfaz para el Usuario
interface Usuario {
  id: string;
  username: string;
  userAvatar: string;
  following: boolean; // Estado de seguimiento
}


interface Comentario {
  usuario: string;
  avatar: string;
  mensaje: string;
  fecha: Date;
  comentarioliked:boolean;
  comentariolikes: number;
}

interface Post {
  id: string | number;
  time: string;
  image: string;
  description: string;
  likes: number;
  liked: boolean;
  guardar: boolean;
  usuario: Usuario; // Relacionar el Post con el Usuario
  comments: Comentario[];
}

@Component({
  selector: 'app-comentario',
  templateUrl: './comentario.page.html',
  styleUrls: ['./comentario.page.scss'],
  standalone: false,
})
export class ComentarioPage implements OnInit {

  @ViewChild('comentariosContainer', { static: false }) comentariosContainer!: ElementRef;

  postId: string | null = '';
  post!: Post;
  nuevoComentario = '';

  // Simulación del usuario actual (en producción esto viene de un servicio de autenticación)
  usuarioActual = {
    nombre: 'Usuario Demo',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg'
  };


  followers: Usuario[] = [
    { id: '1', username: 'PedritoGamer', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', following: true },
    { id: '2', username: 'Pan_con_queso', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', following: true },
    { id: '3', username: 'GamerPro', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', following: false },
    { id: '4', username: 'ChocoLover', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', following: true },
    { id: '5', username: 'PixelMaster', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', following: false },
    { id: '6', username: 'CodeWizard', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', following: true },
    { id: '7', username: 'EpicPlayer', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', following: false },
  ];

  isModalOpen: boolean = false;
  selectedPost: Post | undefined;


  constructor(private route: ActivatedRoute, private navCtrl: NavController,private actionSheetCtrl: ActionSheetController, private modalController: ModalController, private router: Router) {}

  ngOnInit() {
    this.followersfriend = [...this.followers];
    this.postId = this.route.snapshot.paramMap.get('id');
    this.obtenerPost();

    // Desplazar hacia la sección de comentarios después de cargar la página
    setTimeout(() => {
      if (this.comentariosContainer) {
        this.comentariosContainer.nativeElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100); // Se le da un pequeño retraso para asegurarse que todo esté cargado
  }

  followersfriend: Usuario[] = [];
  // Filtrado por texto
  handleInput(event: any): void {
    const searchTerm = event.target.value?.toLowerCase() || '';
    console.log('Valor ingresado en el input:', searchTerm);
    this.followersfriend = this.followers.filter(user =>
      user.username.toLowerCase().includes(searchTerm)
    );
    console.log('Usuarios filtrados:', this.followersfriend);
  }



  obtenerPost() {
    this.post = {
      id: this.postId || '1',
      image: 'https://raw.githubusercontent.com/R-CoderDotCom/samples/main/bird.png',
      time: 'Hace 2 horas',
      description: '¡Esa victoria fue épica! 🎮💥 saddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
      likes: 12,
      liked: false,
      guardar: false,
      usuario: {
        id: '1',
        username: 'johndoe',
        userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
        following: false
      },
      comments: [
        {
          usuario: 'Carlos Pérez',
          avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
          mensaje: '¡Increíble jugada, ¿cómo lo hiciste?!',
          fecha: new Date(),
          comentarioliked:false,
          comentariolikes: 9
        },
        {
          usuario: 'Ana Torres',
          avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
          mensaje: 'Esa estrategia es legendaria 🔥',
          fecha: new Date(),
          comentarioliked:false,
          comentariolikes: 34
        },
        {
          usuario: 'Luis Gómez',
          avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
          mensaje: 'Me dejó sin palabras 🤯. ¡Qué bien jugaste!',
          fecha: new Date(),
          comentarioliked:false,
          comentariolikes: 4
        },
        {
          usuario: 'Martín Díaz',
          avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
          mensaje: '¡Te ganaste el respeto de todos en la comunidad! 💪',
          fecha: new Date(),
          comentarioliked:false,
          comentariolikes: 55
        },
        {
          usuario: 'Isabel Ruiz',
          avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
          mensaje: '¡Cómo me gustaría saber esa táctica! 🤔',
          fecha: new Date(),
          comentarioliked:false,
          comentariolikes: 32
        },
        {
          usuario: 'Pablo González',
          avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
          mensaje: '¿Sabías que hay un truco para mejorar eso aún más? ¡Avísame si te interesa! 🔍',
          fecha: new Date(),
          comentarioliked:false,
          comentariolikes: 23
        },
        {
          usuario: 'Laura Martínez',
          avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
          mensaje: '¡Esto es otro nivel! 🎮🚀',
          fecha: new Date(),
          comentarioliked:false,
          comentariolikes: 14
        },
        {
          usuario: 'Sofía López',
          avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
          mensaje: '¡El trabajo en equipo fue clave, felicidades! 👏👏',
          fecha: new Date(),
          comentarioliked:false,
          comentariolikes: 16
        },
        {
          usuario: 'Andrés Castillo',
          avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
          mensaje: '¡Me encantó el momento cuando lo hiciste! 😍',
          fecha: new Date(),
          comentarioliked:false,
          comentariolikes: 17
        },
        {
          usuario: 'Paula Jiménez',
          avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
          mensaje: '¡Definitivamente lo replicaré en mi próxima partida! 🔥',
          fecha: new Date(),
          comentarioliked:false,
          comentariolikes: 10
        }
      ]
      
    };
  }

  publicarComentario() {
    const mensaje = this.nuevoComentario.trim();
    if (mensaje) {
      const nuevo: Comentario = {
        usuario: this.usuarioActual.nombre,
        avatar: this.usuarioActual.avatar,
        mensaje,
        fecha: new Date(),
        comentarioliked:false,
        comentariolikes: 0
      };
      this.post.comments.push(nuevo);
      this.nuevoComentario = '';
    }
  }


  comentariolikes(comentario: Comentario) {
    comentario.comentarioliked = !comentario.comentarioliked;
    comentario.comentarioliked ? comentario.comentariolikes++ : comentario.comentariolikes--;
  }

  likes(post: any) {
    post.liked = !post.liked;
    post.liked ? post.likes++ : post.likes--;
  }

  enviar(post: Post) {
    this.isModalOpen = true;
    this.selectedPost = post;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  sendPostToUser(user: Usuario) {
    if (this.selectedPost) {  // Aseguramos que selectedPost no sea undefined
      const post = this.selectedPost;
      console.log(`Enviando post con id ${post.id} a ${user.username}`);
      console.log(`Descripción: ${post.description}`);
      console.log(`Imagen: ${post.image}`);
      console.log(`Tiempo: ${post.time}`);
      console.log(`Likes: ${post.likes}`);
      console.log(`Guardado: ${post.guardar}`);
      console.log(`Usuario: ${post.usuario.username}`);
      console.log(`Avatar del usuario: ${post.usuario.userAvatar}`);
      console.log(`¿Seguido por el usuario? ${post.usuario.following ? 'Sí' : 'No'}`);
    } else {
      console.log('No hay un post seleccionado');
    }
    this.closeModal();
  }

  guardar(post: any) {
    post.guardar = !post.guardar;
    console.log(post.guardar ? 'Guardado' : 'Desguardado');
  }

  seguir(post: Post) {
    post.usuario.following = !post.usuario.following;
  }

  opcion(post: Post) {
    this.actionSheetCtrl.create({
      header: 'Opciones',
      buttons: [
        {
          text: 'Compartir',
          icon: 'share-outline',
          handler: () => {
            this.compartir(post);
            console.log('Compartir post');
          },
        },
        {
          text: 'Reportar',
          icon: 'alert-circle-outline',
          role: 'destructive',
          handler: () => {
            this.irAReportar(post);
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



  async compartir(post: Post) {

    const urlConMetadatos = `http://localhost:8100/comentario/${post.id}`;
    const mensaje = `${post.description}\n\n¡Tienes que ver esto!\n`;

    if (Capacitor.getPlatform() !== 'web') {
      await Share.share({
        title: 'Descubre esto',
        text: mensaje,
        url: urlConMetadatos,
        dialogTitle: 'Compartir publicación',
      });
    } else {
      // Prueba para navegador: abrir WhatsApp web
      const mensajeCodificado = encodeURIComponent(mensaje) + encodeURIComponent(urlConMetadatos);
      const url = `https://wa.me/?text=${mensajeCodificado}`;
      window.open(url, '_blank');
    }
  }

  irAReportar(post: Post) {
    this.router.navigate(['/reportar', post.id]);
  }




  volver() {
    this.navCtrl.back();
  }
}
