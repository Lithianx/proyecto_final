import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SeguidoresPageRoutingModule } from './seguidores-routing.module';

import { SeguidoresPage } from './seguidores.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SeguidoresPageRoutingModule,
    ComponentsModule
  ],
  declarations: [SeguidoresPage]
})
export class SeguidoresPageModule {}
