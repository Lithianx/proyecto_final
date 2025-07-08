import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, AlertController } from '@ionic/angular';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ReporteService } from 'src/app/services/reporte.service';
import { Reporte } from 'src/app/models/reporte.model';

@Component({
  selector: 'app-reportar-cuenta',
  templateUrl: './reportar-cuenta.page.html',
  styleUrls: ['./reportar-cuenta.page.scss'],
  standalone: false,
})
export class ReportarCuentaPage implements OnInit {
  idUsuarioReportado: string = '';
  nombreUsuarioReportado: string = '';
  razonReporte: string = '';
  detallesAdicionales: string = '';

  razones = [
    'Contenido ofensivo',
    'Comportamiento inapropiado',
    'Suplantación de identidad',
    'Spam o publicidad'

  ];

  // Aquí guardaremos el usuario que hace el reporte
  idUsuarioReportante: string = '';
  enviandoReporte = false;

  constructor(
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private alertCtrl: AlertController,
    private usuarioService: UsuarioService,
    private reporteService: ReporteService
  ) {}

  async ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      const id = params.get('id');
      this.idUsuarioReportado = id ?? '';

      // Cargar usuarios en memoria si no están
      await this.usuarioService.cargarUsuarios();

      // Obtener nombre del usuario reportado
      const usuario = this.usuarioService.getUsuarioPorId(this.idUsuarioReportado);
      this.nombreUsuarioReportado = usuario ? usuario.nombre_usuario : 'usuario_desconocido';

      // Obtener usuario actual que reporta (puedes adaptarlo según tu auth)
      const usuarioActual = await this.usuarioService.getUsuarioActualConectado();
      this.idUsuarioReportante = usuarioActual ? usuarioActual.id_usuario : '';
    });
  }

  volver() {
    this.navCtrl.back();
  }

  async enviarReporte() {
    // Prevenir múltiples envíos
    if (this.enviandoReporte) {
      console.log('Reporte ya está siendo enviado');
      return;
    }

    if (!this.razonReporte) {
      const alerta = await this.alertCtrl.create({
        header: 'Falta información',
        message: 'Por favor, selecciona una razón para el reporte.',
        buttons: ['OK']
      });
      await alerta.present();
      return;
    }

    if (!this.idUsuarioReportante) {
      const alerta = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudo identificar al usuario que reporta. Por favor, inicia sesión nuevamente.',
        buttons: ['OK']
      });
      await alerta.present();
      return;
    }

    this.enviandoReporte = true;

    try {
      // Construir objeto reporte
      const descripcionCompleta = `Usuario ID: ${this.idUsuarioReportado} | ${this.detallesAdicionales || 'Sin detalles adicionales'}`;
      
      const nuevoReporte: Reporte = {
        id_reporte: '',
        id_usuario: this.idUsuarioReportante, // quien reporta
        id_tipo_reporte: this.razonReporte,
        // Para reportes de perfil, NO incluir id_publicacion o dejarlo undefined
        descripcion_reporte: descripcionCompleta,
        fecha_reporte: new Date(),
      };

      const idGenerado = await this.reporteService.guardarReporte(nuevoReporte);
      nuevoReporte.id_reporte = idGenerado as string;

      const alert = await this.alertCtrl.create({
        header: 'Reporte enviado',
        message: `Has reportado a ${this.nombreUsuarioReportado} por: ${this.razonReporte}.`,
        buttons: [{
          text: 'Aceptar',
          handler: () => {
            this.navCtrl.back();
          }
        }]
      });
      await alert.present();
    } catch (error) {
      const alerta = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudo enviar el reporte. Intenta nuevamente más tarde.',
        buttons: ['OK']
      });
      await alerta.present();
      console.error('Error al enviar reporte:', error);
    } finally {
      this.enviandoReporte = false;
    }
  }
}
