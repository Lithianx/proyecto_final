import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'lista-chat',
    loadChildren: () => import('./pages/lista-chat/lista-chat.module').then( m => m.ListaChatPageModule)
  },
  {
    path: 'chat-privado/:id',
    loadChildren: () => import('./pages/chat-privado/chat-privado.module').then( m => m.ChatPrivadoPageModule)
  },
  {
    path: 'crear-publicacion',
    loadChildren: () => import('./pages/crear-publicacion/crear-publicacion.module').then( m => m.CrearPublicacionPageModule)
  },
  {
    path: 'editar-publicacion',
    loadChildren: () => import('./pages/editar-publicacion/editar-publicacion.module').then( m => m.EditarPublicacionPageModule)
  },
  {
    path: 'comentario/:id',
    loadChildren: () => import('./pages/comentario/comentario.module').then( m => m.ComentarioPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'crear-usuario',
    loadChildren: () => import('./pages/crear-usuario/crear-usuario.module').then( m => m.CrearUsuarioPageModule)
  },
  {
    path: 'olvido-contrasena',
    loadChildren: () => import('./pages/olvido-contrasena/olvido-contrasena.module').then( m => m.OlvidoContrasenaPageModule)
  },  {
    path: 'perfil',
    loadChildren: () => import('./pages/perfil/perfil.module').then( m => m.PerfilPageModule)
  },



];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
