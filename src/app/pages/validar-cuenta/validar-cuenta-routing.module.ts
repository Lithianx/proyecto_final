import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ValidarCuentaPage } from './validar-cuenta.page';

const routes: Routes = [
  {
    path: '',
    component: ValidarCuentaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ValidarCuentaPageRoutingModule {}
