import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminReportePage } from './admin-reporte.page';

const routes: Routes = [
  {
    path: '',
    component: AdminReportePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminReportePageRoutingModule {}
