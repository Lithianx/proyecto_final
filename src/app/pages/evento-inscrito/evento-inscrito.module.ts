import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EventoInscritoPageRoutingModule } from './evento-inscrito-routing.module';

import { EventoInscritoPage } from './evento-inscrito.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EventoInscritoPageRoutingModule
  ],
  declarations: [EventoInscritoPage]
})
export class EventoInscritoPageModule {}
