import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminReportePageRoutingModule } from './admin-reporte-routing.module';

import { AdminReportePage } from './admin-reporte.page';


import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminReportePageRoutingModule,
    ComponentsModule
  ],
  declarations: [AdminReportePage]
})
export class AdminReportePageModule {}
