import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SeguidoresPageRoutingModule } from './seguidores-routing.module';

import { SeguidoresPage } from './seguidores.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SeguidoresPageRoutingModule
  ],
  declarations: [SeguidoresPage]
})
export class SeguidoresPageModule {}
