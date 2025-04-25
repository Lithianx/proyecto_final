import { Component, OnInit } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {

  posts: any[] = [];
  // mostrarModalComentarios = false;
  // comentariosSeleccionados: string[] = [];
  postActual: any;
  // nuevoComentario = '';
  mostrarDescripcion: boolean = false;

  constructor(private actionSheetCtrl: ActionSheetController) {}

  ngOnInit() {
    this.posts = [
      {
        id: 1,
        username: 'johndoe',
        userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
        image: 'https://raw.githubusercontent.com/R-CoderDotCom/samples/main/bird.png',
        time: '2 horas atrás',
        description: '¡Esa victoria fue épica! 🎮💥dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
        likes: 12,
        liked: false,
        guardar: false,
        // comments: [
        //   '¡Increíble jugada, ¿cómo lo hiciste?!',
        //   'Esa estrategia es legendaria 🔥',
        //   '¡Te vi en el stream! ¡Fue brutal! 😎',
        //   '¿Cuál es tu equipo favorito en ese juego? ⚔️',
        //   '¡GG! Nos vemos en la próxima partida!',
        // ]
      },
      {
        id: 2,
        username: 'gamer123',
        userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
        image: 'https://ionicframework.com/docs/img/demos/card-media.png',
        time: '1 hora atrás',
        description: '¡Acabamos de ganar una partida en squad! 🏆🎮',
        likes: 20,
        liked: false,
        guardar: false,
        // comments: [
        //   '¡Eso fue épico, me quedé sin palabras! 🤯',
        //   'Estuve a punto de morir, ¡pero tu resucitación fue perfecta! 👏',
        //   '¿Cuál es tu configuración de armas? Necesito mejorar mi loadout 🔫',
        //   '¡Nunca había visto un combo tan rápido! 🏃‍♂️⚡',
        //   '¿Alguien más siente que el juego está mucho más difícil desde la última actualización? 😅',
        // ]
      },
      {
        id: 3,
        username: 'gamer123',
        userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
        image: 'https://ionicframework.com/docs/img/demos/card-media.png',
        time: '1 hora atrás',
        description: '¡Acabamos de ganar una partida en squad! 🏆🎮',
        likes: 20,
        liked: false,
        guardar: false,
        // comments: [
        //   '¡Eso fue épico, me quedé sin palabras! 🤯',
        //   'Estuve a punto de morir, ¡pero tu resucitación fue perfecta! 👏',
        //   '¿Cuál es tu configuración de armas? Necesito mejorar mi loadout 🔫',
        //   '¡Nunca había visto un combo tan rápido! 🏃‍♂️⚡',
        //   '¿Alguien más siente que el juego está mucho más difícil desde la última actualización? 😅',
        // ]
      }
    ];
  }


  imagenSeleccionada: string | null = null;

  verImagen(post: any) {
    this.imagenSeleccionada = post.image;
  }
  
  cerrarVisor() {
    this.imagenSeleccionada = null;
  }


  // verComentarios(post: any) {
  //   this.postActual = post;
  //   this.comentariosSeleccionados = [...post.comments];
  //   this.mostrarModalComentarios = true;
  // }

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

  opcion(post: any) {
    this.actionSheetCtrl.create({
      header: 'Opciones',
      buttons: [
        {
          text: 'Compartir',
          icon: 'share-outline',
          handler: () => {
            console.log('Compartir post');
          },
        },
        {
          text: 'Reportar',
          icon: 'alert-circle-outline',
          role: 'destructive',
          handler: () => {
            console.log('Post reportado');
          },
        },
        {
          text: 'Seguir',
          icon: 'person-add-outline',
          handler: () => {
            console.log('Seguir post');
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

  // cerrarModal() {
  //   this.mostrarModalComentarios = false;
  //   this.nuevoComentario = '';
  // }

  // publicarComentario() {
  //   const texto = this.nuevoComentario.trim();
  //   if (texto) {
  //     this.postActual.comments.push(texto);
  //     this.comentariosSeleccionados.push(texto);
  //     this.nuevoComentario = '';
  //   }
  // }
}
