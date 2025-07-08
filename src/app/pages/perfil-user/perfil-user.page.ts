import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, NavController } from '@ionic/angular';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Usuario } from 'src/app/models/usuario.model';
import { PublicacionService } from 'src/app/services/publicacion.service';
import { Publicacion } from 'src/app/models/publicacion.model';
import { UtilsService } from 'src/app/services/utils.service';
import { SeguirService } from 'src/app/services/seguir.service';
import { EventoService } from 'src/app/services/evento.service';
import { LocalStorageService } from 'src/app/services/local-storage-social.service';
import { ComunicacionService } from 'src/app/services/comunicacion.service';
import { NotificacionesService } from 'src/app/services/notificaciones.service';
import { Evento } from 'src/app/models/evento.model';
import { Participante } from 'src/app/models/participante.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-perfil-user',
  templateUrl: './perfil-user.page.html',
  styleUrls: ['./perfil-user.page.scss'],
  standalone: false,
})
export class PerfilUserPage implements OnInit {
  @ViewChild('publicacionesNav', { read: ElementRef }) publicacionesNav!: ElementRef;

  publicaciones: Publicacion[] = [];
  publicacionesFiltradas: Publicacion[] = [];

  eventosCreados: (Evento & {
    id: string;
    nombre_juego?: string;
    estado_evento?: string;
    creador_nombre?: string;
  })[] = [];

  eventosInscritos: (Evento & {
    id: string;
    nombre_juego?: string;
    estado_evento?: string;
    creador_nombre?: string;
  })[] = [];

  usuarioActual: Usuario = {
    id_usuario: '0',
    nombre_usuario: '',
    correo_electronico: '',
    fecha_registro: new Date(),
    contrasena: '',
    avatar: '',
    estado_cuenta: true,
    estado_online: true,
    sub_name: '',
    descripcion: '',
    rol: ''
  };

  idUsuario: string = '';
  idUsuarioLogueado: string = '';
  siguiendo: boolean = false;

  fotoPerfil: string = 'https://ionicframework.com/docs/img/demos/avatar.svg';
  nombreUsuario: string = '';
  descripcionBio: string = 'No hay descripcion';
  subname: string = '';

  estadisticas = {
    publicaciones: 0,
    seguidores: 0,
    seguidos: 0
  };

  mostrarModal: boolean = false;

  private _vistaSeleccionada: string = 'publicaciones';
  get vistaSeleccionada(): string {
    return this._vistaSeleccionada;
  }

  set vistaSeleccionada(value: string) {
    this._vistaSeleccionada = value;
    if (value !== 'publicaciones') {
      this.mostrarModal = false;
    }
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private actionSheetCtrl: ActionSheetController,
    private usuarioService: UsuarioService,
    private publicacionService: PublicacionService,
    private utilsService: UtilsService,
    private seguirService: SeguirService,
    private eventoService: EventoService,
    private localStorageService: LocalStorageService,
    private comunicacionService: ComunicacionService,
    private notificacionesService: NotificacionesService,
    private navCtrl: NavController,
  ) {}

  async ngOnInit() {
    this.idUsuarioLogueado = await this.localStorageService.getItem('id_usuario') || '';
  }

  async ionViewWillEnter() {
    this.idUsuario = this.route.snapshot.paramMap.get('id') || '';
    if (!this.idUsuario) return;

    await this.seguirService.cargarSeguimientos();
    await this.cargarDatosUsuario();
    await this.cargarPublicaciones();
    await this.cargarEventosCreados();
    await this.cargarEventosInscritos();
    this.actualizarEstadoSeguir();
    this.actualizarEstadisticasSeguir();
    this.segmentChanged({ detail: { value: this.vistaSeleccionada } });
  }

  private actualizarEstadoSeguir() {
    this.siguiendo = this.seguirService.sigue(this.idUsuarioLogueado, this.idUsuario);
  }

  private actualizarEstadisticasSeguir() {
    const seguimientos = this.seguirService.getSeguimientos();
    const seguidores = seguimientos.filter(s => s.id_usuario_seguido === this.idUsuario && s.estado_seguimiento).length;
    const seguidos = seguimientos.filter(s => s.id_usuario_seguidor === this.idUsuario && s.estado_seguimiento).length;
    this.estadisticas.seguidores = seguidores;
    this.estadisticas.seguidos = seguidos;
  }

  private async cargarDatosUsuario() {
    try {
      const usuario = await this.usuarioService.getUsuarioPorId(this.idUsuario);
      if (!usuario) return;

      this.usuarioActual = usuario;
      this.nombreUsuario = usuario.nombre_usuario;
      this.descripcionBio = usuario.descripcion || 'No hay descripcion';
      this.subname = usuario.sub_name || '';
      this.fotoPerfil = usuario.avatar || this.fotoPerfil;
    } catch (error) {
      console.error('Error cargando datos usuario:', error);
    }
  }

  async cargarPublicaciones() {
    try {
      const todas = await this.publicacionService.getPublicaciones();
      this.publicaciones = todas.filter(p => p.id_usuario === this.idUsuario);
      this.publicacionesFiltradas = [...this.publicaciones];
      this.estadisticas.publicaciones = this.publicaciones.length;
    } catch (error) {
      console.error('Error cargando publicaciones:', error);
    }
  }

  async cargarEventosCreados() {
    try {
      const eventos = await this.eventoService.obtenerEventosPorCreador(this.idUsuario);
      const juegos = await firstValueFrom(this.eventoService.getJuegos());
      const estados = await firstValueFrom(this.eventoService.getEstadosEvento());
      const idFinalizado = estados.find(e => e.descripcion === 'FINALIZADO')?.id_estado_evento;

      this.eventosCreados = await Promise.all(eventos
        .filter(ev => ev.id_estado_evento !== idFinalizado)
        .map(async ev => ({
          ...ev,
          id: ev.id_evento || ev.id,
          nombre_juego: juegos.find(j => j.id_juego === ev.id_juego)?.nombre_juego?.toString() || 'Juego desconocido',
          estado_evento: estados.find(e => e.id_estado_evento === ev.id_estado_evento)?.descripcion || 'Estado desconocido',
          creador_nombre: await this.eventoService.obtenerNombreUsuarioPorId(ev.id_creador)
        })));
    } catch (error) {
      console.error('Error al cargar eventos creados:', error);
    }
  }

  async cargarEventosInscritos() {
    try {
      const participantes: Participante[] = await this.eventoService.obtenerParticipantesEventoPorUsuario(this.idUsuario);
      const inscritos = participantes.filter(p => p.estado_participante === 'INSCRITO');
      const juegos = await firstValueFrom(this.eventoService.getJuegos());
      const estados = await firstValueFrom(this.eventoService.getEstadosEvento());
      const idFinalizado = estados.find(e => e.descripcion === 'FINALIZADO')?.id_estado_evento;

      this.eventosInscritos = [];

      for (const p of inscritos) {
        try {
          const ev = await this.eventoService.obtenerEventoPorId(p.id_evento);
          if (ev.id_estado_evento === idFinalizado) continue;

          this.eventosInscritos.push({
            ...ev,
            id: ev.id_evento || ev.id,
            nombre_juego: juegos.find(j => j.id_juego === ev.id_juego)?.nombre_juego?.toString() || 'Juego desconocido',
            estado_evento: estados.find(e => e.id_estado_evento === ev.id_estado_evento)?.descripcion || 'Estado desconocido',
            creador_nombre: await this.eventoService.obtenerNombreUsuarioPorId(ev.id_creador)
          });
        } catch {
          console.warn('Evento eliminado o inaccesible:', p.id_evento);
        }
      }
    } catch (error) {
      console.error('Error cargando eventos inscritos:', error);
    }
  }

  segmentChanged(event: any) {
    this.vistaSeleccionada = event.detail.value;
    this.applySliderTransform(this.vistaSeleccionada);
  }

  ionViewDidEnter() {
    this.applySliderTransform(this.vistaSeleccionada);
  }

  applySliderTransform(value: string) {
    const element = this.publicacionesNav?.nativeElement;
    if (!element) return;

    let pos = 0;
    switch (value) {
      case 'publicaciones': pos = 3; break;
      case 'eventos-inscritos': pos = 320 / 3; break;
      case 'eventos-creados': pos = (315 / 3) * 2; break;
    }

    element.style.setProperty('--slider-transform', `translateX(${pos}%)`);
  }

  async abrirOpciones() {
    const sheet = await this.actionSheetCtrl.create({
      header: 'Opciones',
      buttons: [
        {
          text: this.siguiendo ? 'Dejar de seguir' : 'Seguir',
          icon: this.siguiendo ? 'person-remove-outline' : 'person-add-outline',
          handler: () => this.seguir()
        },
        {
          text: 'Mandar mensaje',
          icon: 'chatbubble-ellipses-outline',
          handler: async () => {
            const id = await this.comunicacionService.obtenerOcrearConversacionPrivada(this.idUsuarioLogueado, this.idUsuario);
            this.navCtrl.navigateForward(['/chat-privado', id]);
          }
        },
        {
          text: 'Reportar',
          role: 'destructive',
          icon: 'alert-circle-outline',
          handler: () => this.router.navigate(['/reportar-cuenta', this.idUsuario])
        },
        {
          text: 'Cancelar',
          icon: 'close-outline',
          role: 'cancel'
        }
      ]
    });
    await sheet.present();
  }

  async seguir() {
    const idSeguidor = this.idUsuarioLogueado;
    const idSeguido = this.idUsuario;
    const yaSigue = this.seguirService.sigue(idSeguidor, idSeguido);

    try {
      await this.seguirService.toggleSeguir(idSeguidor, idSeguido);
      await this.seguirService.cargarSeguimientos();
      this.siguiendo = !yaSigue;
      this.actualizarEstadisticasSeguir();

      if (!yaSigue) {
        await this.notificacionesService.crearNotificacion('Comenzo a seguirte', idSeguidor, idSeguido);
      } else {
        await this.notificacionesService.eliminarNotificacion('Comenzo a seguirte', idSeguidor, idSeguido);
      }
    } catch (error) {
      console.error('Error en la acción de seguir:', error);
    }
  }

  comentario(publicacion: Publicacion) {
    this.router.navigate(['/comentario', publicacion.id_publicacion]);
  }

  compartir(publicacion: Publicacion) {
    this.utilsService.compartirPublicacion(publicacion);
  }

  opcion(publicacion: Publicacion) {
    this.actionSheetCtrl.create({
      header: 'Opciones',
      buttons: [
        {
          text: 'Compartir',
          icon: 'share-outline',
          handler: () => this.compartir(publicacion)
        },
        {
          text: 'Reportar',
          role: 'destructive',
          icon: 'alert-circle-outline',
          handler: () => this.router.navigate(['/reportar', publicacion.id_publicacion])
        },
        {
          text: 'Cancelar',
          icon: 'close-outline',
          role: 'cancel'
        }
      ]
    }).then(sheet => sheet.present());
  }

  volver() {
    this.navCtrl.back();
  }
}
