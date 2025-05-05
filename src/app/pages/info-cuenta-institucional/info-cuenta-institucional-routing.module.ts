import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InfoCuentaInstitucionalPage } from './info-cuenta-institucional.page';

const routes: Routes = [
  {
    path: '',
    component: InfoCuentaInstitucionalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InfoCuentaInstitucionalPageRoutingModule {}
