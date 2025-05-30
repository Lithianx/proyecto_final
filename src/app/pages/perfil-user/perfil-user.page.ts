import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-perfil-user',
  templateUrl: './perfil-user.page.html',
  styleUrls: ['./perfil-user.page.scss'],
  standalone: false,
})
export class PerfilUserPage implements OnInit {
  siguiendo: boolean = true;
  mostrarModal: boolean = false;
  vistaSeleccionada: string = 'publicaciones';

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
        this.cargarPerfilUsuario(id);
      }
    });

    // Inicializar el deslizador con el valor por defecto
    this.segmentChanged({ detail: { value: this.vistaSeleccionada } });
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

  segmentChanged(event: any) {
    const value = event.detail.value;
    const segmentElement = document.querySelector('.publicaciones-nav') as HTMLElement;

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
    }

    const adjustedPosition = position - 1; // ajustar si es necesario

    segmentElement.style.setProperty('--slider-transform', `translateX(${adjustedPosition}%)`);

    this.vistaSeleccionada = value;
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
            console.log('Mandar mensaje');
            // Aquí puedes redirigir al chat si lo implementas
            // this.router.navigate(['/chat', this.nombreUsuario]);
          }
        },
        {
          text: 'Reportar',
          role: 'destructive',
          icon: 'alert-circle-outline',
          handler: () => {
            console.log('Reportar usuario');
            // Aquí podrías abrir un modal o redirigir a una página de reporte
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
