import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';


@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor(private storage: Storage) {
    this.initStorage();
   }

  private async initStorage() {
    await this.storage.create();
  }

  async setItem<T>(key: string, item: T): Promise<void> {
    await this.storage.set(key, item);
  }

  async getItem<T>(key: string): Promise<T | null> {
    return await this.storage.get(key);
  }

  async removeItem(key: string): Promise<void> {
    await this.storage.remove(key);
  }

  // Guardar en una lista (por tipo)
  async addToList<T>(type: string, item: T): Promise<void> {
    const existing: T[] = (await this.storage.get(type)) || [];
    existing.push(item);
    await this.storage.set(type, existing);
  }

  async getList<T>(type: string): Promise<T[]> {
    return (await this.storage.get(type)) || [];
  }

  // ✅ Reemplazar un elemento de una lista por ID
  async updateInList<T extends { id: any }>(key: string, updatedItem: T): Promise<void> {
    const existing: T[] = (await this.storage.get(key)) || [];
    const index = existing.findIndex(i => i.id === updatedItem.id);
    if (index > -1) {
      existing[index] = updatedItem;
      await this.storage.set(key, existing);
    }
  }



  // Filtrar por propiedad, por ejemplo: id_post en comentarios
  async getListByProp<T>(type: string, prop: keyof T, value: any): Promise<T[]> {
    const list: T[] = (await this.storage.get(type)) || [];
    return list.filter(item => item[prop] === value);
  }

  async clear(): Promise<void> {
    await this.storage.clear();
  }

}