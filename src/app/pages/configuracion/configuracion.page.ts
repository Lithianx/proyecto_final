import { Component, OnInit } from '@angular/core';
// No necesitas importar los componentes de Ionic aquí si standalone es false,
// se importan en el módulo de la página.

// import { FormsModule } from '@angular/forms'; // Se importa en el módulo

// Si usas addIcons aquí, asegúrate de tener ionicons instalado
import { addIcons } from 'ionicons';
import {
  personOutline,
  timeOutline,
  schoolOutline,
  contrastOutline,
  chevronForwardOutline,
  logOutOutline,
  // Asegúrate de importar todos los iconos que usas en tu HTML
} from 'ionicons/icons';

@Component({
  selector: 'app-configuracion', // Selector para usar este componente
  templateUrl: './configuracion.page.html', // Enlace al archivo HTML
  styleUrls: ['./configuracion.page.scss'], // Enlace al archivo SCSS
  standalone: false, // Indicamos que NO es un componente standalone
  // No se necesita la sección 'imports' aquí si standalone es false
})
export class ConfiguracionPage implements OnInit {

  // Usa el nombre de variable del toggle en tu HTML (paletteToggle)
  // paletteToggle = false;

  constructor() {
    // Registrar iconos usados en este componente (aunque a menudo se hace globalmente)
    addIcons({
      personOutline,
      timeOutline,
      schoolOutline,
      contrastOutline,
      chevronForwardOutline,
      logOutOutline
    });
  }

  ngOnInit() {
    /*
    // Usa matchMedia para verificar la preferencia del usuario del sistema operativo
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    // Carga la preferencia guardada en localStorage primero
    const savedPreference = localStorage.getItem('ion-palette-dark'); // Usa la clase CSS como clave

    if (savedPreference !== null) {
      // Si hay una preferencia guardada, úsala para inicializar
      const isDark = savedPreference === 'true'; // localStorage guarda strings
      this.initializeDarkPalette(isDark);
    } else {
      // Si no hay preferencia guardada, usa la del sistema operativo como valor inicial
      this.initializeDarkPalette(prefersDark.matches);
    }

    // Puedes ajustar esta lógica si la preferencia manual debe tener prioridad total.
    prefersDark.addEventListener('change', (mediaQuery) => this.initializeDarkPalette(mediaQuery.matches));
    */
  }

  /*
  // Verifica/desmarca el toggle y actualiza la paleta basado en isDark
  initializeDarkPalette(isDark: boolean) {
    this.paletteToggle = isDark; // Actualiza el estado del toggle en la UI
    this.toggleDarkPalette(isDark); // Aplica la clase CSS
  }

  // Escucha el cambio del toggle para alternar la paleta oscura
  toggleChange(event: CustomEvent) {
    const shouldAdd = event.detail.checked; // event.detail.checked indica el nuevo estado
    this.toggleDarkPalette(shouldAdd); // Aplica/remueve la clase CSS
    // Guarda la preferencia del usuario en localStorage
    localStorage.setItem('ion-palette-dark', shouldAdd.toString()); // Guarda 'true' o 'false' como string
  }

  // Añade o remueve la clase "ion-palette-dark" en el elemento html
  toggleDarkPalette(shouldAdd: boolean) {
    // Aplica la clase al elemento raíz (<html>)
    document.documentElement.classList.toggle('ion-palette-dark', shouldAdd);
  }
  */
}
