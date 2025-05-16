import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListaChatPageRoutingModule } from './lista-chat-routing.module';

import { ListaChatPage } from './lista-chat.page';

import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListaChatPageRoutingModule,
    ComponentsModule
  ],
  declarations: [ListaChatPage]
})
export class ListaChatPageModule {}
