import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EventoCreadoPage } from './evento-creado.page';

const routes: Routes = [
  {
    path: '',
    component: EventoCreadoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventoCreadoPageRoutingModule {}
