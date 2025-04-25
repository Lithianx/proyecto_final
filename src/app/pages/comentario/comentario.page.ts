import { Component, OnInit,ViewChild,ElementRef  } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';

interface Comentario {
  usuario: string;
  avatar: string;
  mensaje: string;
  fecha: Date;
}

interface Post {
  id: string | number;
  username: string;
  userAvatar: string;
  time: string;
  image: string;
  description: string;
  likes: number;
  liked: boolean;
  guardar: boolean;
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

  constructor(private route: ActivatedRoute, private navCtrl: NavController) {}

  ngOnInit() {
    this.postId = this.route.snapshot.paramMap.get('id');
    this.obtenerPost();

    // Desplazar hacia la sección de comentarios después de cargar la página
    setTimeout(() => {
      if (this.comentariosContainer) {
        this.comentariosContainer.nativeElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100); // Se le da un pequeño retraso para asegurarse que todo esté cargado
  }




  obtenerPost() {
    this.post = {
      id: this.postId || 1,
      username: 'johndoe',
      userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
      image: 'https://raw.githubusercontent.com/R-CoderDotCom/samples/main/bird.png',
      time: '2 horas atrás',
      description: '¡Esa victoria fue épica! 🎮💥 saddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
      likes: 12,
      liked: false,
      guardar: false,
      comments: [
        {
          usuario: 'Carlos Pérez',
          avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
          mensaje: '¡Increíble jugada, ¿cómo lo hiciste?!',
          fecha: new Date()
        },
        {
          usuario: 'Ana Torres',
          avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
          mensaje: 'Esa estrategia es legendaria 🔥',
          fecha: new Date()
        },
        {
          usuario: 'Luis Gómez',
          avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
          mensaje: 'Me dejó sin palabras 🤯. ¡Qué bien jugaste!',
          fecha: new Date()
        },
        {
          usuario: 'Martín Díaz',
          avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
          mensaje: '¡Te ganaste el respeto de todos en la comunidad! 💪',
          fecha: new Date()
        },
        {
          usuario: 'Isabel Ruiz',
          avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
          mensaje: '¡Cómo me gustaría saber esa táctica! 🤔',
          fecha: new Date()
        },
        {
          usuario: 'Pablo González',
          avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
          mensaje: '¿Sabías que hay un truco para mejorar eso aún más? ¡Avísame si te interesa! 🔍',
          fecha: new Date()
        },
        {
          usuario: 'Laura Martínez',
          avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
          mensaje: '¡Esto es otro nivel! 🎮🚀',
          fecha: new Date()
        },
        {
          usuario: 'Sofía López',
          avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
          mensaje: '¡El trabajo en equipo fue clave, felicidades! 👏👏',
          fecha: new Date()
        },
        {
          usuario: 'Andrés Castillo',
          avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
          mensaje: '¡Me encantó el momento cuando lo hiciste! 😍',
          fecha: new Date()
        },
        {
          usuario: 'Paula Jiménez',
          avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
          mensaje: '¡Definitivamente lo replicaré en mi próxima partida! 🔥',
          fecha: new Date()
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
        fecha: new Date()
      };
      this.post.comments.push(nuevo);
      this.nuevoComentario = '';
    }
  }

  likes(post: any) {
    post.liked = !post.liked;
    post.liked ? post.likes++ : post.likes--;
  }

  enviar(post: any) {
    console.log('Enviar post');
  }

  guardar(post: any) {
    post.guardar = !post.guardar;
    console.log(post.guardar ? 'Guardado' : 'Desguardado');
  }



  volver() {
    this.navCtrl.back();
  }
}
