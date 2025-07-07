import { Component, OnInit } from '@angular/core';
import { Publicacion } from 'src/app/models/publicacion.model';
import { Reporte } from 'src/app/models/reporte.model';
import { ReporteService } from 'src/app/services/reporte.service';
import { PublicacionService } from 'src/app/services/publicacion.service';
import { TipoReporte } from 'src/app/models/tipo-reporte.model';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Usuario } from 'src/app/models/usuario.model';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-admin-reporte',
  templateUrl: './admin-reporte.page.html',
  styleUrls: ['./admin-reporte.page.scss'],
  standalone: false
})
export class AdminReportePage implements OnInit {

  datos$: Observable<{ reportes: Reporte[], publicaciones: Publicacion[], tiposReporte: TipoReporte[], usuarios: Usuario[] }>;
  imagenSeleccionada: string | null = null;

  constructor(
    private reporteService: ReporteService,
    private publicacionService: PublicacionService,
    private usuarioService: UsuarioService,
    private toastController: ToastController
  ) {
    this.datos$ = combineLatest([
      this.reporteService.reportes$,
      this.publicacionService.publicaciones$,
      this.reporteService.tiposReporte$,
      this.usuarioService.usuarios$
    ]).pipe(
      map(([reportes, publicaciones, tiposReporte, usuarios]) => ({
        reportes: reportes.slice().sort((a, b) => {
          const fechaA = this.getFechaReporte(a.fecha_reporte);
          const fechaB = this.getFechaReporte(b.fecha_reporte);
          if (!fechaA && !fechaB) return 0;
          if (!fechaA) return 1;
          if (!fechaB) return -1;
          return fechaA.getTime() - fechaB.getTime(); // Ascendente: más antiguos primero
        }),
        publicaciones,
        tiposReporte,
        usuarios
      }))
    );
  }

  ngOnInit() {
    // Todo es reactivo, no necesitas cargar nada aquí
  }

  getDescripcionTipoReporte(id_tipo_reporte: string, tipos: TipoReporte[]): string {
    return tipos.find(t => t.id_tipo_reporte === id_tipo_reporte)?.descripcion_tipo_reporte || id_tipo_reporte;
  }

  getPublicacion(reporte: Reporte, publicaciones: Publicacion[]): Publicacion | undefined {
    return publicaciones.find(pub => pub.id_publicacion === reporte.id_publicacion);
  }

  async aceptarReporte(reporte: Reporte, publicaciones: Publicacion[], usuarios: Usuario[]) {
    try {
      if (this.esReporteDePublicacion(reporte)) {
        // REPORTE DE PUBLICACIÓN
        // Elimina la publicación asociada
        await this.publicacionService.removePublicacion(reporte.id_publicacion!);

        // Busca el usuario creador de la publicación
        const publicacion = this.getPublicacion(reporte, publicaciones);
        if (publicacion) {
          await this.usuarioService.desactivarCuentaUsuario(publicacion.id_usuario);
        }

        // Elimina todos los reportes asociados a la publicación
        await this.reporteService.eliminarReportesPorPublicacion(reporte.id_publicacion!);
        this.mostrarToast('Reporte aceptado y publicación eliminada.', 'success');
      } else {
        // REPORTE DE PERFIL/USUARIO
        const usuarioReportado = this.getUsuarioReportado(reporte, usuarios);
        if (usuarioReportado) {
          // Desactivar cuenta del usuario reportado
          await this.usuarioService.desactivarCuentaUsuario(usuarioReportado.id_usuario);
          this.mostrarToast(`Reporte aceptado. Usuario ${usuarioReportado.nombre_usuario} desactivado.`, 'success');
        } else {
          this.mostrarToast('No se pudo identificar al usuario reportado.', 'warning');
        }

        // Eliminar el reporte individual
        await this.reporteService.eliminarReporte(reporte.id_reporte);
      }
    } catch (error) {
      this.mostrarToast('Error al aceptar el reporte.', 'danger');
      console.error('Error al aceptar reporte:', error);
    }
  }

  async rechazarReporte(reporte: Reporte) {
    try {
      await this.reporteService.eliminarReporte(reporte.id_reporte);
      this.mostrarToast('Reporte rechazado.', 'success');
    } catch (error) {
      this.mostrarToast('Error al rechazar el reporte.', 'danger');
    }
  }

  async mostrarToast(mensaje: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color,
      position: 'top'
    });
    toast.present();
  }

  getFechaReporte(fecha: any): Date | null {
    if (!fecha) return null;
    if (fecha instanceof Date && !isNaN(fecha.getTime())) return fecha;
    if (fecha.toDate) {
      const d = fecha.toDate();
      return !isNaN(d.getTime()) ? d : null;
    }
    const d = new Date(fecha);
    return !isNaN(d.getTime()) ? d : null;
  }

  async doRefresh(event: any) {
    setTimeout(() => {
      event.target.complete();
    }, 500);
  }

  verImagen(publicacion: Publicacion) {
    this.imagenSeleccionada = publicacion.imagen ?? null;
  }

  cerrarVisor() {
    this.imagenSeleccionada = null;
  }

  // Determina si es un reporte de publicación o perfil
  esReporteDePublicacion(reporte: Reporte): boolean {
    return !!reporte.id_publicacion;
  }

  // Obtiene el usuario reportado (necesitamos saber qué usuario fue reportado)
  // Como el modelo actual no tiene id_usuario_reportado, usaremos la descripción para extraerlo
  getUsuarioReportado(reporte: Reporte, usuarios: Usuario[]): Usuario | undefined {
    if (reporte.id_publicacion) return undefined; // Es reporte de publicación
    
    // Para reportes de perfil, necesitamos extraer el ID del usuario reportado
    // Esto puede venir en la descripción o necesitamos modificar el modelo
    
    // Por ahora, buscaremos en la descripción patrones como "Usuario ID: xxxx"
    const match = reporte.descripcion_reporte.match(/Usuario\s+ID:\s*([a-zA-Z0-9]+)/i);
    if (match) {
      const userId = match[1];
      return usuarios.find(user => user.id_usuario === userId);
    }
    
    return undefined;
  }

  // Extrae solo la descripción del reporte, sin el ID del usuario
  getDescripcionLimpia(reporte: Reporte): string {
    if (!reporte.descripcion_reporte) return '';
    
    // Buscar el patrón "Usuario ID: xxxx | descripción"
    const match = reporte.descripcion_reporte.match(/Usuario\s+ID:\s*[a-zA-Z0-9]+\s*\|\s*(.+)/i);
    if (match && match[1]) {
      return match[1].trim();
    }
    
    // Si no tiene el formato esperado, devolver la descripción completa
    return reporte.descripcion_reporte;
  }
}