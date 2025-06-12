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

import { UsuarioService } from 'src/app/services/usuario.service';
import { PublicacionService } from 'src/app/services/publicacion.service';
import { GuardaPublicacionService } from 'src/app/services/guardarpublicacion.service';
import { LikeService } from 'src/app/services/like.service';
import { SeguirService } from 'src/app/services/seguir.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {

  usuarioActual: Usuario = {
    id_usuario: '0', // string
    nombre_usuario: 'Usuario Demo',
    correo_electronico: 'demo@correo.com',
    fecha_registro: new Date(),
    contrasena: '',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
    estado_cuenta: true,
    estado_online: true
  };

  publicaciones: Publicacion[] = [];
  descripcionExpandida: { [id: string]: boolean } = {}; // string key

  usuarios: Usuario[] = [];

  seguimientos: Seguir[] = [];

  publicacionesLikes: Like[] = [];
  publicacionesGuardadas: GuardaPublicacion[] = [];

  isModalOpen: boolean = false;
  selectedPublicacion: Publicacion | undefined;

  modalCompartirAbierto: boolean = false;
  publicacionCompartir: Publicacion | null = null;

  publicacionesAmigos: Publicacion[] = [];
  followersfriend: Usuario[] = [];

  imagenSeleccionada: string | null = null;

  filtroPublicaciones: 'publico' | 'seguidos' = 'publico';

  constructor(
    private actionSheetCtrl: ActionSheetController,
    private modalController: ModalController,
    private router: Router,
    private localStorage: LocalStorageService,
    private likeService: LikeService,
    private seguirService: SeguirService,
    private guardaPublicacionService: GuardaPublicacionService,
    private publicacionService: PublicacionService,
    private usuarioService: UsuarioService,
    private UtilsService: UtilsService
  ) { }

  toggleDescripcion(id: string) {
    this.descripcionExpandida[id] = !this.descripcionExpandida[id];
  }

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

    // Usuarios
    await this.usuarioService.cargarUsuarios();
    this.usuarios = this.usuarioService.getUsuarios();

  // Publicaciones en tiempo real
this.publicacionService.publicaciones$.subscribe(publicaciones => {
  this.publicaciones = publicaciones.map(pub => ({
    ...pub,
    fecha_publicacion: pub.fecha_publicacion instanceof Date
      ? pub.fecha_publicacion
      : (pub.fecha_publicacion && typeof (pub.fecha_publicacion as any).toDate === 'function'
          ? (pub.fecha_publicacion as any).toDate()
          : new Date(pub.fecha_publicacion))
  }));
  // Ordenar publicaciones por fecha descendente
  this.publicaciones.sort((a, b) => b.fecha_publicacion.getTime() - a.fecha_publicacion.getTime());
  this.publicacionesAmigos = [...this.publicaciones];
});

  // Likes de publicaciones en tiempo real
  this.likeService.likesPublicaciones$.subscribe(likes => {
    this.publicacionesLikes = likes;
  });

    // Guardados
    await this.guardaPublicacionService.cargarGuardados();
    this.publicacionesGuardadas = this.guardaPublicacionService.getGuardados();

    // Seguimientos
    await this.seguirService.cargarSeguimientos();
    this.seguimientos = this.seguirService.getSeguimientos();

    // Carga publicaciones de amigos
    this.followersfriend = this.seguirService.getUsuariosSeguidos(this.usuarios, this.usuarioActual.id_usuario);

    this.publicacionesAmigos = [...this.publicaciones];
  }

  // Método para refrescar la lista de publicaciones
async doRefresh(event: any) {
  // Refresca solo datos NO observables
  await this.usuarioService.cargarUsuarios();
  this.usuarios = this.usuarioService.getUsuarios();

  await this.guardaPublicacionService.cargarGuardados();
  this.publicacionesGuardadas = this.guardaPublicacionService.getGuardados();

  await this.seguirService.cargarSeguimientos();
  this.seguimientos = this.seguirService.getSeguimientos();
  this.followersfriend = this.seguirService.getUsuariosSeguidos(this.usuarios, this.usuarioActual.id_usuario);

  setTimeout(() => {
    event.target.complete();
  }, 1000);
}

  // Dar o quitar like
async likePublicacion(publicacion: Publicacion) {
  await this.likeService.toggleLike(this.usuarioActual.id_usuario, publicacion.id_publicacion);
}

  // Métodos síncronos para la vista
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
    this.followersfriend = this.seguirService.getUsuariosSeguidos(this.usuarios, this.usuarioActual.id_usuario);
  }

  sigueAlAutor(publicacion: Publicacion): boolean {
    return this.seguirService.sigue(this.usuarioActual.id_usuario, publicacion.id_usuario);
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
    await this.UtilsService.compartirPublicacion(publicacion);
  }

  comentario(publicacion: Publicacion) {
    this.router.navigate(['/comentario', publicacion.id_publicacion]);
  }

  irAReportar(publicacion: Publicacion) {
    this.router.navigate(['/reportar', publicacion.id_publicacion]);
  }

  // Utilidad para obtener el usuario de una publicación
  getUsuarioPublicacion(id_usuario: string): Usuario | undefined {
    return this.usuarioService.getUsuarioPorId(id_usuario);
  }

  get publicacionesFiltradas(): Publicacion[] {
    return this.publicacionService.getPublicacionesFiltradas(
      this.publicaciones,
      this.seguimientos,
      this.usuarioActual.id_usuario,
      this.filtroPublicaciones
    );
  }

}