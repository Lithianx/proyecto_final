import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BuscarPersonaPage } from './buscar-persona.page';

const routes: Routes = [
  {
    path: '',
    component: BuscarPersonaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BuscarPersonaPageRoutingModule {}
