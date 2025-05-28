import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular'; // ✅ Importar NavController

@Component({
  selector: 'app-perfil-user',
  templateUrl: './perfil-user.page.html',
  styleUrls: ['./perfil-user.page.scss'],
  standalone: false,
})
export class PerfilUserPage implements OnInit {
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
  siguiendo: boolean = false;
  nombreUsuario: string = 'nombre_de_usuario';
  userId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navCtrl: NavController // ✅ Inyectar NavController
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.userId = params.get('id');
      if (this.userId) {
        this.cargarInformacionUsuario(this.userId);
      }
    });
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

  toggleSeguir() {
    this.siguiendo = !this.siguiendo;
    console.log(this.siguiendo ? 'Ahora sigues al usuario' : 'Has dejado de seguir al usuario');
  }

  verPerfil(id: string) {
    this.router.navigate(['/perfil-user', id]);
  }

  cargarInformacionUsuario(id: string) {
    this.nombreUsuario = `Usuario ${id}`;
  }

  irAlChatPrivado() {
    if (this.userId) {
      this.router.navigate(['/chat-privado', this.userId]);
    } else {
      console.error('ID de usuario no encontrado.');
    }
  }

  volver() {
    this.navCtrl.back(); // ✅ Ahora funciona
  }
}
