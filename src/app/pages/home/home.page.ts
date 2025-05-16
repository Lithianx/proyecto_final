import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';



// interfaz para el Usuario
interface Usuario {
  id: string;
  username: string;
  userAvatar: string;
  following: boolean; // Estado de seguimiento
}

//  interfaz para el Post
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



  modalCompartirAbierto: boolean = false;
  postCompartir: Post | null = null;

  constructor(private actionSheetCtrl: ActionSheetController, private modalController: ModalController, private router: Router) { }


  loadPosts() {
    // cargar los posts desde Firebase a futuro
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
          following: true
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




  ngOnInit() {
    this.loadPosts();
    this.followersfriend = [...this.followers];
  }



  // Método para refrescar la lista de publicaciones
  doRefresh(event: any) {
    console.log('Recargando publicaciones...');
    setTimeout(() => {
      // Aquí actualizar desde Firebase
      this.loadPosts(); // Recarga los posts como ejemplo sin reiniciar todo el componente
      event.target.complete(); // Detiene el refresher
      console.log('Recarga completada');
    }, 1500); // Simula un tiempo de espera
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

  comentario(post: Post) {
    this.router.navigate(['/comentario', post.id]);
  }

  irAReportar(post: Post) {
    this.router.navigate(['/reportar', post.id]);
  }




}
