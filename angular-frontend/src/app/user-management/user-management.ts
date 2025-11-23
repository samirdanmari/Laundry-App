import { Component, OnInit } from '@angular/core';
import { UserService } from './user-services';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-user-management',
  imports: [CommonModule, FormsModule ],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css'
})
export class UserManagement implements OnInit {
  username = '';
  password = '';
  selectedRole = '';
  roles: any[] = [];

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.getRoles().subscribe(data => this.roles = data);
  }

    addUser() {
    const newUser = {
      username: this.username,
      password: this.password,
      role: this.selectedRole
    };
    this.userService.addUser(newUser).subscribe(res => {
      alert(res.message);
      this.username = '';
      this.password = '';
      this.selectedRole = '';
    }, err => {
      alert('Failed to add user.');
    });
  }
}
