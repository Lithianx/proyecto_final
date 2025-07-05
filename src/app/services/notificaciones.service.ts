import { Injectable } from '@angular/core';
import { ToastController, AlertController } from '@ionic/angular';
import { FirebaseService } from './firebase.service';  // Ajusta ruta si es necesario
import { Notificacion } from '../models/notificacion.model';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {

  constructor(
    private toastController: ToastController,
    private alertController: AlertController,
    private firebaseService: FirebaseService
  ) {}

  // Crear y guardar notificación usando FirebaseService
  async crearNotificacion(
    tipoAccion: string,
    idUserHecho: string,
    idUserReceptor: string,
    idUserObjet?: string
  ) {
    try {
      const nuevaNotificacion: Notificacion = {
        tipoAccion,
        idUserHecho,
        idUserReceptor,
        fecha: new Date(),  // Este valor no se usará en Firestore, lo maneja el servidor
        idUserObjet
      };
      await this.firebaseService.addNotificacion(nuevaNotificacion);
    } catch (error) {
      console.error('Error al crear la notificación:', error);
    }
  }

  // Mostrar Toast
  async mostrarToast(mensaje: string, color: 'success' | 'danger' | 'warning' = 'success', duracion = 2000) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      position: 'bottom',
      color: color
    });
    await toast.present();
  }

  // Mostrar Alerta
  async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }
}
