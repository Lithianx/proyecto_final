import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BuscarPersonaPageRoutingModule } from './buscar-persona-routing.module';

import { BuscarPersonaPage } from './buscar-persona.page';

import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BuscarPersonaPageRoutingModule,
    ComponentsModule
  ],
  declarations: [BuscarPersonaPage]
})
export class BuscarPersonaPageModule {}
