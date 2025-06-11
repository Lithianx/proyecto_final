import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReportarCuentaPage } from './reportar-cuenta.page';

const routes: Routes = [
  {
    path: '',
    component: ReportarCuentaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportarCuentaPageRoutingModule {}
