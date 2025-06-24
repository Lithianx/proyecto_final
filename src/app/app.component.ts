import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { StatusBar } from '@capacitor/status-bar';
import { App } from '@capacitor/app';
import { Router } from '@angular/router';
import { ReporteService } from './services/reporte.service';
import { SeguirService } from './services/seguir.service';
import { PublicacionService } from './services/publicacion.service';
import { ComentarioService } from './services/comentario.service';
import { GuardaPublicacionService } from './services/guardarpublicacion.service';
import { ComunicacionService } from './services/comunicacion.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private reporteService: ReporteService,
    private seguirService: SeguirService,
    private publicacionService: PublicacionService,
    private comentarioService: ComentarioService,
    private guardarPublicacionService: GuardaPublicacionService,
    private comunicacionService: ComunicacionService,
    private router: Router
  ) {
    this.initializeApp();
    this.handleCustomScheme();
  }

  ngOnInit() {
    // Sincroniza al iniciar si hay internet
    this.reporteService.sincronizarReporte();

    // Sincroniza automáticamente cuando vuelva el internet
    window.addEventListener('online', () => {
      this.reporteService.sincronizarReporte();
      this.seguirService.sincronizarSeguimientosLocales();
      this.publicacionService.sincronizarPublicacionesPersonales();
      this.comentarioService.sincronizarComentariosLocales();
      this.guardarPublicacionService.sincronizarGuardadosLocales();
      this.comunicacionService.sincronizarMensajesLocales();
      this.comunicacionService.sincronizarConversacionesLocales();
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      StatusBar.setOverlaysWebView({ overlay: false });
      StatusBar.setBackgroundColor({ color: '#1e1e1e' });
    });
  }

  // Maneja la apertura de enlaces custom (myapp://comentario/123)
  handleCustomScheme() {
    App.addListener('appUrlOpen', (data: any) => {
      const url = data.url;
      if (url) {
        // Ejemplo: myapp://comentario/123
        const match = url.match(/(?:myapp:\/\/comentario\/|https:\/\/app-eventos-7f5a8\.web\.app\/comentario\/)(\w+)/);
        if (match) {
          const id = match[1];
          this.router.navigate(['/comentario', id]);
        }
      }
    });
  }
}