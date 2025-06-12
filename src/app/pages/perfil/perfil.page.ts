import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { Router } from '@angular/router';
import { UsuarioService } from 'src/app/services/usuario.service';

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
    { id: 1, nombre: 'Campeonato de LoL', fecha: '12/05/2025', juego: 'League of Legends', creador: 'usuario1' },
    { id: 2, nombre: 'Torneo Valorant', fecha: '19/05/2025', juego: 'Valorant', creador: 'usuario2' },
  ];

  // Lista de eventos creados
  eventosCreados = [
    { id: 1, nombre: 'Campeonato de LoL', fecha: '12/05/2025', juego: 'League of Legends' },
    { id: 2, nombre: 'Torneo Valorant', fecha: '19/05/2025', juego: 'Valorant' }
  ];

  fotoPerfil: string = 'https://ionicframework.com/docs/img/demos/avatar.svg';
  nombreUsuario: string = 'nombre_de_usuario';
  nombreCompleto: string = 'Nombre Completo';
  descripcionBio: string = `🌍 Amante de los viajes | 📸 Capturando momentos\n☕ Café y libros | 🎧 Música 24/7\n📍Chile`;

  publicaciones = [
    { id: 1, img: 'https://raw.githubusercontent.com/R-CoderDotCom/samples/main/bird.png', alt: 'Publicación 1', link: '/detalles-publicacion-personal' },
    { id: 2, img: 'https://ionicframework.com/docs/img/demos/card-media.png', alt: 'Publicación 2', link: '/detalles-publicacion-personal' },
    { id: 3, img: 'https://raw.githubusercontent.com/R-CoderDotCom/samples/main/bird.png', alt: 'Publicación 3', link: '/detalles-publicacion-personal' },
    { id: 4, img: 'https://ionicframework.com/docs/img/demos/card-media.png', alt: 'Publicación 4', link: '/detalles-publicacion-personal' },
    { id: 5, img: 'https://raw.githubusercontent.com/R-CoderDotCom/samples/main/bird.png', alt: 'Publicación 5', link: '/detalles-publicacion-personal' },
    { id: 6, img: 'https://ionicframework.com/docs/img/demos/card-media.png', alt: 'Publicación 6', link: '/detalles-publicacion-personal' },
  ];

  estadisticas = {
    publicaciones: this.publicaciones.length,
    seguidores: 300,
    seguidos: 180
  };

  get numeroPublicaciones(): number {
    return this.publicaciones.length;
  }

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

  mostrarModal: boolean = false;

  constructor(
    private actionSheetCtrl: ActionSheetController,
    private router: Router,
    private usuarioService: UsuarioService
  ) { }

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
        position = 320 / 3; // ~33.33%
        break;
      case 'eventos-creados':
        position = (315 / 3) * 2; // ~66.66%
        break;


        const adjustedPosition = position - 1; // ajustar si es necesario
    }

    segmentElement.style.setProperty('--slider-transform', `translateX(${position}%)`);
  }

  abrirModal() {
    console.log('Se abrió el modal');
    this.mostrarModal = true;
  }

  cerrarModal(event?: Event) {
    if (event) event.stopPropagation();
    this.mostrarModal = false;
  }

  async abrirOpciones() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Opciones',
      buttons: [
        {
          text: 'Editar perfil',
          icon: 'person-outline',
          handler: () => {
            console.log('Editar perfil');
            this.router.navigate(['/editar-perfil']);
          }
        },
        {
          text: 'Historial de eventos',
          icon: 'time-outline',
          handler: () => {
            console.log('Historial de eventos');
            this.router.navigate(['/historial-eventos']);
          }
        },
        {
          text: 'Guardados',
          icon: 'bookmark',
          handler: () => {
            console.log('Publicaciones guardadas');
            this.router.navigate(['/publicaciones-guardadas']);
          }
        },
        {
          text: 'Términos y condiciones',
          icon: 'school-outline',
          handler: () => {
            console.log('Validar cuenta institucional');
            this.router.navigate(['/info-cuenta-institucional']);
          }
        },
        {
          text: 'Cerrar sesión',
          icon: 'log-out-outline',
          role: 'destructive',
          cssClass: 'cerrar-sesion-btn',
          handler: async () => {
            console.log('Cerrar sesión');
            await this.usuarioService.logout(); // <-- Cierra sesión en Firebase y limpia localStorage
            this.router.navigate(['/login']);
          }
        }
      ]
    });

    await actionSheet.present();
  }
  comentario(publicacion: any) {
    this.router.navigate(['/comentario', publicacion.id]);
  }
}
