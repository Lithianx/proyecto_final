import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController, ModalController } from '@ionic/angular';


// Definir la interfaz para el Usuario
interface Usuario {
  id: string;
  username: string;
  userAvatar: string;
  following: boolean; // Estado de seguimiento
}

// Definir la interfaz para el Post
interface Post {
  id: number;
  image: string;
  time: string;
  description: string;
  likes: number;
  liked: boolean;
  guardar: boolean;
  usuario: Usuario; // Relacionar el Post con el Usuario
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {

  posts: Post[] = [];
  postActual: Post | null = null;
  mostrarDescripcion: boolean = false;

  modalCompartirAbierto: boolean = false;
  postCompartir: Post | null = null;

  constructor(private actionSheetCtrl: ActionSheetController, private modalController: ModalController, private router: Router) {}

  ngOnInit() {
    // Ejemplo de datos de posts para simular la información que recibirías de Firebase
    this.posts = [
      {
        id: 1,
        image: 'https://raw.githubusercontent.com/R-CoderDotCom/samples/main/bird.png',
        time: 'Hace 2 horas',
        description: '¡Esa victoria fue épica! 🎮💥',
        likes: 12,
        liked: false,
        guardar: false,
        usuario: {
          id: '1',
          username: 'johndoe',
          userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
          following: false
        }
      },
      {
        id: 2,
        image: '',
        time: 'Hace 3 hora',
        description: '¡Acabamos de ganar una partida en squad! 🏆🎮',
        likes: 20,
        liked: false,
        guardar: false,
        usuario: {
          id: '2',
          username: 'gamer123',
          userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
          following: false
        }
      },
      {
        id: 3,
        image: 'https://ionicframework.com/docs/img/demos/card-media.png',
        time: 'Hace 3 hora',
        description: '¡Acabamos de ganar una partida en squad! 🏆🎮',
        likes: 20,
        liked: false,
        guardar: false,
        usuario: {
          id: '2',
          username: 'gamer123',
          userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
          following: false
        }
      }
    ];
  }



  // Método para refrescar la lista de publicaciones
  doRefresh(event: any) {
    console.log('Recargando publicaciones...');
    setTimeout(() => {
      // Aquí podrías actualizar los datos, por ejemplo, desde Firebase
      this.ngOnInit(); // Recarga los posts como ejemplo
      event.target.complete(); // Detiene el refresher
      console.log('Recarga completada');
    }, 1500); // Simula un tiempo de espera
  }






  imagenSeleccionada: string | null = null;

  verImagen(post: Post) {
    this.imagenSeleccionada = post.image;
  }

  cerrarVisor() {
    this.imagenSeleccionada = null;
  }

  likes(post: Post) {
    post.liked = !post.liked;
    post.liked ? post.likes++ : post.likes--;
  }

  enviar(post: Post) {
    console.log('Enviar post');
  }

  guardar(post: Post) {
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
            this.abrirModalCompartir(post);
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
    }).then(actionSheet => actionSheet.present());
  }

  abrirModalCompartir(post: Post) {
    this.postCompartir = post;
    this.modalCompartirAbierto = true;
  }

  cerrarModalCompartir() {
    this.modalCompartirAbierto = false;
    this.postCompartir = null;
  }

  compartir(post: Post) {
    const mensaje = encodeURIComponent(`${post.description} 👉 http://localhost:8100/comentario/${post.id}`);
    const url = `https://wa.me/?text=${mensaje}`;
    window.open(url, '_blank');
    console.log('Compartiendo post:', post);
    this.cerrarModalCompartir();
  }

  comentario(post: Post) {
    this.router.navigate(['/comentario', post.id]);
  }

  irAReportar(post: Post) {
    this.router.navigate(['/reportar', post.id]);
  }




}
