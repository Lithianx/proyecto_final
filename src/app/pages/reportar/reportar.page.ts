import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';

// Interfaces
interface Post {
  id: string | number;
  username: string;
  userAvatar: string;
  time: string;
  image: string;
  description: string;
  likes: number;
  liked: boolean;
  guardar: boolean;
}

interface Reporte {
  razon: string;
  detalles: string;
}

@Component({
  selector: 'app-reportar',
  templateUrl: './reportar.page.html',
  styleUrls: ['./reportar.page.scss'],
  standalone: false,
})
export class ReportarPage implements OnInit {

  @ViewChild('reportarContainer', { static: false }) reportarContainer!: ElementRef;

  postId: string | null = '';
  post!: Post;

  alertOptions = {
    header: 'Selecciona una razón',
    message: 'Ayúdanos a entender el problema',
  };

  // Ahora usamos correctamente la interface Reporte
  reporte: Reporte = {
    razon: '',
    detalles: ''
  };

  // Opciones del select
  razonesReporte = [
    { valor: 'contenido_inapropiado', texto: 'Contenido Inapropiado' },
    { valor: 'spam', texto: 'Spam' },
    { valor: 'violencia', texto: 'Violencia' },
    { valor: 'otro', texto: 'Otro' }
  ];

  // Simulación del usuario actual (esto luego vendrá de auth)
  usuarioActual = {
    nombre: 'Usuario Demo',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg'
  };

  constructor(private route: ActivatedRoute, private navCtrl: NavController, private toastCtrl: ToastController) { }

  ngOnInit() {
    // Accede al parámetro 'id' en la ruta
    this.route.params.subscribe(params => {
      this.postId = params['id'];  // Asigna el valor del parámetro 'id'
    });
    this.obtenerPost();
    // Desplazar hacia la sección de comentarios después de cargar
    setTimeout(() => {
      if (this.reportarContainer) {
        this.reportarContainer.nativeElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }

  obtenerPost() {
    this.post = {
      id: this.postId || 1,
      username: 'johndoe',
      userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
      image: 'https://raw.githubusercontent.com/R-CoderDotCom/samples/main/bird.png',
      time: 'Hace 2 horas',
      description: '¡Esa victoria fue épica! 🎮💥',
      likes: 12,
      liked: false,
      guardar: false
    };
  }

  async enviarReporte() {
    if (!this.reporte.razon || !this.reporte.detalles.trim()) {
      console.log('Formulario incompleto');
      return;
    }

    console.log('Reporte enviado:', this.reporte);

      // Limpiar formulario
      this.reporte = {
        razon: '',
        detalles: ''
      };

    // Mostrar Toast
    const toast = await this.toastCtrl.create({
      message: 'Tu reporte ha sido enviado. Gracias por ayudarnos a mantener la comunidad segura.',
      duration: 3000, 
      position: 'bottom', 
      color: 'success' 
    });



    await toast.present();

    this.volver();
  }

  volver() {
    this.navCtrl.back();
  }
}
