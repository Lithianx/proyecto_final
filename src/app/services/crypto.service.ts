import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  private readonly CLAVE_SECRETA = 'p9X!v7@qL2#zR8$wS5^bT1&nM4*eJ6%h'; // Usa una clave fuerte y de 32 caracteres

  private str2ab(str: string): ArrayBuffer {
    return new TextEncoder().encode(str);
  }

  private ab2str(buf: ArrayBuffer): string {
    return new TextDecoder().decode(buf);
  }

  private async getCryptoKey(): Promise<CryptoKey> {
    return await crypto.subtle.importKey(
      'raw',
      this.str2ab(this.CLAVE_SECRETA),
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async cifrar(texto: string): Promise<string> {
    // No cifrar si es multimedia
    if (
      texto.startsWith('[imagen]') ||
      texto.startsWith('[video]') ||
      texto.startsWith('[audio]') ||
      texto.endsWith('.gif') ||
      texto.includes('giphy.com/media/')
    ) {
      return texto;
    }
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await this.getCryptoKey();
    const cifrado = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      this.str2ab(texto)
    );
    const buffer = new Uint8Array([...iv, ...new Uint8Array(cifrado)]);
    return btoa(String.fromCharCode(...buffer));
  }

  async descifrar(cifradoB64: string): Promise<string> {
    if (!cifradoB64 || typeof cifradoB64 !== 'string') return '';

    // Si es un mensaje multimedia, no intentes descifrar
    if (
      cifradoB64.startsWith('[imagen]') ||
      cifradoB64.startsWith('[video]') ||
      cifradoB64.startsWith('[audio]') ||
      cifradoB64.endsWith('.gif') ||
      cifradoB64.includes('giphy.com/media/')
    ) {
      return cifradoB64;
    }

    // Si la cadena es muy larga, probablemente es base64 de archivo multimedia, no cifrado
    if (cifradoB64.length > 1000) {
      return cifradoB64;
    }

    // Validar que sea base64 (muy simple, puedes mejorar la validación)
    try {
      atob(cifradoB64);
    } catch {
      // Si no es base64, retorna el texto tal cual (probablemente ya está plano)
      return cifradoB64;
    }
    try {
      const cifradoBytes = Uint8Array.from(atob(cifradoB64), c => c.charCodeAt(0));
      const iv = cifradoBytes.slice(0, 12);
      const data = cifradoBytes.slice(12);
      const key = await this.getCryptoKey();
      const descifrado = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      );
      return this.ab2str(descifrado);
    } catch {
      // Si falla el descifrado, retorna el texto tal cual
      return cifradoB64;
    }
  }
}