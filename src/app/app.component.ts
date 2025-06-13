import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';  //detecta en que plataforma se está ejecutando la app
import { StatusBar } from '@capacitor/status-bar';
// import { NavigationBar } from '@capacitor-community/navigation-bar'; // Cambia el color de la barra de navegación inferior (solo en Android)
// para futura implementación de la barra de navegación inferior
import { ReporteService } from './services/reporte.service';
import { SeguirService } from './services/seguir.service';
import { PublicacionService } from './services/publicacion.service'; 
import { ComentarioService } from './services/comentario.service';
import { GuardaPublicacionService } from './services/guardarpublicacion.service'; 

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
    private guardarPublicacionService: GuardaPublicacionService 
  ) {
    this.initializeApp();
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
    });
  }


  initializeApp() {
    this.platform.ready().then(() => {
      // Cambiar el color de la barra de estado (status bar)
      StatusBar.setOverlaysWebView({ overlay: false }); // Evita que el contenido quede debajo de la status bar
      StatusBar.setBackgroundColor({ color: '#1e1e1e' }); // color de la status bar para que combine con el color del header

      // Barra de navegación inferior
      // NavigationBar.setBackgroundColor({ color: '#1e1e1e' }); // Cambiar color de fondo de la barra
      // NavigationBar.setIconColor({ color: '#ffffff' }); // Cambiar color de los íconos
    });
  }
}