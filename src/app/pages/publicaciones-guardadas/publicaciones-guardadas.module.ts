import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PublicacionesGuardadasPageRoutingModule } from './publicaciones-guardadas-routing.module';

import { PublicacionesGuardadasPage } from './publicaciones-guardadas.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PublicacionesGuardadasPageRoutingModule,
    ComponentsModule
  ],
  declarations: [PublicacionesGuardadasPage]
})
export class PublicacionesGuardadasPageModule {}
