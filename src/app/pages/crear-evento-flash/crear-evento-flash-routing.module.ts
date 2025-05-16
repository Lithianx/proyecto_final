import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CrearEventoFlashPage } from './crear-evento-flash.page';

const routes: Routes = [
  {
    path: '',
    component: CrearEventoFlashPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CrearEventoFlashPageRoutingModule {}
