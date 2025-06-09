
import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage-social.service';
import { Comentario } from 'src/app/models/comentario.model';

@Injectable({ providedIn: 'root' })
export class ComentarioService {
  constructor(private localStorage: LocalStorageService) { }


}