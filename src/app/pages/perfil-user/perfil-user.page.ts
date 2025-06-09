import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-perfil-user',
  templateUrl: './perfil-user.page.html',
  styleUrls: ['./perfil-user.page.scss'],
  standalone: false,
})
export class PerfilUserPage implements OnInit {
  @ViewChild('publicacionesNav', { read: ElementRef }) publicacionesNav!: ElementRef;
  idUsuario: string = '';

  siguiendo: boolean = true;
  mostrarModal: boolean = false;
  private _vistaSeleccionada: string = 'publicaciones';

  // Variables del perfil
  nombreUsuario: string = '';
  nombreCompleto: string = '';
  descripcionBio: string = '';
  fotoPerfil: string = '';
  publicaciones: any[] = [];
  eventosinscritos: any[] = [];
  eventosCreados: any[] = [];
  estadisticas = {
    publicaciones: 0,
    seguidores: 0,
    seguidos: 0
  };

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
    private actionSheetCtrl: ActionSheetController
  ) {}

  ngOnInit() {
    // Escuchar cambios en el parámetro id
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      console.log('ID de usuario:', id);

      if (id) {
        this.idUsuario = id; // ✅ Asignación del ID para navegación posterior
        this.cargarPerfilUsuario(id);
      }
    });

    // Inicializar el deslizador con el valor por defecto
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
        position = 0;
        break;
      case 'eventos-inscritos':
        position = 33.33;
        break;
      case 'eventos-creados':
        position = 66.66;
        break;
    }

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

  cargarPerfilUsuario(id: string) {
    // Simulación (reemplazar con servicio real)
    if (id === '1') {
      this.nombreUsuario = 'maria_gamer';
      this.nombreCompleto = 'María Rodríguez';
      this.descripcionBio = '🎮 Streamer de LoL | Amante de los gatos 🐱';
      this.fotoPerfil = 'https://i.pravatar.cc/150?img=12';

      this.publicaciones = [
        { id: 1, img: 'https://picsum.photos/id/1011/300/300', alt: 'Post 1', link: '/detalles-publicacion-personal' },
        { id: 2, img: 'https://picsum.photos/id/1012/300/300', alt: 'Post 2', link: '/detalles-publicacion-personal' }
      ];

      this.eventosinscritos = [
        { id: 1, nombre: 'Clash Royale Night', fecha: '10/06/2025', juego: 'Clash Royale', creador: 'andres_dev' }
      ];

      this.eventosCreados = [
        { id: 99, nombre: 'League Grand Finals', fecha: '22/06/2025', juego: 'League of Legends' }
      ];

      this.estadisticas = {
        publicaciones: this.publicaciones.length,
        seguidores: 800,
        seguidos: 320
      };
    }
  }

  async abrirOpciones() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Opciones',
      buttons: [
        {
          text: this.siguiendo ? 'Dejar de seguir' : 'Seguir',
          icon: this.siguiendo ? 'person-remove-outline' : 'person-add-outline',
          handler: () => {
            this.siguiendo = !this.siguiendo;
            console.log(this.siguiendo ? 'Ahora estás siguiendo' : 'Has dejado de seguir');
          }
        },
        {
          text: 'Mandar mensaje',
          icon: 'chatbubble-ellipses-outline',
          handler: () => {
            console.log('Mandar mensaje a ID:', this.idUsuario);
            this.router.navigate(['/chat-privado', this.idUsuario]);
          }
        },
        {
          text: 'Reportar',
          role: 'destructive',
          icon: 'alert-circle-outline',
          handler: () => {
            console.log('Reportar usuario');
            this.router.navigate(['/reportar-cuenta', this.idUsuario]); // ✅ Usa el ID recibido
          }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }
}
