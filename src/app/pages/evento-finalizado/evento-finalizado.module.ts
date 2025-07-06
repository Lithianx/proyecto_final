import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EventoFinalizadoPageRoutingModule } from './evento-finalizado-routing.module';

import { EventoFinalizadoPage } from './evento-finalizado.page';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EventoFinalizadoPageRoutingModule,
    ComponentsModule
  ],
  declarations: [EventoFinalizadoPage]
})
export class EventoFinalizadoPageModule {}
