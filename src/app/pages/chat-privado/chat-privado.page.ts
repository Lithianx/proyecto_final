import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VoiceRecorder } from 'capacitor-voice-recorder';
import { Keyboard } from '@capacitor/keyboard';

import { Usuario } from 'src/app/models/usuario.model';
import { Mensaje } from 'src/app/models/mensaje.model';

import { UtilsService } from 'src/app/services/utils.service';
import { LocalStorageService } from 'src/app/services/local-storage-social.service';
import { ComunicacionService } from 'src/app/services/comunicacion.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { FirebaseStorageService } from 'src/app/services/firebase-storage.service';

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';
import { IonContent, ToastController } from '@ionic/angular';
import { Conversacion } from 'src/app/models/conversacion.model';

@Component({
  selector: 'app-chat-privado',
  templateUrl: './chat-privado.page.html',
  styleUrls: ['./chat-privado.page.scss'],
  standalone: false,
})
export class ChatPrivadoPage implements OnInit, OnDestroy {
  private mensajesSub?: Subscription;
  private conversacionesSub?: Subscription;

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  @ViewChild('audioInput', { static: false }) audioInput!: ElementRef;
  @ViewChild('videoInput') videoInput!: ElementRef<HTMLInputElement>;
  @ViewChild('endOfMessages') endOfMessages!: ElementRef;
  @ViewChild('mensajeInput') mensajeInput!: ElementRef<HTMLTextAreaElement>;
  @ViewChild(IonContent, { static: false }) ionContent!: IonContent;

  chatId: string | null = '';
  chatInfo!: Usuario;
  idConversacionActual!: string;
  nuevoMensaje: string = '';

  grabando: boolean = false;
  mediaRecorder: any;
  audioChunks: any[] = [];
  audioBlob: Blob | null = null;

  usuarioActual!: Usuario;
  usuarios: Usuario[] = [];
  mensajes: Mensaje[] = [];
  mensajesOffline: Mensaje[] = [];
  mensajesCombinados: Mensaje[] = [];

  // Scroll infinito
  todosLosMensajes: Mensaje[] = [];
  mensajesMostrados = 30;
  incrementoMensajes = 30;
  cargandoMas = false;

  // Control para saber si el chat está activo
  private chatActivo = false;

  imagenSeleccionada: string | null = null;
  videoSeleccionado: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private localStorage: LocalStorageService,
    private comunicacionService: ComunicacionService,
    private usuarioService: UsuarioService,
    private firebaseStorageService: FirebaseStorageService,
    private cdRef: ChangeDetectorRef,
    private utilsService: UtilsService,
    private toastController: ToastController
  ) { }

  // Función para validar el tamaño de la imagen
  private validateImageSize(base64String: string): boolean {
    const sizeInBytes = (base64String.length * 3) / 4;
    const sizeInMB = sizeInBytes / (1024 * 1024);
    return sizeInMB <= 5;
  }

  // Función para mostrar información del tamaño de la imagen
  private getImageSizeInfo(base64String: string): string {
    const sizeInBytes = (base64String.length * 3) / 4;
    const sizeInMB = sizeInBytes / (1024 * 1024);
    
    if (sizeInMB < 1) {
      return `${(sizeInMB * 1024).toFixed(0)} KB`;
    } else {
      return `${sizeInMB.toFixed(1)} MB`;
    }
  }

  private convertirFecha(fecha: any): Date {
    if (fecha instanceof Date) return fecha;
    if (fecha && typeof fecha.toDate === 'function') return fecha.toDate();
    return new Date(fecha);
  }

  async ngOnInit() {
    await this.cargarDatosChat();
  }

  /**
   * Se ejecuta cada vez que se abre la página del chat.
   * Esto asegura que los mensajes y notificaciones se actualicen al entrar al chat.
   */
  async ionViewWillEnter() {
    this.chatActivo = true; // Activar el chat
    await this.cargarDatosChat();
    // Marcar mensajes como vistos al entrar al chat
    await this.marcarMensajesRecibidosComoVistos();
  }

  /**
   * Se ejecuta cuando la página vuelve a estar visible (por ejemplo, al volver de otra app)
   */
  async ionViewDidEnter() {
    // Asegurar que el chat esté marcado como activo
    this.chatActivo = true;
    // Marcar mensajes como vistos al volver a la página
    await this.marcarMensajesRecibidosComoVistos();
  }

  /**
   * Método centralizado para cargar todos los datos del chat
   */
  private async cargarDatosChat() {
    // Cargar usuario actual
    const usuario = await this.usuarioService.getUsuarioActualConectado();
    if (usuario) {
      this.usuarioActual = usuario;
      const usuarioMinimo = {
        id_usuario: usuario.id_usuario,
        nombre_usuario: usuario.nombre_usuario,
        avatar: usuario.avatar,
        rol: usuario.rol,
        correo_electronico: usuario.correo_electronico,
      };
      await this.localStorage.setItem('usuarioActual', usuarioMinimo);
    } else {
      return;
    }

    // Cargar usuarios reales
    await this.usuarioService.cargarUsuarios();
    this.usuarios = this.usuarioService.getUsuarios();

    this.idConversacionActual = this.route.snapshot.paramMap.get('id') ?? '';

    // Desuscribirse de suscripciones anteriores para evitar duplicados
    this.mensajesSub?.unsubscribe();
    this.conversacionesSub?.unsubscribe();

    // Verifica conexión
    const online = await this.utilsService.checkInternetConnection();

    if (online) {
      this.mensajesSub = this.comunicacionService.mensajes$.subscribe(async mensajesOnline => {
        // DESCIFRA los mensajes online
        const mensajesDescifrados = await this.comunicacionService.getMensajesDescifrados(mensajesOnline);
        this.mensajes = mensajesDescifrados
          .filter(m => m.id_conversacion === this.idConversacionActual)
          .map(m => ({
            ...m,
            fecha_envio: m.fecha_envio instanceof Date
              ? m.fecha_envio
              : (m.fecha_envio && typeof (m.fecha_envio as any).toDate === 'function'
                ? (m.fecha_envio as any).toDate()
                : new Date(m.fecha_envio))
          }));

        // DESCIFRA los mensajes offline
        this.mensajesOffline = (await this.comunicacionService.getMensajesOfflineDescifrados()).filter(
          m => m.id_conversacion === this.idConversacionActual &&
            m.id_usuario_emisor === this.usuarioActual.id_usuario
        ) || [];

        this.mensajesCombinados = [
          ...this.mensajes,
          ...this.mensajesOffline
        ].sort((a, b) => {
          const fechaA = this.convertirFecha(a.fecha_envio);
          const fechaB = this.convertirFecha(b.fecha_envio);
          return fechaA.getTime() - fechaB.getTime();
        });

        this.cdRef.detectChanges();

        if (!this.cargandoMas) {
          this.scrollToBottom(true);
        } else {
          this.cargandoMas = false;
        }

        // Solo marcar mensajes como vistos si el chat está activo
        if (this.chatActivo) {
          await this.marcarMensajesRecibidosComoVistos();
        }
      });

      // Busca la conversación actual y el usuario receptor real (online)
      this.conversacionesSub = this.comunicacionService.conversaciones$.subscribe(conversaciones => {
        const conversacion = conversaciones.find(
          c => String(c.id_conversacion) === this.idConversacionActual
        );

        let idUsuarioContraparte = conversacion?.id_usuario_emisor;
        if (idUsuarioContraparte === this.usuarioActual.id_usuario) {
          idUsuarioContraparte = conversacion?.id_usuario_receptor;
        }

        this.chatInfo = this.usuarios.find(u => String(u.id_usuario) === String(idUsuarioContraparte))!;
      });

    } else {
      // SIN internet: DESCIFRA los mensajes locales y offline
      const mensajesLocales = await this.comunicacionService.getMensajesLocales();
      const mensajesLocalesDescifrados = await this.comunicacionService.getMensajesDescifrados(mensajesLocales);
      this.mensajes = mensajesLocalesDescifrados
        .filter(m => m.id_conversacion === this.idConversacionActual)
        .map(m => ({
          ...m,
          fecha_envio: m.fecha_envio instanceof Date
            ? m.fecha_envio
            : (m.fecha_envio && typeof (m.fecha_envio as any).toDate === 'function'
              ? (m.fecha_envio as any).toDate()
              : new Date(m.fecha_envio))
        }));

      this.mensajesOffline = (await this.comunicacionService.getMensajesOfflineDescifrados()).filter(
        m => m.id_conversacion === this.idConversacionActual &&
          m.id_usuario_emisor === this.usuarioActual.id_usuario
      ) || [];

      this.mensajesCombinados = [
        ...this.mensajes,
        ...this.mensajesOffline
      ].sort((a, b) => {
        const fechaA = this.convertirFecha(a.fecha_envio);
        const fechaB = this.convertirFecha(b.fecha_envio);
        return fechaA.getTime() - fechaB.getTime();
      });

      // Cargar conversaciones y usuario receptor desde localStorage
      const conversacionesLocales: Conversacion[] = await this.comunicacionService.getConversacionesLocales();
      const conversacion = conversacionesLocales.find(
        c => String(c.id_conversacion) === this.idConversacionActual
      );

      let idUsuarioContraparte = conversacion?.id_usuario_emisor;
      if (idUsuarioContraparte === this.usuarioActual.id_usuario) {
        idUsuarioContraparte = conversacion?.id_usuario_receptor;
      }
      this.chatInfo = this.usuarios.find(u => String(u.id_usuario) === String(idUsuarioContraparte))!;

      this.cdRef.detectChanges();
      if (!this.cargandoMas) {
        this.scrollToBottom(true);
      } else {
        this.cargandoMas = false;
      }
    }
    console.log('mensajesCombinados', this.mensajesCombinados);
    console.log('mensajes', this.mensajes);
    console.log('mensajesOffline', this.mensajesOffline);

    // Recalcular el contador de mensajes no vistos después de cargar los datos
    await this.comunicacionService.recalcularContadorMensajesNoVistos();
  }

  verImagen(publicacion: { imagen: string }) {
    this.imagenSeleccionada = publicacion.imagen ?? null;
  }


  abrirPublicacion(publicacion: any) {
    if (publicacion && publicacion.id_publicacion) {
      this.router.navigate(['/comentario', publicacion.id_publicacion]);
    }
  }

  verVideo(videoUrl: string) {
    this.videoSeleccionado = videoUrl;
  }

  cerrarVisor() {
    this.imagenSeleccionada = null;
    this.videoSeleccionado = null;
  }


  // Scroll infinito: cargar más mensajes al hacer scroll arriba
  onScroll(event: any) {
    const scrollTop = event.detail.scrollTop;
    if (scrollTop === 0 && this.mensajes.length < this.todosLosMensajes.length) {
      this.cargarMasMensajes();
    }
  }

  async cargarMasMensajes() {
    if (this.cargandoMas) return;
    this.cargandoMas = true;

    const chatContainer = document.querySelector('.chat-container') as HTMLElement;
    const prevScrollHeight = chatContainer?.scrollHeight || 0;

    this.mensajesMostrados = Math.min(
      this.mensajesMostrados + this.incrementoMensajes,
      this.todosLosMensajes.length
    );

    this.mensajes = this.todosLosMensajes.slice(-this.mensajesMostrados);

    requestAnimationFrame(() => {
      setTimeout(() => {
        const newScrollHeight = chatContainer.scrollHeight;
        const scrollDiff = newScrollHeight - prevScrollHeight;

        this.ionContent.scrollByPoint(0, scrollDiff, 0); // sin animación
        this.cargandoMas = false;
      }, 50);
    });
  }

  async marcarMensajesRecibidosComoVistos() {
    // Solo marcar mensajes como vistos si el chat está activo
    if (!this.chatActivo) {
      return;
    }

    const mensajesNoVistos = this.mensajes.filter(
      m =>
        m.id_usuario_emisor !== this.usuarioActual.id_usuario &&
        !m.estado_visto
    );
    if (mensajesNoVistos.length > 0) {
      await this.comunicacionService.marcarMensajesComoVistos(
        mensajesNoVistos,
        this.idConversacionActual,
        this.usuarioActual.id_usuario
      );
      
      // Actualizar el estado local inmediatamente para que el contador se refleje de inmediato
      mensajesNoVistos.forEach(mensaje => {
        mensaje.estado_visto = true;
      });
      
      // Recalcular el contador de mensajes no vistos
      await this.comunicacionService.recalcularContadorMensajesNoVistos();
      
      // Forzar detección de cambios
      this.cdRef.detectChanges();
    }
  }

  autoResize(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.mensajeInput?.nativeElement.focus();
    }, 300);
  }

  ngAfterViewChecked() {
    //   this.scrollToBottom();
  }

  scrollToBottom(instant: boolean = false) {
    setTimeout(() => {
      try {
        this.endOfMessages?.nativeElement.scrollIntoView({ behavior: instant ? 'auto' : 'smooth' });
      } catch (e) { }
    }, 100);
  }

  onImageLoad() {
    if (!this.cargandoMas) {
      this.scrollToBottom();
    }
  }

  onMediaLoad() {
    if (!this.cargandoMas) {
      this.scrollToBottom();
    }
  }

  imagenBase64: string | null = null;
  mostrarModalArchivos = false;

  abrirBuscadorGiphy() {
    this.mostrarModalArchivos = false;
    setTimeout(() => {
      this.mostrarBuscadorGiphy = true;
    }, 200);
  }

  giphyResults: any[] = [];

  async buscarGiphy(query: string) {
    const giphyApiKey = environment.giphyApiKey;
    const url = `https://api.giphy.com/v1/gifs/search?api_key=${giphyApiKey}&q=${encodeURIComponent(query)}&limit=20&rating=g`;
    const resp = await fetch(url);
    const data = await resp.json();
    this.giphyResults = data.data;
  }

  mostrarBuscadorGiphy = false;

  seleccionarGifGiphy(url: string) {
    this.imagenBase64 = url;
    this.mostrarBuscadorGiphy = false;
  }

  async enviarGifGiphy(url: string) {
    const mensaje: Mensaje = {
      id_mensaje: new Date().getTime().toString(),
      id_conversacion: this.idConversacionActual,
      id_usuario_emisor: this.usuarioActual.id_usuario,
      contenido: url,
      estado_visto: false,
    };

    await this.comunicacionService.enviarMensaje(mensaje);
    this.mostrarBuscadorGiphy = false;
    this.scrollToBottom();
  }

  abrirSelectorArchivos() {
    this.fileInput.nativeElement.click();
  }

  async tomarFoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        saveToGallery: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      if (image && image.dataUrl) {
        // Validar tamaño de la imagen
        if (!this.validateImageSize(image.dataUrl)) {
          this.mostrarToast(`La imagen es demasiado grande (${this.getImageSizeInfo(image.dataUrl)}). Se comprimirá automáticamente.`);
        }

        // Mostrar toast de carga
        const loadingToast = await this.toastController.create({
          message: 'Enviando imagen...',
          duration: 0,
          position: 'bottom'
        });
        await loadingToast.present();

        try {
          // Verificar conexión
          const online = await this.utilsService.checkInternetConnection();
          if (!online) {
            await loadingToast.dismiss();
            this.mostrarToast('No se puede enviar la imagen sin conexión a internet.');
            return;
          }

          // Comprimir y subir la imagen a Firebase Storage
          const imageUrl = await this.firebaseStorageService.uploadCompressedImage(
            image.dataUrl,
            'chat-images',
            800,  // maxWidth (menor para chat)
            600,  // maxHeight
            0.8   // quality
          );

          // Enviar mensaje con la URL de la imagen
          await this.comunicacionService.enviarMensajeMultimedia(
            'imagen',
            imageUrl,  // Ahora enviamos la URL en lugar del base64
            this.idConversacionActual,
            this.usuarioActual.id_usuario,
          );

          this.scrollToBottom();
          await loadingToast.dismiss();

        } catch (error) {
          await loadingToast.dismiss();
          console.error('Error al enviar imagen:', error);
          this.mostrarToast('Error al enviar la imagen. Inténtalo de nuevo.');
        }
      }
    } catch (error: any) {
      if (error.message?.toLowerCase().includes('permission')) {
        alert('Debes permitir el acceso a la cámara o galería desde la configuración de tu dispositivo.');
      } else {
        console.warn('No se seleccionó ninguna imagen o se canceló la acción.');
      }
    }
  }

 // ===========================
  // MÉTODO ORIGINAL (PERMITE VIDEO)
  // ===========================
  /*
  abrirInputVideo() {
    this.videoInput.nativeElement.click();
  }

  async onVideoSeleccionado(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        await this.comunicacionService.enviarMensajeMultimedia(
          'video',
          base64,
          this.idConversacionActual,
          this.usuarioActual.id_usuario,
        );
        this.scrollToBottom();
      };
      reader.readAsDataURL(file);
    }
  }
  */

  // ===========================
  // MÉTODOS ACTUALIZADOS (PERMITEN VIDEO)
  // ===========================
  abrirInputVideo() {
    this.fileInput.nativeElement.click(); // Ahora usa el mismo input que acepta videos
  }

  async onVideoSeleccionado(event: any) {
    // Esta función ya no es necesaria porque onArchivoSeleccionado maneja videos
    this.onArchivoSeleccionado(event);
  }

  seleccionarArchivo() {
    this.fileInput.nativeElement.click();
  }

  // ===========================
  // MÉTODO ORIGINAL (PERMITE VIDEO)
  // ===========================
  /*
  async onArchivoSeleccionado(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = async () => {
        const base64 = reader.result as string;
        if (file.type.startsWith('image/')) {
          await this.comunicacionService.enviarMensajeMultimedia(
            'imagen',
            base64,
            this.idConversacionActual,
            this.usuarioActual.id_usuario,
          );
        } else if (file.type.startsWith('video/')) {
          await this.comunicacionService.enviarMensajeMultimedia(
            'video',
            base64,
            this.idConversacionActual,
            this.usuarioActual.id_usuario,
          );
        }
        this.scrollToBottom();

        event.target.value = '';
      };

      reader.readAsDataURL(file);
    }
  }
  */

  // ===========================
  // MÉTODO ACTUALIZADO (PERMITE IMÁGENES Y VIDEOS)
  // ===========================
  async onArchivoSeleccionado(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validar que sea imagen o video
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        this.mostrarToast('Solo se pueden enviar imágenes o videos.');
        event.target.value = '';
        return;
      }

      // Validar tamaño del archivo
      let maxSize = 5; // 5MB para imágenes
      let fileType = 'imagen';
      
      if (file.type.startsWith('video/')) {
        maxSize = 25; // 25MB para videos
        fileType = 'video';
      }

      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > maxSize) {
        this.mostrarToast(`El ${fileType} es demasiado grande (${fileSizeInMB.toFixed(1)} MB). El límite es ${maxSize}MB.`);
        event.target.value = '';
        return;
      }

      // Mostrar toast de carga
      const loadingToast = await this.toastController.create({
        message: `Enviando ${fileType}...`,
        duration: 0,
        position: 'bottom'
      });
      await loadingToast.present();

      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          
          // Verificar conexión
          const online = await this.utilsService.checkInternetConnection();
          if (!online) {
            await loadingToast.dismiss();
            this.mostrarToast(`No se puede enviar el ${fileType} sin conexión a internet.`);
            return;
          }

          let mediaUrl: string;
          let tipoMensaje: 'imagen' | 'video';

          if (file.type.startsWith('image/')) {
            // Validar tamaño en base64 para imágenes
            if (!this.validateImageSize(base64)) {
              this.mostrarToast(`La imagen es demasiado grande (${this.getImageSizeInfo(base64)}). Se comprimirá automáticamente.`);
            }
            
            // Comprimir y subir la imagen
            mediaUrl = await this.firebaseStorageService.uploadCompressedImage(
              base64,
              'chat-images',
              800,  // maxWidth
              600,  // maxHeight
              0.8   // quality
            );
            tipoMensaje = 'imagen';
          } else {
            // Subir video sin compresión
            mediaUrl = await this.firebaseStorageService.uploadVideo(
              base64,
              'chat-videos'
            );
            tipoMensaje = 'video';
          }

          // Enviar mensaje con la URL del archivo
          await this.comunicacionService.enviarMensajeMultimedia(
            tipoMensaje,
            mediaUrl,
            this.idConversacionActual,
            this.usuarioActual.id_usuario,
          );

          this.scrollToBottom();
          await loadingToast.dismiss();
          
        } catch (error) {
          await loadingToast.dismiss();
          console.error(`Error al enviar ${fileType}:`, error);
          this.mostrarToast(`Error al enviar el ${fileType}. Inténtalo de nuevo.`);
        }

        event.target.value = '';
      };

      reader.onerror = async () => {
        await loadingToast.dismiss();
        this.mostrarToast(`Error al procesar el ${fileType}.`);
      };

      reader.readAsDataURL(file);
    }
  }

  async iniciarGrabacion() {
    this.grabando = true;
    await VoiceRecorder.startRecording();
  }

  async detenerGrabacion() {
    this.grabando = false;
    try {
      const result = await VoiceRecorder.stopRecording();
      if (result.value && result.value.recordDataBase64) {
        const audioBase64 = `data:audio/mp4;base64,${result.value.recordDataBase64}`;
        await this.enviarMensajeDeVoz(audioBase64);
      }
    } catch (error) {
      console.error('Error al detener la grabación:', error);
    }
  }

  async enviarMensajeDeVoz(audioBase64: string) {
    await this.comunicacionService.enviarMensajeMultimedia(
      'audio',
      audioBase64,
      this.idConversacionActual,
      this.usuarioActual.id_usuario,
    );
    this.scrollToBottom();
  }

  // ===========================
// MÉTODO ORIGINAL (PERMITE TODO TIPO DE MENSAJE)
// ===========================
/*
async enviarMensaje() {
  if (this.nuevoMensaje.trim() === '') return;

  const mensaje: Mensaje = {
    id_mensaje: '', // Temporal
    id_conversacion: this.idConversacionActual,
    id_usuario_emisor: this.usuarioActual.id_usuario,
    contenido: this.nuevoMensaje,
    estado_visto: false,
  };

  await this.comunicacionService.enviarMensaje(mensaje);

  // Recarga mensajesOffline y mensajesCombinados si estás offline
  const online = await this.utilsService.checkInternetConnection();
  if (!online) {
    this.mensajesOffline = (await this.comunicacionService.getMensajesOfflineDescifrados()).filter(
      m => m.id_conversacion === this.idConversacionActual &&
        m.id_usuario_emisor === this.usuarioActual.id_usuario
    ) || [];

    this.mensajesCombinados = [
      ...this.mensajes,
      ...this.mensajesOffline
    ].sort((a, b) => {
      const fechaA = this.convertirFecha(a.fecha_envio);
      const fechaB = this.convertirFecha(b.fecha_envio);
      return fechaA.getTime() - fechaB.getTime();
    });

    this.cdRef.detectChanges();
  }

  const textarea = document.querySelector('textarea');
  if (textarea) {
    textarea.style.height = 'auto';
  }

  this.nuevoMensaje = '';
  this.scrollToBottom();
}
*/

// ===========================
// MÉTODO ACTUALIZADO (PERMITE TODOS LOS TIPOS DE MENSAJE)
// ===========================
async enviarMensaje() {
    if (this.nuevoMensaje.trim() === '') return;

    const mensaje: Mensaje = {
      id_mensaje: '', // Temporal
      id_conversacion: this.idConversacionActual,
      id_usuario_emisor: this.usuarioActual.id_usuario,
      contenido: this.nuevoMensaje,
      estado_visto: false,
    };

    await this.comunicacionService.enviarMensaje(mensaje);

    // Recarga mensajesOffline y mensajesCombinados si estás offline
    const online = await this.utilsService.checkInternetConnection();
    if (!online) {
      this.mensajesOffline = (await this.comunicacionService.getMensajesOfflineDescifrados()).filter(
        m => m.id_conversacion === this.idConversacionActual &&
          m.id_usuario_emisor === this.usuarioActual.id_usuario
      ) || [];

      this.mensajesCombinados = [
        ...this.mensajes,
        ...this.mensajesOffline
      ].sort((a, b) => {
        const fechaA = this.convertirFecha(a.fecha_envio);
        const fechaB = this.convertirFecha(b.fecha_envio);
        return fechaA.getTime() - fechaB.getTime();
      });

      this.cdRef.detectChanges();
    }

    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.style.height = 'auto';
    }

    this.nuevoMensaje = '';
    this.scrollToBottom();
  }

  esMensajeOffline(id_mensaje: string): boolean {
    return this.mensajesOffline.some(m => m.id_mensaje === id_mensaje);
  }

  esPublicacion(mensaje: Mensaje): boolean {
    try {
      const obj = JSON.parse(mensaje.contenido);
      // Una publicación debe tener id_publicacion y al menos uno de: contenido, imagen, video
      return obj && obj.id_publicacion && (
        obj.contenido !== undefined || 
        obj.imagen || 
        obj.video ||
        obj.fecha_publicacion ||
        obj.id_usuario
      );
    } catch {
      return false;
    }
  }

  obtenerPublicacion(mensaje: Mensaje): any | null {
    try {
      return JSON.parse(mensaje.contenido);
    } catch {
      return null;
    }
  }

  verPerfil(usuario: Usuario | undefined) {
    if (usuario) {
      this.router.navigate(['/perfil-user', usuario.id_usuario]);
    }
  }

  ionViewWillLeave() {
    this.chatActivo = false; // Desactivar el chat
    Keyboard.hide();
    
    // Desuscribirse para evitar que los mensajes se marquen como vistos cuando no esté en el chat
    this.mensajesSub?.unsubscribe();
    this.conversacionesSub?.unsubscribe();
  }

  /**
   * Se ejecuta cuando el componente se destruye
   */
  ngOnDestroy() {
    this.chatActivo = false;
    this.mensajesSub?.unsubscribe();
    this.conversacionesSub?.unsubscribe();
  }


    // Utilidad para mostrar toast
  async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'top',
      color: 'danger'
    });
    toast.present();
  }
}