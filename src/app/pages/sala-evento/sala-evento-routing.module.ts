import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SalaEventoPage } from './sala-evento.page';

const routes: Routes = [
  {
    path: '',
    component: SalaEventoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalaEventoPageRoutingModule {}
