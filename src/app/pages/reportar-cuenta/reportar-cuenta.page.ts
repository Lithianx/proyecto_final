import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-reportar-cuenta',
  templateUrl: './reportar-cuenta.page.html',
  styleUrls: ['./reportar-cuenta.page.scss'],
  standalone: false,
})
export class ReportarCuentaPage implements OnInit {
  idUsuario: string = '';
  nombreUsuario: string = '';
  razonReporte: string = '';
  detallesAdicionales: string = '';

  razones = [
    'Contenido ofensivo',
    'Comportamiento inapropiado',
    'Suplantación de identidad',
    'Spam o publicidad',
    'Otro'
  ];

  constructor(
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.idUsuario = id ?? '';
      // Aquí deberías obtener el nombre real desde un servicio. Simulado:
      if (this.idUsuario === '1') {
        this.nombreUsuario = 'maria_gamer';
      } else {
        this.nombreUsuario = 'usuario_desconocido';
      }
    });
  }

  volver() {
    this.navCtrl.back();
  }

  async enviarReporte() {
    if (!this.razonReporte) {
      const alerta = await this.alertCtrl.create({
        header: 'Falta información',
        message: 'Por favor, selecciona una razón para el reporte.',
        buttons: ['OK']
      });
      await alerta.present();
      return;
    }

    // Aquí podrías enviar los datos a un servicio si quieres
    console.log('Reporte enviado:', {
      idUsuario: this.idUsuario,
      razon: this.razonReporte,
      detalles: this.detallesAdicionales
    });

    const alert = await this.alertCtrl.create({
      header: 'Reporte enviado',
      message: `Has reportado a ${this.nombreUsuario} por:${this.razonReporte}.`,
      buttons: [{
        text: 'Aceptar',
        handler: () => {
          this.navCtrl.back(); 
        }
      }]
    });

    await alert.present();
  }
}
