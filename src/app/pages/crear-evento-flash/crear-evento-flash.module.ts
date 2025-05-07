import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule ,ReactiveFormsModule} from '@angular/forms';


import { IonicModule } from '@ionic/angular';

import { CrearEventoFlashPageRoutingModule } from './crear-evento-flash-routing.module';

import { CrearEventoFlashPage } from './crear-evento-flash.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CrearEventoFlashPageRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [CrearEventoFlashPage] 
})
export class CrearEventoFlashPageModule {}
