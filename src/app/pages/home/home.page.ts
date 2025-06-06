import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

import { Usuario } from 'src/app/models/usuario.model';
import { Publicacion } from 'src/app/models/publicacion.model';
import { GuardaPublicacion } from 'src/app/models/guarda-publicacion.model';
import { Like } from 'src/app/models/like.model';
import { Seguir } from 'src/app/models/seguir.model';

import { LocalStorageService } from 'src/app/services/local-storage-social.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {

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

  publicaciones: Publicacion[] = [];
  mostrarDescripcion: boolean = false;
  usuarios: Usuario[] = [
    { id_usuario: 1, nombre_usuario: 'PedritoGamer', correo_electronico: 'pedrito@correo.com', fecha_registro: new Date(), contrasena: '', avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado_cuenta: true, estado_online: true },
    { id_usuario: 2, nombre_usuario: 'Pan_con_queso', correo_electronico: 'pan@correo.com', fecha_registro: new Date(), contrasena: '', avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado_cuenta: true, estado_online: true },
    { id_usuario: 3, nombre_usuario: 'GamerPro', correo_electronico: 'gamerpro@correo.com', fecha_registro: new Date(), contrasena: '', avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg', estado_cuenta: true, estado_online: false },
    // ...otros usuarios simulados
  ];

  seguimientos: Seguir[] = [
    { id_usuario_seguidor: 0, id_usuario_seguido: 2, estado_seguimiento: true },
    { id_usuario_seguidor: 0, id_usuario_seguido: 3, estado_seguimiento: true },
    // Puedes agregar más relaciones si quieres
  ];

  publicacionesLikes: Like[] = [];
  publicacionesGuardadas: GuardaPublicacion[] = [];

  isModalOpen: boolean = false;
  selectedPublicacion: Publicacion | undefined;



  modalCompartirAbierto: boolean = false;
  publicacionCompartir: Publicacion | null = null;

  constructor(private actionSheetCtrl: ActionSheetController,
    private modalController: ModalController,
    private router: Router,
    private localStorage: LocalStorageService
  ) { }

  publicacionesAmigos: Publicacion[] = [];

  loadPublicaciones() {
    this.publicaciones = [
      {
        id_publicacion: 1,
        id_usuario: 1,
        contenido: '¡Esa victoria fue épica! 🎮💥',
        imagen: 'https://raw.githubusercontent.com/R-CoderDotCom/samples/main/bird.png',
        fecha_publicacion: new Date('2024-05-01T15:30:00')
      },
      {
        id_publicacion: 2,
        id_usuario: 2,
        contenido: '¡Acabamos de ganar una partida en squad! 🏆🎮',
        imagen: '',
        fecha_publicacion: new Date('2024-06-01T12:00:00')
      },
      {
        id_publicacion: 3,
        id_usuario: 2,
        contenido: '¡Acabamos de ganar una partida en squad! 🏆🎮',
        imagen: 'https://ionicframework.com/docs/img/demos/card-media.png',
        fecha_publicacion: new Date('2023-06-01T09:00:00')
      }
    ];
    // Ordena de más nueva a más antigua
    this.publicaciones.sort((a, b) => b.fecha_publicacion.getTime() - a.fecha_publicacion.getTime());
  }




  async ngOnInit() {
    // Usuarios
    let usuarios = await this.localStorage.getList<Usuario>('usuarios');
    if (!usuarios || usuarios.length === 0) {
      
      usuarios = [...this.usuarios]; // Usa los simulados si es la primera vez

      const usuariosPublicos = usuarios.map(u => ({
        id_usuario: u.id_usuario,
        nombre_usuario: u.nombre_usuario,
        avatar: u.avatar,
        estado_online: u.estado_online
      }));
      await this.localStorage.setItem('usuarios', usuariosPublicos);
    }
    this.usuarios = usuarios;

    // Publicaciones
    let publicaciones = await this.localStorage.getList<Publicacion>('publicaciones');
    if (!publicaciones || publicaciones.length === 0) {
      this.loadPublicaciones();
      publicaciones = [...this.publicaciones];
      await this.localStorage.setItem('publicaciones', publicaciones);
    }
    this.publicaciones = publicaciones;

    // Likes de publicaciones
    this.publicacionesLikes = await this.localStorage.getList<Like>('publicacionLikes') || [];

    // Guardados
    this.publicacionesGuardadas = await this.localStorage.getList<GuardaPublicacion>('publicacionesGuardadas') || [];

    // Seguimientos
    this.seguimientos = await this.localStorage.getList<Seguir>('seguimientos') || this.seguimientos;

    // Carga publicaciones de amigos
    const idsSeguidos = this.seguimientos
      .filter(s => s.id_usuario_seguidor === this.usuarioActual.id_usuario && s.estado_seguimiento)
      .map(s => s.id_usuario_seguido);

    this.followersfriend = this.usuarios.filter(user => idsSeguidos.includes(user.id_usuario));
    this.publicacionesAmigos = [...this.publicaciones];
  }



  // Método para refrescar la lista de publicaciones
  doRefresh(event: any) {
    console.log('Recargando publicaciones...');
    setTimeout(async () => {
      // Opcional: recarga desde el local storage si quieres actualizar
      this.publicaciones = await this.localStorage.getList<Publicacion>('publicaciones') || [];

      // Ordena las publicaciones de más nueva a más antigua
      this.publicaciones.sort((a, b) => b.fecha_publicacion.getTime() - a.fecha_publicacion.getTime());
      await this.localStorage.setItem('publicaciones', this.publicaciones);
      event.target.complete();
      console.log('Recarga completada');
    }, 1500);
  }


  // Likes
  likePublicacion(publicacion: Publicacion) {
    const like = this.publicacionesLikes.find(
      l => l.id_usuario === this.usuarioActual.id_usuario && l.id_publicacion === publicacion.id_publicacion
    );
    if (like) {
      like.estado_like = !like.estado_like;
      like.fecha_like = new Date();
    } else {
      this.publicacionesLikes.push({
        id_usuario: this.usuarioActual.id_usuario,
        id_publicacion: publicacion.id_publicacion,
        fecha_like: new Date(),
        estado_like: true
      });
    }
    this.localStorage.setItem('publicacionLikes', this.publicacionesLikes);
  }

  getLikesPublicacion(publicacion: Publicacion): number {
    return this.publicacionesLikes.filter(
      l => l.id_publicacion === publicacion.id_publicacion && l.estado_like
    ).length;
  }

  usuarioLikeoPublicacion(publicacion: Publicacion): boolean {
    return !!this.publicacionesLikes.find(
      l => l.id_publicacion === publicacion.id_publicacion &&
        l.id_usuario === this.usuarioActual.id_usuario &&
        l.estado_like
    );
  }


  // Guardar publicación
  guardar(publicacion: Publicacion) {
    const guardado = this.publicacionesGuardadas.find(
      g => g.id_publicaion === publicacion.id_publicacion && g.id_usuario === this.usuarioActual.id_usuario
    );
    if (guardado) {
      guardado.estado_guardado = !guardado.estado_guardado;
      guardado.fecha_guardado = new Date();
    } else {
      this.publicacionesGuardadas.push({
        id_publicaion: publicacion.id_publicacion,
        id_usuario: this.usuarioActual.id_usuario,
        fecha_guardado: new Date(),
        estado_guardado: true
      });
    }
    this.localStorage.setItem('publicacionesGuardadas', this.publicacionesGuardadas);
  }

  estaGuardada(publicacion: Publicacion): boolean {
    return !!this.publicacionesGuardadas.find(
      g => g.id_publicaion === publicacion.id_publicacion &&
        g.id_usuario === this.usuarioActual.id_usuario &&
        g.estado_guardado
    );
  }


  // Seguir/Dejar de seguir
  seguir(usuario: Usuario) {
    const seguimiento = this.seguimientos.find(
      s => s.id_usuario_seguidor === this.usuarioActual.id_usuario && s.id_usuario_seguido === usuario.id_usuario
    );
    if (seguimiento) {
      seguimiento.estado_seguimiento = !seguimiento.estado_seguimiento;
    } else {
      this.seguimientos.push({
        id_usuario_seguidor: this.usuarioActual.id_usuario,
        id_usuario_seguido: usuario.id_usuario,
        estado_seguimiento: true
      });
    }
    this.localStorage.setItem('seguimientos', this.seguimientos);
  }

  sigueAlAutor(publicacion: Publicacion): boolean {
    return !!this.seguimientos.find(
      s => s.id_usuario_seguidor === this.usuarioActual.id_usuario &&
        s.id_usuario_seguido === publicacion.id_usuario &&
        s.estado_seguimiento
    );
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




  // Modal de compartir
  enviar(publicacion: Publicacion) {
    this.isModalOpen = true;
    this.selectedPublicacion = publicacion;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  sendPostToUser(usuario: Usuario) {
    if (this.selectedPublicacion) {
      const publicacion = this.selectedPublicacion;
      console.log(`Enviando publicación con id ${publicacion.id_publicacion} a ${usuario.nombre_usuario}`);
      console.log(`Contenido: ${publicacion.contenido}`);
      console.log(`Imagen: ${publicacion.imagen}`);
      console.log(`Fecha: ${publicacion.fecha_publicacion}`);
    } else {
      console.log('No hay una publicación seleccionada');
    }
    this.closeModal();
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

  comentario(publicacion: Publicacion) {
    this.router.navigate(['/comentario', publicacion.id_publicacion]);
  }

  irAReportar(publicacion: Publicacion) {
    this.router.navigate(['/reportar', publicacion.id_publicacion]);
  }

  // Utilidad para obtener el usuario de una publicación
  getUsuarioPublicacion(id_usuario: number): Usuario | undefined {
    return this.usuarios.find(u => u.id_usuario === id_usuario);
  }

  filtroPublicaciones: 'publico' | 'seguidos' = 'publico';

  get publicacionesFiltradas(): Publicacion[] {
    if (this.filtroPublicaciones === 'publico') {
      return this.publicaciones;
    } else {
      // Solo publicaciones de usuarios seguidos
      const idsSeguidos = this.seguimientos
        .filter(s => s.id_usuario_seguidor === this.usuarioActual.id_usuario && s.estado_seguimiento)
        .map(s => s.id_usuario_seguido);
      return this.publicaciones.filter(pub => idsSeguidos.includes(pub.id_usuario));
    }
  }

}
