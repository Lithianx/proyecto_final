import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetallesPublicacionPersonalPageRoutingModule } from './detalles-publicacion-personal-routing.module';

import { DetallesPublicacionPersonalPage } from './detalles-publicacion-personal.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetallesPublicacionPersonalPageRoutingModule,
    ComponentsModule
  ],
  declarations: [DetallesPublicacionPersonalPage]
})
export class DetallesPublicacionPersonalPageModule {}
