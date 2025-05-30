import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EventoCreadoPageRoutingModule } from './evento-creado-routing.module';

import { EventoCreadoPage } from './evento-creado.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EventoCreadoPageRoutingModule,
    ComponentsModule
  ],
  declarations: [EventoCreadoPage]
})
export class EventoCreadoPageModule {}
