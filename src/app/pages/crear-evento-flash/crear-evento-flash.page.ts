import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-crear-evento-flash',
  templateUrl: './crear-evento-flash.page.html',
  standalone: false,

  styleUrls: ['./crear-evento-flash.page.scss'],
})
export class CrearEventoFlashPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  crearEventoFlash() {
    
    console.log('Evento flash creado');
  }

}
