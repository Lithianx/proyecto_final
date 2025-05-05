import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ValidarCuentaPageRoutingModule } from './validar-cuenta-routing.module';

import { ValidarCuentaPage } from './validar-cuenta.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ValidarCuentaPageRoutingModule
  ],
  declarations: [ValidarCuentaPage]
})
export class ValidarCuentaPageModule {}
