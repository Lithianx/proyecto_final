import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SeguidosPageRoutingModule } from './seguidos-routing.module';

import { SeguidosPage } from './seguidos.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SeguidosPageRoutingModule,
    ComponentsModule
  ],
  declarations: [SeguidosPage]
})
export class SeguidosPageModule {}
