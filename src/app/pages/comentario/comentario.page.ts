
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

  seguimientos: Seguir[] = [
    { id_usuario_seguidor: 0, id_usuario_seguido: 2, estado_seguimiento: true },
    { id_usuario_seguidor: 0, id_usuario_seguido: 3, estado_seguimiento: true },
    // Puedes agregar más relaciones si quieres
  ];

  usuarios: Usuario[] = [
    {
      id_usuario: 0,
      nombre_usuario: 'Usuario Demo',
      correo_electronico: 'demo@correo.com',
      fecha_registro: new Date(),
      contrasena: '',
      avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
      estado_cuenta: true,
      estado_online: true
    },
    {
      id_usuario: 1,
      nombre_usuario: 'PedritoGamer',
      correo_electronico: 'pedrito@correo.com',
      fecha_registro: new Date(),
      contrasena: '',
      avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
      estado_cuenta: true,
      estado_online: true
    },
    {
      id_usuario: 2,
      nombre_usuario: 'Pan_con_queso',
      correo_electronico: 'pan@correo.com',
      fecha_registro: new Date(),
      contrasena: '',
      avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
      estado_cuenta: true,
      estado_online: true
    },
    {
      id_usuario: 3,
      nombre_usuario: 'gamer78',
      correo_electronico: 'pan@correo.com',
      fecha_registro: new Date(),
      contrasena: '',
      avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
      estado_cuenta: true,
      estado_online: true
    },
    // ...otros usuarios simulados...
  ];


  // Ejemplo de likes para publicaciones
  likesPublicaciones: Like[] = [
    {
      id_usuario: 1,
      id_publicacion: 101,
      fecha_like: new Date('2024-06-01T10:00:00'),
      estado_like: true
    },
    {
      id_usuario: 2,
      id_publicacion: 101,
      fecha_like: new Date('2024-06-01T11:00:00'),
      estado_like: true
    },
    {
      id_usuario: 3,
      id_publicacion: 102,
      fecha_like: new Date('2024-06-02T09:30:00'),
      estado_like: true
    }
  ];

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



  usuariosFiltrados: Usuario[] = [];

  isModalOpen: boolean = false;
  selectedPost: Publicacion | undefined;


  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private actionSheetCtrl: ActionSheetController,
    private modalController: ModalController,
    private router: Router,
    private localStorage: LocalStorageService
  ) { }


  async ngOnInit() {
    const idsSeguidos = this.seguimientos
      .filter(s => s.id_usuario_seguidor === this.usuarioActual.id_usuario && s.estado_seguimiento)
      .map(s => s.id_usuario_seguido);

    this.followersfriend = this.usuarios.filter(user => idsSeguidos.includes(user.id_usuario));
    this.postId = this.route.snapshot.paramMap.get('id');
    await this.obtenerPublicacion();
    this.likesComentarios = await this.localStorage.getList<Like>('comentarioLikes');
    this.publicacionLikes = await this.localStorage.getList<Like>('publicacionLikes');
    this.seguimientos = await this.localStorage.getList<Seguir>('seguimientos');

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

    // 1. Obtén los IDs de los usuarios que sigues
    const idsSeguidos = this.seguimientos
      .filter(s => s.id_usuario_seguidor === this.usuarioActual.id_usuario && s.estado_seguimiento)
      .map(s => s.id_usuario_seguido);

    // 2. Filtra solo los usuarios seguidos y luego por nombre
    this.followersfriend = this.usuarios
      .filter(user => idsSeguidos.includes(user.id_usuario))
      .filter(user => user.nombre_usuario.toLowerCase().includes(searchTerm));

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

  likePublicacion() {
    const like = this.publicacionLikes.find(
      l => l.id_usuario === this.usuarioActual.id_usuario &&
        l.id_publicacion === this.publicacion.id_publicacion
    );

    if (like) {
      like.estado_like = !like.estado_like;
      like.fecha_like = new Date();
    } else {
      this.publicacionLikes.push({
        id_usuario: this.usuarioActual.id_usuario,
        id_publicacion: this.publicacion.id_publicacion,
        fecha_like: new Date(),
        estado_like: true
      });
    }
    this.localStorage.setItem('publicacionLikes', this.publicacionLikes);
  }

  getLikesPublicacion(): number {
    return this.publicacionLikes.filter(
      l => l.id_publicacion === this.publicacion.id_publicacion && l.estado_like
    ).length;
  }

  usuarioLikeoPublicacion(): boolean {
    return !!this.publicacionLikes.find(
      l => l.id_publicacion === this.publicacion.id_publicacion &&
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

  estaGuardada(): boolean {
    return !!this.publicacionesGuardadas.find(
      g => g.id_publicaion === this.publicacion.id_publicacion &&
        g.id_usuario === this.usuarioActual.id_usuario &&
        g.estado_guardado
    );
  }

  guardar() {
    const guardado = this.publicacionesGuardadas.find(
      g => g.id_publicaion === this.publicacion.id_publicacion &&
        g.id_usuario === this.usuarioActual.id_usuario
    );

    if (guardado) {
      guardado.estado_guardado = !guardado.estado_guardado;
      guardado.fecha_guardado = new Date();
    } else {
      this.publicacionesGuardadas.push({
        id_publicaion: this.publicacion.id_publicacion,
        id_usuario: this.usuarioActual.id_usuario,
        fecha_guardado: new Date(),
        estado_guardado: true
      });
    }
    this.localStorage.setItem('publicacionesGuardadas', this.publicacionesGuardadas);
  }

  // Array para almacenar seguimientos

  seguir(usuario: Usuario) {
    const seguimiento = this.seguimientos.find(
      s => s.id_usuario_seguidor === this.usuarioActual.id_usuario && s.id_usuario_seguido === usuario.id_usuario
    );

    if (seguimiento) {
      // Cambia el estado
      seguimiento.estado_seguimiento = !seguimiento.estado_seguimiento;
    } else {
      // Si no existe, lo crea como seguimiento activo
      this.seguimientos.push({
        id_usuario_seguidor: this.usuarioActual.id_usuario,
        id_usuario_seguido: usuario.id_usuario,
        estado_seguimiento: true
      });
    }
    this.localStorage.setItem('seguimientos', this.seguimientos);
  }

  sigueAlAutor(): boolean {
    return !!this.seguimientos.find(
      s => s.id_usuario_seguidor === this.usuarioActual.id_usuario &&
        s.id_usuario_seguido === this.publicacion.id_usuario &&
        s.estado_seguimiento
    );
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

    const urlConMetadatos = `http://localhost:8100/comentario/${publicacion.id_publicacion}`;
    const mensaje = `${publicacion.contenido}\n\n¡Tienes que ver esto!\n`;

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

  irAReportar(publicacion: Publicacion) {
    this.router.navigate(['/reportar', publicacion.id_publicacion]);
  }




  volver() {
    this.navCtrl.back();
  }
}
