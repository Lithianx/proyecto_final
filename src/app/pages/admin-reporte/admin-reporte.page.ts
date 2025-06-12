import { Component, OnInit } from '@angular/core';
import { Publicacion } from 'src/app/models/publicacion.model';
import { Reporte } from 'src/app/models/reporte.model';
import { ReporteService } from 'src/app/services/reporte.service';
import { PublicacionService } from 'src/app/services/publicacion.service'; 
import { TipoReporte } from 'src/app/models/tipo-reporte.model';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-admin-reporte',
  templateUrl: './admin-reporte.page.html',
  styleUrls: ['./admin-reporte.page.scss'],
  standalone: false
})
export class AdminReportePage implements OnInit {

  publicaciones: Publicacion[] = [];
  reportes: Reporte[] = [];
  tiposReporte: TipoReporte[] = [];

  constructor(
    private reporteService: ReporteService,
    private publicacionService: PublicacionService,
    private usuarioService: UsuarioService
  ) { }

  async ngOnInit() {
    this.reportes = await this.reporteService.obtenerReportesAdmin();
    this.reportes = this.reportes.map(r => ({
      ...r,
      fecha_reporte: r.fecha_reporte instanceof Date
        ? r.fecha_reporte
        : (r.fecha_reporte && typeof (r.fecha_reporte as any).toDate === 'function'
          ? (r.fecha_reporte as any).toDate()
          : new Date(r.fecha_reporte)
        )
    }))
      .sort((a, b) => a.fecha_reporte.getTime() - b.fecha_reporte.getTime());

    this.publicaciones = await this.publicacionService.getPublicaciones();
    this.tiposReporte = await this.reporteService.getTiposReporte();
  }

  getDescripcionTipoReporte(id_tipo_reporte: string): string {
    return this.tiposReporte.find(t => t.id_tipo_reporte === id_tipo_reporte)?.descripcion_tipo_reporte || id_tipo_reporte;
  }

  // Busca la publicación asociada a un reporte
  getPublicacion(reporte: Reporte): Publicacion | undefined {
    return this.publicaciones.find(pub => pub.id_publicacion === reporte.id_publicacion);
  }


  async aceptarReporte(reporte: Reporte) {
    // Elimina la publicación asociada
    console.log('Reporte aceptado:', reporte);
    await this.publicacionService.removePublicacion(reporte.id_publicacion);

    // Busca el usuario creador de la publicación
    const publicacion = this.getPublicacion(reporte);
    if (publicacion) {
      await this.usuarioService.desactivarCuentaUsuario(publicacion.id_usuario);
    }

    // Elimina el reporte
    await this.reporteService.eliminarReporte(reporte.id_reporte);
    // Actualiza las listas locales
    this.publicaciones = this.publicaciones.filter(p => p.id_publicacion !== reporte.id_publicacion);
    this.reportes = this.reportes.filter(r => r.id_reporte !== reporte.id_reporte);
  }


  async rechazarReporte(reporte: Reporte) {
    console.log('Reporte rechazado:', reporte);
    await this.reporteService.eliminarReporte(reporte.id_reporte);
    this.reportes = this.reportes.filter(r => r.id_reporte !== reporte.id_reporte);
  }
}
