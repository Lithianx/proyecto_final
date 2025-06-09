import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReportarCuentaPageRoutingModule } from './reportar-cuenta-routing.module';

import { ReportarCuentaPage } from './reportar-cuenta.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReportarCuentaPageRoutingModule,
    ComponentsModule
  ],
  declarations: [ReportarCuentaPage]
})
export class ReportarCuentaPageModule {}
