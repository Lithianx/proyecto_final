import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EventoFinalizadoPage } from './evento-finalizado.page';

const routes: Routes = [
  {
    path: '',
    component: EventoFinalizadoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventoFinalizadoPageRoutingModule {}
