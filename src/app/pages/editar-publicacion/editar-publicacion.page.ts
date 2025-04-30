import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// Definir las interfaces
interface Usuario {
  id: string;
  username: string;
  userAvatar: string;
  following: boolean;
}

interface Post {
  id: number;
  image: string;
  time: string;
  description: string;
  likes: number;
  liked: boolean;
  guardar: boolean;
  usuario: Usuario;
}

@Component({
  selector: 'app-editar-publicacion',
  templateUrl: './editar-publicacion.page.html',
  styleUrls: ['./editar-publicacion.page.scss'],
  standalone: false,
})
export class EditarPublicacionPage implements OnInit {

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  usuario: Usuario = {
    id: '1',
    username: 'Juan Pérez',
    userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
    following: false,
  };

  postId: string | null = '';
  post!: Post;
  contenido: string = '';
  imagenBase64: string | null = null;
  vistaPreviaVisible: boolean = false;

  // Simulación de publicaciones (esto luego se reemplaza con datos reales de Firebase)
  publicaciones: Post[] = [
    {
      id: 1,
      image: 'https://ionicframework.com/docs/img/demos/card-media.png',
      time: 'Hace 2 horas',
      description: 'Esta es una publicación de prueba para edición.',
      likes: 42,
      liked: false,
      guardar: false,
      usuario: {
        id: '1',
        username: 'Juan Pérez',
        userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
        following: false,
      },
    },
    {
      id: 2,
      image: '',
      time: 'Hace 1 hora',
      description: 'Otra publicación sin imagen.',
      likes: 15,
      liked: false,
      guardar: false,
      usuario: {
        id: '1',
        username: 'Juan Pérez',
        userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
        following: false,
      },
    },
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.postId = params['id'];

      // Buscar la publicación por ID
      const postEncontrado = this.publicaciones.find(p => p.id === +this.postId!);

      if (postEncontrado) {
        this.post = postEncontrado;
        this.contenido = this.post.description;
        this.imagenBase64 = this.post.image || null;
      } else {
        console.warn('Publicación no encontrada');
      }
    });
  }

  eliminarImagen() {
    this.imagenBase64 = null;
  }

  seleccionarArchivo() {
    this.fileInput.nativeElement.click();
  }

  onArchivoSeleccionado(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = () => {
        const base64 = reader.result as string;

        if (file.type.startsWith('image/')) {
          this.imagenBase64 = base64;
        } else {
          console.warn('Solo se permiten imágenes en las publicaciones');
        }
      };

      reader.readAsDataURL(file);
    }
  }

  guardarCambios() {
    if (this.post) {
      this.post.description = this.contenido;
      this.post.image = this.imagenBase64 || '';

      console.log('Cambios guardados:', this.post);
          // Mostrar la vista previa después de guardar
    this.vistaPreviaVisible = true;
    }
  }
}
