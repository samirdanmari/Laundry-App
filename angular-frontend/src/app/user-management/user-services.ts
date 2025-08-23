import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private baseUrl = 'http://localhost:3000/api/roles';

  constructor(private http: HttpClient) {}
 
  addUser(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/add-user`, data);
  }

 getRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/roles`);
  }
}
