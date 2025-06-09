import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EventInscCreadPage } from './event-insc-cread.page';

const routes: Routes = [
  {
    path: '',
    component: EventInscCreadPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventInscCreadPageRoutingModule {}
