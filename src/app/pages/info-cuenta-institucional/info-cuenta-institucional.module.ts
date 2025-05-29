import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InfoCuentaInstitucionalPageRoutingModule } from './info-cuenta-institucional-routing.module';

import { InfoCuentaInstitucionalPage } from './info-cuenta-institucional.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InfoCuentaInstitucionalPageRoutingModule
  ],
  declarations: [InfoCuentaInstitucionalPage]
})
export class InfoCuentaInstitucionalPageModule {}
