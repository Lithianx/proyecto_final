import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InfoCuentaInstitucionalPageRoutingModule } from './info-cuenta-institucional-routing.module';

import { InfoCuentaInstitucionalPage } from './info-cuenta-institucional.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InfoCuentaInstitucionalPageRoutingModule,
    ComponentsModule
  ],
  declarations: [InfoCuentaInstitucionalPage]
})
export class InfoCuentaInstitucionalPageModule {}
