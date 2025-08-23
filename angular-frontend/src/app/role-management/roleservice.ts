import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })


export class Roleservice {
  private baseUrl = 'http://localhost:3000/api/roles';
    
  constructor(private http: HttpClient) {}

    getUsersWithRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/users-with-roles`);
  }
    getRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/roles`);
  }

    assignRole(userId: number, roleName: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/assign-role`, {
      user_id: userId,
      role_name: roleName
    });
  }

  getUserDetails(userId: number): Observable<any> {
  return this.http.get(`${this.baseUrl}/user/${userId}`);
}

changeRole(userId: number, newRole: string): Observable<any> {
  return this.http.post(`${this.baseUrl}/change-role`, { user_id: userId, new_role: newRole });
}

assignPermission(userId: number, permissionName: string): Observable<any> {
  return this.http.post(`${this.baseUrl}/assign-permission`, {
    user_id: userId,
    permission_name: permissionName
  });
}

removePermission(userId: number, permissionName: string): Observable<any> {
  return this.http.post(`${this.baseUrl}/remove-permission`, {
    user_id: userId,
    permission_name: permissionName
  });
}


changePassword(userId: number, newPassword: string): Observable<any> {
  return this.http.post(`${this.baseUrl}/change-password`, { user_id: userId, new_password: newPassword });
}

deleteUser(userId: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}/delete-user/${userId}`);
}

  

}













