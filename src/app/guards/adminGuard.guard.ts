import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UsuarioService } from '../services/usuario.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private usuarioService: UsuarioService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    const usuario = await this.usuarioService.getUsuarioActualConectado();
    if (usuario && usuario.rol === 'admin') {
      return true;
    } else {
      this.router.navigate(['/home']);
      return false;
    }
  }
}