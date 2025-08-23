import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Roleservice } from './roleservice';
import { Router } from '@angular/router';
import { AuditLog } from "../audit-log/audit-log";
@Component({
  selector: 'app-role-management',
  imports: [CommonModule, FormsModule, AuditLog],
  templateUrl: './role-management.html',
  styleUrl: './role-management.css'
})
export class RoleManagement implements OnInit {
  usersWithRoles: any[] = [];
  availableRoles: any[] = [];
  selectedUser: any = null;
  showModal = false;
  newPassword = '';
  selectedPermission = '';


  constructor(private roleService: Roleservice) {}


  ngOnInit(): void {
    this.loadRoles();
    this.loadUsers();
  }
// Route to add user
  gotoUserManagement() {

    
  }
   loadRoles() {
    this.roleService.getRoles().subscribe(res => this.availableRoles = res);
  }
  

  loadUsers() {
    this.roleService.getUsersWithRoles().subscribe(res => this.usersWithRoles = res);
  }

  updateRole(user: any, event: Event) {
    const newRole = (event.target as HTMLSelectElement).value;

    if (user.role === 'SuperAdmin') {
      alert('🚫 Cannot modify SuperAdmin role');
      return;
    }

    this.roleService.assignRole(user.id, newRole).subscribe(() => {
      this.loadUsers();
    });
  }

openUserModal(userId: number) {
  this.roleService.getUserDetails(userId).subscribe(user => {
    this.selectedUser = user;
    this.showModal = true;
    this.selectedPermission = '';
  });
}

closeModal() {
  this.showModal = false;
  this.selectedUser = null;
  this.newPassword = '';
}
// assigne permission
assignPermission() {
  if (!this.selectedPermission) {
    alert('Please select a permission to assign.');
    return;
  }

  this.roleService.assignPermission(this.selectedUser.id, this.selectedPermission).subscribe(res => {
    alert(res.message);
    this.openUserModal(this.selectedUser.id); // Refresh user details
  }, err => {
    alert('Failed to assign permission.');
  });
}
// Remove permission
removePermission() {
  if (!this.selectedPermission) {
    alert('Please select a permission to remove.');
    return;
  }

  this.roleService.removePermission(this.selectedUser.id, this.selectedPermission).subscribe(res => {
    alert(res.message);
    this.openUserModal(this.selectedUser.id); // Refresh user details
  }, err => {
    alert('Failed to remove permission.');
  });
}

changeUserRole() {
  this.roleService.changeRole(this.selectedUser.id, this.selectedUser.role).subscribe(res => {
    alert(res.message);
    this.loadUsers();
  });
}

changeUserPassword() {
  this.roleService.changePassword(this.selectedUser.id, this.newPassword).subscribe(res => {
    alert(res.message);
    this.newPassword = '';
  });
}

deleteUser(userId: number) {
  if (confirm('Are you sure you want to delete this user?')) {
    this.roleService.deleteUser(userId).subscribe(res => {
      alert(res.message);
      this.selectedUser = null;
      this.loadUsers();
    });
  }
}





}
