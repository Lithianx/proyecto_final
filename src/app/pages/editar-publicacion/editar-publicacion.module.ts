import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditarPublicacionPageRoutingModule } from './editar-publicacion-routing.module';

import { EditarPublicacionPage } from './editar-publicacion.page';

import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditarPublicacionPageRoutingModule,
    ComponentsModule
  ],
  declarations: [EditarPublicacionPage]
})
export class EditarPublicacionPageModule {}
