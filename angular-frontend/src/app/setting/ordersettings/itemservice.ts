import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class Itemservice {
  apiUrl = 'http://localhost:3000/api/orders';
  constructor(private http: HttpClient) { }

  getItems() {
  return this.http.get<any[]>(`${this.apiUrl}/items`);
}

saveItem(item: { name: string, prices: { [key: string]: number } }) {
  return this.http.post(`${this.apiUrl}/items`, item);
}

}
