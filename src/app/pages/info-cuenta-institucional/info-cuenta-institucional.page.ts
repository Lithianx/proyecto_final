import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-info-cuenta-institucional',
  templateUrl: './info-cuenta-institucional.page.html',
  styleUrls: ['./info-cuenta-institucional.page.scss'],  
  standalone: false,
})
export class InfoCuentaInstitucionalPage implements OnInit {

  constructor() { }
  aceptaTerminos: boolean = false;

  ngOnInit() {
  }

}
