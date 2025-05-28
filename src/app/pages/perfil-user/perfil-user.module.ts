import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PerfilUserPageRoutingModule } from './perfil-user-routing.module';

import { PerfilUserPage } from './perfil-user.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PerfilUserPageRoutingModule,
    ComponentsModule
  ],
  declarations: [PerfilUserPage]
})
export class PerfilUserPageModule {}
