import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EventInscCreadPageRoutingModule } from './event-insc-cread-routing.module';

import { EventInscCreadPage } from './event-insc-cread.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EventInscCreadPageRoutingModule,
    ComponentsModule
  ],
  declarations: [EventInscCreadPage]
})
export class EventInscCreadPageModule {}
