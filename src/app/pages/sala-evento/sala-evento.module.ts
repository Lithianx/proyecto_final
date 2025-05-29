import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SalaEventoPageRoutingModule } from './sala-evento-routing.module';

import { SalaEventoPage } from './sala-evento.page';

import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SalaEventoPageRoutingModule,
    ComponentsModule,
    
  ],
  declarations: [SalaEventoPage]
})
export class SalaEventoPageModule {}
