import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SeguidoresPage } from './seguidores.page';

const routes: Routes = [
  {
    path: '',
    component: SeguidoresPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SeguidoresPageRoutingModule {}
