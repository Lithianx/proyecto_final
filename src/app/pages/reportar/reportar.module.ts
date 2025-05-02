import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReportarPageRoutingModule } from './reportar-routing.module';

import { ReportarPage } from './reportar.page';

import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReportarPageRoutingModule,
    ComponentsModule
  ],
  declarations: [ReportarPage]
})
export class ReportarPageModule {}
