import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PublicacionesGuardadasPage } from './publicaciones-guardadas.page';

const routes: Routes = [
  {
    path: '',
    component: PublicacionesGuardadasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PublicacionesGuardadasPageRoutingModule {}
