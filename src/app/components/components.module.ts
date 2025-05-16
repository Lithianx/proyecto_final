import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { EncabezadoComponent } from './encabezado/encabezado.component';
import { NavbarComponent } from './navbar/navbar.component';

@NgModule({
  declarations: [EncabezadoComponent, NavbarComponent],
  imports: [CommonModule, IonicModule],
  exports: [EncabezadoComponent, NavbarComponent],
})
export class ComponentsModule {}