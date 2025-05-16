import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EventoCreadoPageRoutingModule } from './evento-creado-routing.module';

import { EventoCreadoPage } from './evento-creado.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EventoCreadoPageRoutingModule
  ],
  declarations: [EventoCreadoPage]
})
export class EventoCreadoPageModule {}
