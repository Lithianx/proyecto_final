import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { Usuario } from 'src/app/models/usuario.model';
import { Publicacion } from 'src/app/models/publicacion.model';


@Component({
  selector: 'app-crear-publicacion',
  templateUrl: './crear-publicacion.page.html',
  styleUrls: ['./crear-publicacion.page.scss'],
  standalone: false,
})
export class CrearPublicacionPage implements OnInit {

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  // Usuario simulado (ajustado al modelo real)
  usuario: Usuario = {
    id_usuario: 1,
    nombre_usuario: 'Juan Pérez',
    correo_electronico: 'juan@correo.com',
    fecha_registro: new Date(),
    contrasena: '',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
    estado_cuenta: true,
    estado_online: true
  };


  contenido: string = '';
  imagenBase64: string | null = null;
  mostrarDescripcion: boolean = false;

  publicaciones: Publicacion[] = []; // Lista de publicaciones creadas

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
    const nuevaPublicacion: Publicacion = {
      id_publicacion: this.publicaciones.length + 1,
      id_usuario: this.usuario.id_usuario, // Relaciona la publicación con el usuario actual
      contenido: this.contenido || '', // Si no hay contenido, se guarda como cadena vacía
      imagen: this.imagenBase64 || '', // Si no hay imagen, se guarda como cadena vacía
      fecha_publicacion: new Date(),
    };



    this.publicaciones.push(nuevaPublicacion);

    console.log('Publicación creada:', nuevaPublicacion);

    this.contenido = '';
    this.imagenBase64 = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  // Función para navegar a la pantalla de edición
  modificar(post: Publicacion) {
    this.router.navigate(['/editar-publicacion',post.id_publicacion]);
  }
}
