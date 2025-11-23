import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })

export class Roleservice {
  private baseUrl = 'http://localhost:3000/api/roles';

  constructor(private http: HttpClient) {}

  getRoles() {
    return this.http.get<any[]>(`${this.baseUrl}/roles`);
  }

  getUsersWithRoles() {
    return this.http.get<any[]>(`${this.baseUrl}/users-with-roles`);
  }

  getUserDetails(userId: number) {
    return this.http.get<any>(`${this.baseUrl}/user/${userId}`);
  }

  changeRole(userId: number, newRole: string, actorId: number) {
    return this.http.post(`${this.baseUrl}/change-role`, {
      user_id: userId,
      new_role: newRole,
      actorId
    });
  }

  assignPermission(userId: number, permissionName: string, actorId: number) {
    return this.http.post(`${this.baseUrl}/assign-permission`, {
      user_id: userId,
      permission_name: permissionName,
      actor_id: actorId
    });
  }

  removePermission(userId: number, permissionName: string, actorId: number) {
    return this.http.post(`${this.baseUrl}/remove-permission`, {
      user_id: userId,
      permission_name: permissionName,
      actor_id: actorId
    });
  }

  changePassword(userId: number, newPassword: string) {
    return this.http.post(`${this.baseUrl}/change-password`, {
      user_id: userId,
      new_password: newPassword
    });
  }

  deleteUser(userId: number) {
    return this.http.delete(`${this.baseUrl}/delete-user/${userId}`);
  }
}

// export class Roleservice {
//   private baseUrl = 'http://localhost:3000/api/roles';
    
//   constructor(private http: HttpClient) {}

//     getUsersWithRoles(): Observable<any[]> {
//     return this.http.get<any[]>(`${this.baseUrl}/users-with-roles`);
//   }
//     getRoles(): Observable<any[]> {
//     return this.http.get<any[]>(`${this.baseUrl}/roles`);
//   }

//   getUserDetails(userId: number): Observable<any> {
//   return this.http.get(`${this.baseUrl}/user/${userId}`);
// }

// // changeRole(userId: number, newRole: string): Observable<any> {
// //   return this.http.post(`${this.baseUrl}/change-role`, { user_id: userId, new_role: newRole });
// // }
//   changeRole(userId: number, newRole: string, actorId: number) {
//     return this.http.post(`${this.baseUrl}/change-role`, {
//       user_id: userId,
//       new_role: newRole,
//       actorId
//     });
//   }
  

// assignPermission(userId: number, permissionName: string): Observable<any> {
//   return this.http.post(`${this.baseUrl}/assign-permission`, {
//     user_id: userId,
//     permission_name: permissionName
//   });
// }

// removePermission(userId: number, permissionName: string): Observable<any> {
//   return this.http.post(`${this.baseUrl}/remove-permission`, {
//     user_id: userId,
//     permission_name: permissionName
//   });
// }


// changePassword(userId: number, newPassword: string): Observable<any> {
//   return this.http.post(`${this.baseUrl}/change-password`, { user_id: userId, new_password: newPassword });
// }

// deleteUser(userId: number): Observable<any> {
//   return this.http.delete(`${this.baseUrl}/delete-user/${userId}`);
// }















