import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

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
  selector: 'app-crear-publicacion',
  templateUrl: './crear-publicacion.page.html',
  styleUrls: ['./crear-publicacion.page.scss'],
  standalone: false,
})
export class CrearPublicacionPage implements OnInit {

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  // Usuario simulado
  usuario: Usuario = {
    id: '1',
    username: 'Juan Pérez',
    userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
    following: false,
  };

  contenido: string = '';
  imagenBase64: string | null = null;
  mostrarDescripcion: boolean = false;

  publicaciones: Post[] = []; // Lista de publicaciones creadas

  constructor(private router: Router) { }

  ngOnInit() {
  }

  // Función para seleccionar archivo de imagen
  seleccionarArchivo() {
    this.fileInput.nativeElement.click();
  }

  // Función que se ejecuta al seleccionar un archivo
  onArchivoSeleccionado(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = () => {
        const base64 = reader.result as string;

        // Solo permitimos imagen para publicaciones, no video
        if (file.type.startsWith('image/')) {
          this.imagenBase64 = base64;
        } else {
          console.warn('Solo se permiten imágenes en las publicaciones');
        }
      };

      reader.readAsDataURL(file);
    }
  }

  // Función para crear la publicación
  publicar() {
    if (!this.contenido.trim() && !this.imagenBase64) return;

    const nuevaPublicacion: Post = {
      id: this.publicaciones.length + 1, // Asigna un ID secuencial
      image: this.imagenBase64!,
      time: new Date().toLocaleString(),
      description: this.contenido,
      likes: 0,
      liked: false,
      guardar: false,
      usuario: this.usuario, // Asocia el usuario actual a la publicación
    };

    // Agregar a la lista de publicaciones
    this.publicaciones.push(nuevaPublicacion);

    console.log('Publicación creada:', nuevaPublicacion);

    // Limpiar los campos después de publicar
    this.contenido = '';
    this.imagenBase64 = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  // Función para navegar a la pantalla de edición
  modificar(post: Post) {
    this.router.navigate(['/editar-publicacion',post.id]);
  }
}
