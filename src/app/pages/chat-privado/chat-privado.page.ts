import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ViewChild, ElementRef } from '@angular/core';


interface Mensaje {
  tipo: 'enviado' | 'recibido';
  texto?: string;
  imagen?: string;
  video?: string;
  audio?: string;
  hora: string;
}

@Component({
  selector: 'app-chat-privado',
  templateUrl: './chat-privado.page.html',
  styleUrls: ['./chat-privado.page.scss'],
  standalone: false,
})
export class ChatPrivadoPage implements OnInit {

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  @ViewChild('audioInput', { static: false }) audioInput!: ElementRef;

  
  chatId: string | null = '';
  chatInfo: any = { username: '', userAvatar: '' };
  
  nuevoMensaje: string = '';
  
  constructor(private route: ActivatedRoute) {}
  
  ngOnInit() {
    this.chatId = this.route.snapshot.paramMap.get('id');
    this.chatInfo = this.usuariosMock.find(user => user.id === this.chatId) || {};
  }
  mensajes: Mensaje[] = [
    { texto: '¡Hola!', hora: '10:00', tipo: 'recibido' },
    { texto: '¿Cómo estás?', hora: '10:01', tipo: 'enviado' },
    { texto: 'Todo bien, ¿y tú?', hora: '10:02', tipo: 'recibido' }
  ];

  usuariosMock = [
    { id: '1', username: 'johndoe', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg' },
    { id: '2', username: 'gamer123', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg' },
    { id: '3', username: 'petterpan', userAvatar: 'https://ionicframework.com/docs/img/demos/avatar.svg' },
  ];



  seleccionarArchivo() {
    this.fileInput.nativeElement.click();
  }
  
  onArchivoSeleccionado(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      
      reader.onload = () => {
        const base64 = reader.result as string;
        const horaActual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
        // Verificar el tipo de archivo
        if (file.type.startsWith('image/')) {
          // Si es una imagen
          this.mensajes.push({
            tipo: 'enviado',
            imagen: base64,
            hora: horaActual
          });
        } else if (file.type.startsWith('video/')) {
          // Si es un video
          this.mensajes.push({
            tipo: 'enviado',
            video: base64,
            hora: horaActual
          });
        }
      };
      
      reader.readAsDataURL(file);
    }
  }

  seleccionarAudio() {
    this.audioInput.nativeElement.click();
  }
  
  onAudioSeleccionado(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const audioBase64 = reader.result as string;
        this.mensajes.push({
          tipo: 'enviado',
          audio: audioBase64,
          hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      };
      reader.readAsDataURL(file);
    }
  }


  enviarMensaje() {
    if (this.nuevoMensaje.trim() === '') return;

    const horaActual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    this.mensajes.push({
      texto: this.nuevoMensaje,
      hora: horaActual,
      tipo: 'enviado'
    });

    this.nuevoMensaje = '';
  }
}
