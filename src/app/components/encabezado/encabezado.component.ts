import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonButton, IonTitle, ActionSheetController } from "@ionic/angular"; // Asegúrate de importar ActionSheetController
import { Router } from '@angular/router';

@Component({
  selector: 'app-encabezado',
  templateUrl: './encabezado.component.html',
  styleUrls: ['./encabezado.component.scss'],
  standalone: false,
})
export class EncabezadoComponent implements OnInit {

  rutaActual: string = '';
  
  constructor(private router: Router, private actionSheetCtrl: ActionSheetController) { 
    this.router.events.subscribe(() => {
      this.rutaActual = this.router.url;
    });
  }

  ngOnInit() {}

  irEvento() {
    this.router.navigate(['/perfil']);  // Cambié 'this.Router' por 'this.router'
  }
}
