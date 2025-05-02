import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChatPrivadoPageRoutingModule } from './chat-privado-routing.module';

import { ChatPrivadoPage } from './chat-privado.page';

import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatPrivadoPageRoutingModule,
    ComponentsModule
  ],
  declarations: [ChatPrivadoPage]
})
export class ChatPrivadoPageModule {}
