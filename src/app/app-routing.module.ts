import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'login',
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
    path: 'editar-publicacion/:id',
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
  },
  {
    path: 'perfil',
    loadChildren: () => import('./pages/perfil/perfil.module').then( m => m.PerfilPageModule)
  },

  {
    path: 'editar-perfil',
    loadChildren: () => import('./pages/editar-perfil/editar-perfil.module').then( m => m.EditarPerfilPageModule)
  },
  {
    path: 'info-cuenta-institucional',
    loadChildren: () => import('./pages/info-cuenta-institucional/info-cuenta-institucional.module').then( m => m.InfoCuentaInstitucionalPageModule)
  },
  {
    path: 'validar-cuenta',
    loadChildren: () => import('./pages/validar-cuenta/validar-cuenta.module').then( m => m.ValidarCuentaPageModule)
  },
  {
    path: 'seguidores',
    loadChildren: () => import('./pages/seguidores/seguidores.module').then( m => m.SeguidoresPageModule)
  },
  {
    path: 'seguidos',
    loadChildren: () => import('./pages/seguidos/seguidos.module').then( m => m.SeguidosPageModule)
  },
  {
    path: 'historial-eventos',
    loadChildren: () => import('./pages/historial-eventos/historial-eventos.module').then( m => m.HistorialEventosPageModule)
  },
  {
    path: 'perfil-user/:id',
    loadChildren: () => import('./pages/perfil-user/perfil-user.module').then( m => m.PerfilUserPageModule)
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
    path: 'sala-evento/:id',
    loadChildren: () => import('./pages/sala-evento/sala-evento.module').then( m => m.SalaEventoPageModule)
  },
  {
    path: 'detalle-evento/:id',
    loadChildren: () => import('./pages/detalle-evento/detalle-evento.module').then( m => m.DetalleEventoPageModule)
  },
  {
    path : 'sala-evento/:id',
    loadChildren: () => import('./pages/sala-evento/sala-evento.module').then( m => m.SalaEventoPageModule)
  },
  {
    path: 'publicaciones-guardadas',
    loadChildren: () => import('./pages/publicaciones-guardadas/publicaciones-guardadas.module').then( m => m.PublicacionesGuardadasPageModule)
  },
  {
    path: 'notificaciones',
    loadChildren: () => import('./pages/notificaciones/notificaciones.module').then( m => m.NotificacionesPageModule)
  },
  {
    path: 'buscar-persona',
    loadChildren: () => import('./pages/buscar-persona/buscar-persona.module').then( m => m.BuscarPersonaPageModule)
  },
  {
    path: 'event-insc-cread/:id/:titulo',
    loadChildren: () => import('./pages/event-insc-cread/event-insc-cread.module').then(m => m.EventInscCreadPageModule)
  },
{
  path: 'reportar-cuenta/:id',
  loadChildren: () => import('./pages/reportar-cuenta/reportar-cuenta.module').then(m => m.ReportarCuentaPageModule)
}









 




];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
