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
    path: 'crear-evento-flash',
    loadChildren: () => import('./pages/crear-evento-flash/crear-evento-flash.module').then( m => m.CrearEventoFlashPageModule)
  },
  {
    path: 'evento',
    loadChildren: () => import('./pages/evento/evento.module').then( m => m.EventoPageModule)
  },
  {
    path: 'reportar/:id',
    loadChildren: () => import('./pages/reportar/reportar.module').then( m => m.ReportarPageModule)
  },
  {
    path: 'detalle-evento/:id',
    loadChildren: () => import('./pages/detalle-evento/detalle-evento.module').then( m => m.DetalleEventoPageModule)
  },
  {
    path: 'sala-evento/:id',
    loadChildren: () => import('./pages/sala-evento/sala-evento.module').then( m => m.SalaEventoPageModule)
  },




 


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
