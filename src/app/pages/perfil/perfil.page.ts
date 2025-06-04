import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: false,
})
export class PerfilPage implements OnInit {

  @ViewChild('publicacionesNav', { read: ElementRef }) publicacionesNav!: ElementRef;

  // Lista de eventos inscritos
  eventosinscritos = [
    {
      id: 1,
      nombre: 'Campeonato de LoL',
      fecha: '12/05/2025',
      juego: 'League of Legends',
      creador: 'usuario1'
    },
    {
      id: 2,
      nombre: 'Torneo Valorant',
      fecha: '19/05/2025',
      juego: 'Valorant',
      creador: 'usuario2'
    },
  ];

  // Lista de eventos creados
  eventosCreados = [
    {
      id: 1,
      nombre: 'Campeonato de LoL',
      fecha: '12/05/2025',
      juego: 'League of Legends'
    },
    {
      id: 2,
      nombre: 'Torneo Valorant',
      fecha: '19/05/2025',
      juego: 'Valorant'
    }
  ];

  // Información del perfil
  fotoPerfil: string = 'https://ionicframework.com/docs/img/demos/avatar.svg';
  nombreUsuario: string = 'nombre_de_usuario';
  nombreCompleto: string = 'Nombre Completo';
  descripcionBio: string = `🌍 Amante de los viajes | 📸 Capturando momentos\n☕ Café y libros | 🎧 Música 24/7\n📍Chile`;

  // Publicaciones
  publicaciones = [
    { id: 1, img: 'https://raw.githubusercontent.com/R-CoderDotCom/samples/main/bird.png', alt: 'Publicación 1', link: '/detalles-publicacion-personal' },
    { id: 2, img: 'https://ionicframework.com/docs/img/demos/card-media.png', alt: 'Publicación 2', link: '/detalles-publicacion-personal' },
    { id: 3, img: 'https://raw.githubusercontent.com/R-CoderDotCom/samples/main/bird.png', alt: 'Publicación 3', link: '/detalles-publicacion-personal' },
    { id: 4, img: 'https://ionicframework.com/docs/img/demos/card-media.png', alt: 'Publicación 4', link: '/detalles-publicacion-personal' },
    { id: 5, img: 'https://raw.githubusercontent.com/R-CoderDotCom/samples/main/bird.png', alt: 'Publicación 5', link: '/detalles-publicacion-personal' },
    { id: 6, img: 'https://ionicframework.com/docs/img/demos/card-media.png', alt: 'Publicación 6', link: '/detalles-publicacion-personal' },
  ];

  // Estadísticas del perfil
  estadisticas = {
    publicaciones: this.publicaciones.length,
    seguidores: 300,
    seguidos: 180
  };

  // Getters
  get numeroPublicaciones(): number {
    return this.publicaciones.length;
  }

  // Vista actual seleccionada (por defecto: publicaciones)
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

  // Control de modal
  mostrarModal: boolean = false;

  constructor(private actionSheetCtrl: ActionSheetController) {}

  ngOnInit() {
    this.segmentChanged({ detail: { value: this.vistaSeleccionada } });
  }

  ionViewDidEnter() {
    this.applySliderTransform(this.vistaSeleccionada);
  }

  segmentChanged(event: any) {
    const value = event.detail.value;
    this.vistaSeleccionada = value;
    this.applySliderTransform(value);
  }

  applySliderTransform(value: string) {
    const segmentElement = this.publicacionesNav?.nativeElement as HTMLElement;

    if (!segmentElement) {
      console.warn('Elemento publicacionesNav no encontrado');
      return;
    }

   let position = 0;

  switch (value) {
    case 'publicaciones':
      position = 3;
      break;
    case 'eventos-inscritos':
      position = 320 / 3;
      break;
    case 'eventos-creados':
      position = (315 / 3) * 2;
      break;
  }
    const adjustedPosition = position - 1;
    segmentElement.style.setProperty('--slider-transform', `translateX(${position}%)`);
  }

  abrirModal() {
    console.log('Se abrió el modal');
    this.mostrarModal = true;
  }

  cerrarModal(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.mostrarModal = false;
  }

  // Menú de opciones (action sheet)
  async abrirOpciones() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Opciones',
      buttons: [
        {
          text: 'Editar perfil',
          icon: 'person-outline',
          handler: () => {
            console.log('Editar perfil');
            window.location.href = '/editar-perfil';
          }
        },
        {
          text: 'Historial de eventos',
          icon: 'time-outline',
          handler: () => {
            console.log('Historial de eventos');
            window.location.href = '/historial-eventos';
          }
        },
        {
          text: 'Guardados',
          icon: 'bookmark',
          handler: () => {
            console.log('Publicaciones guardadas');
            window.location.href = '/publicaciones-guardadas';
          }
        },
        {
          text: 'Terminos de condicion',
          icon: 'school-outline',
          handler: () => {
            console.log('Validar cuenta institucional');
            window.location.href = '/info-cuenta-institucional';
          }
        },
        {
          text: 'Cerrar sesión',
          icon: 'log-out-outline',
          role: 'destructive',
          handler: () => {
            console.log('Cerrar sesión');
            window.location.href = '/login';
          }
        }
      ]
    });

    await actionSheet.present();
  }
}
