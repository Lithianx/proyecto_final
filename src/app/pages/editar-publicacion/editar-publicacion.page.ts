import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Usuario } from 'src/app/models/usuario.model';
import { Publicacion } from 'src/app/models/publicacion.model';


@Component({
  selector: 'app-editar-publicacion',
  templateUrl: './editar-publicacion.page.html',
  styleUrls: ['./editar-publicacion.page.scss'],
  standalone: false,
})
export class EditarPublicacionPage implements OnInit {

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

  postId!: number;
  publicacion!: Publicacion;
  contenido: string = '';
  imagenBase64: string | null = null;
  vistaPreviaVisible: boolean = false;

  // Simulación de publicaciones (ajustado al modelo real)
  publicaciones: Publicacion[] = [
    {
      id_publicacion: 1,
      id_usuario: 1,
      contenido: 'Esta es una publicación de prueba para edición.',
      imagen: 'https://ionicframework.com/docs/img/demos/card-media.png',
      fecha_publicacion: new Date(),
    },
    {
      id_publicacion: 2,
      id_usuario: 1,
      contenido: 'Otra publicación sin imagen.',
      imagen: '',
      fecha_publicacion: new Date(),
    },
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.postId = Number(params['id']);

      // Buscar la publicación por ID
      const publicacionEncontrada = this.publicaciones.find(p => p.id_publicacion === +this.postId!);

      if (publicacionEncontrada) {
        this.publicacion = publicacionEncontrada;
        this.contenido = this.publicacion.contenido;
        this.imagenBase64 = this.publicacion.imagen || null;
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
    if (this.publicacion) {
      this.publicacion.contenido = this.contenido;
      this.publicacion.imagen = this.imagenBase64 || '';

      console.log('Cambios guardados:', this.publicacion);
          // Mostrar la vista previa después de guardar
    this.vistaPreviaVisible = true;
    }
  }
}
