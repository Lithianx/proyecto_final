import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetallesPublicacionPersonalPage } from './detalles-publicacion-personal.page';

const routes: Routes = [
  {
    path: '',
    component: DetallesPublicacionPersonalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetallesPublicacionPersonalPageRoutingModule {}
