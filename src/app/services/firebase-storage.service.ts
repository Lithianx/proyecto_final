import { Injectable } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class FirebaseStorageService {

  constructor(private storage: Storage) { }

  /**
   * Convierte una imagen en base64 a un blob
   * @param base64String - String base64 de la imagen
   * @returns Blob de la imagen
   */
  private base64ToBlob(base64String: string): Blob {
    const byteCharacters = atob(base64String.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const mimeType = base64String.split(',')[0].split(':')[1].split(';')[0];
    
    return new Blob([byteArray], { type: mimeType });
  }

  /**
   * Sube una imagen a Firebase Storage
   * @param imageBase64 - String base64 de la imagen
   * @param folder - Carpeta donde guardar la imagen (por defecto 'publicaciones')
   * @returns URL de descarga de la imagen
   */
  async uploadImage(imageBase64: string, folder: string = 'publicaciones'): Promise<string> {
    try {
      // Generar nombre único para la imagen
      const fileName = `${uuidv4()}.jpg`;
      const filePath = `${folder}/${fileName}`;
      
      // Crear referencia al archivo
      const fileRef = ref(this.storage, filePath);
      
      // Convertir base64 a blob
      const blob = this.base64ToBlob(imageBase64);
      
      // Subir archivo
      const uploadResult = await uploadBytes(fileRef, blob);
      
      // Obtener URL de descarga
      const downloadURL = await getDownloadURL(uploadResult.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('Error al subir imagen:', error);
      throw new Error('Error al subir la imagen');
    }
  }

  /**
   * Elimina una imagen de Firebase Storage
   * @param imageUrl - URL de la imagen a eliminar
   */
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extraer el path de la URL
      const url = new URL(imageUrl);
      const path = decodeURIComponent(url.pathname.split('/o/')[1].split('?')[0]);
      
      // Crear referencia al archivo
      const fileRef = ref(this.storage, path);
      
      // Eliminar archivo
      await deleteObject(fileRef);
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      throw new Error('Error al eliminar la imagen');
    }
  }

  /**
   * Redimensiona una imagen base64 manteniendo la proporción
   * @param base64String - String base64 de la imagen
   * @param maxWidth - Ancho máximo
   * @param maxHeight - Alto máximo
   * @param quality - Calidad de la imagen (0-1)
   * @returns Promise<string> - Imagen redimensionada en base64
   */
  async resizeImage(
    base64String: string, 
    maxWidth: number = 1200, 
    maxHeight: number = 1200, 
    quality: number = 0.8
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('No se pudo crear el contexto del canvas'));
          return;
        }

        // Calcular nuevas dimensiones manteniendo la proporción
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Dibujar la imagen redimensionada
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a base64
        const resizedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(resizedBase64);
      };
      
      img.onerror = () => {
        reject(new Error('Error al cargar la imagen'));
      };
      
      img.src = base64String;
    });
  }

  /**
   * Comprime una imagen base64 y la sube a Firebase Storage
   * @param imageBase64 - String base64 de la imagen
   * @param folder - Carpeta donde guardar la imagen
   * @param maxWidth - Ancho máximo
   * @param maxHeight - Alto máximo
   * @param quality - Calidad de la imagen
   * @returns URL de descarga de la imagen comprimida
   */
  async uploadCompressedImage(
    imageBase64: string, 
    folder: string = 'publicaciones',
    maxWidth: number = 1200,
    maxHeight: number = 1200,
    quality: number = 0.8
  ): Promise<string> {
    try {
      // Redimensionar la imagen
      const resizedImage = await this.resizeImage(imageBase64, maxWidth, maxHeight, quality);
      
      // Subir la imagen redimensionada
      return await this.uploadImage(resizedImage, folder);
    } catch (error) {
      console.error('Error al comprimir y subir imagen:', error);
      throw new Error('Error al comprimir y subir la imagen');
    }
  }
}
