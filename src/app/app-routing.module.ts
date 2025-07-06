import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { NoAuthGuard } from './guards/no-auth.guard';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/adminGuard.guard';

const routes: Routes = [
  {
    path: 'home',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'lista-chat',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/lista-chat/lista-chat.module').then(m => m.ListaChatPageModule)
  },
  {
    path: 'chat-privado/:id',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/chat-privado/chat-privado.module').then(m => m.ChatPrivadoPageModule)
  },
  {
    path: 'crear-publicacion',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/crear-publicacion/crear-publicacion.module').then(m => m.CrearPublicacionPageModule)
  },
  {
    path: 'editar-publicacion/:id',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/editar-publicacion/editar-publicacion.module').then(m => m.EditarPublicacionPageModule)
  },
  {
    path: 'comentario/:id',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/comentario/comentario.module').then(m => m.ComentarioPageModule)
  },
  {
    path: 'login',
    canActivate: [NoAuthGuard],
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'crear-usuario',
    canActivate: [NoAuthGuard],
    loadChildren: () => import('./pages/crear-usuario/crear-usuario.module').then(m => m.CrearUsuarioPageModule)
  },
  {
    path: 'olvido-contrasena',
    canActivate: [NoAuthGuard],
    loadChildren: () => import('./pages/olvido-contrasena/olvido-contrasena.module').then(m => m.OlvidoContrasenaPageModule)
  },
  {
    path: 'perfil',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/perfil/perfil.module').then(m => m.PerfilPageModule)
  },

  {
    path: 'editar-perfil',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/editar-perfil/editar-perfil.module').then(m => m.EditarPerfilPageModule)
  },
  {
    path: 'info-cuenta-institucional',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/info-cuenta-institucional/info-cuenta-institucional.module').then(m => m.InfoCuentaInstitucionalPageModule)
  },
  {
    path: 'validar-cuenta',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/validar-cuenta/validar-cuenta.module').then(m => m.ValidarCuentaPageModule)
  },
  {
    path: 'seguidores',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/seguidores/seguidores.module').then(m => m.SeguidoresPageModule)
  },
  {
    path: 'seguidos',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/seguidos/seguidos.module').then(m => m.SeguidosPageModule)
  },
  {
    path: 'historial-eventos',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/historial-eventos/historial-eventos.module').then(m => m.HistorialEventosPageModule)
  },
  {
    path: 'perfil-user/:id',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/perfil-user/perfil-user.module').then(m => m.PerfilUserPageModule)
  },
  {
    path: 'crear-evento-flash',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/crear-evento-flash/crear-evento-flash.module').then(m => m.CrearEventoFlashPageModule)
  },
  {
    path: 'evento',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/evento/evento.module').then(m => m.EventoPageModule)
  },
  {
    path: 'reportar/:id',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/reportar/reportar.module').then(m => m.ReportarPageModule)
  },
  {
    path: 'sala-evento/:id',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/sala-evento/sala-evento.module').then(m => m.SalaEventoPageModule)
  },
  {
    path: 'detalle-evento/:id',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/detalle-evento/detalle-evento.module').then(m => m.DetalleEventoPageModule)
  },
  {
    path: 'sala-evento/:id',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/sala-evento/sala-evento.module').then(m => m.SalaEventoPageModule)
  },
  {
    path: 'publicaciones-guardadas',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/publicaciones-guardadas/publicaciones-guardadas.module').then(m => m.PublicacionesGuardadasPageModule)
  },
  {
    path: 'notificaciones',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/notificaciones/notificaciones.module').then(m => m.NotificacionesPageModule)
  },
  {
    path: 'buscar-persona',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/buscar-persona/buscar-persona.module').then(m => m.BuscarPersonaPageModule)
  },
  {
    path: 'event-insc-cread/:id/:titulo',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/event-insc-cread/event-insc-cread.module').then(m => m.EventInscCreadPageModule)
  },
  {
    path: 'reportar-cuenta/:id',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/reportar-cuenta/reportar-cuenta.module').then(m => m.ReportarCuentaPageModule)
  },
  {
    path: 'admin-reporte',
    canActivate: [AuthGuard, AdminGuard],
    loadChildren: () => import('./pages/admin-reporte/admin-reporte.module').then(m => m.AdminReportePageModule)
  },  {
    path: 'evento-finalizado',
    loadChildren: () => import('./pages/evento-finalizado/evento-finalizado.module').then( m => m.EventoFinalizadoPageModule)
  }
















];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
