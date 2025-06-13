// src/app/guards/no-auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UsuarioService } from '../services/usuario.service';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {

  constructor(private usuarioService: UsuarioService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    if (!(await this.usuarioService.isLoggedIn())) {
      return true;
    } else {
      this.router.navigate(['/home']);
      return false;
    }
  }
}