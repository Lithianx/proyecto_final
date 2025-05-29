import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EventoInscritoPage } from './evento-inscrito.page';

const routes: Routes = [
  {
    path: '',
    component: EventoInscritoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventoInscritoPageRoutingModule {}
