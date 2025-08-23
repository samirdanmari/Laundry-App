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
  // username = '';
  // password = '';
  // category = 'Staff';
  // selectedRole = '';
  // roles: any[] = [];
    username = '';
  password = '';
  selectedRole = '';
  roles: any[] = [];

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.getRoles().subscribe(data => this.roles = data);
  }

  // addUser() {
  //   const newUser = {
  //     username: this.username,
  //     password: this.password,
  //     role: this.selectedRole,
  //     // category: this.category,
  //     // role_name: this.selectedRole
  //   };
    addUser() {
    const newUser = {
      username: this.username,
      password: this.password,
      role: this.selectedRole
    };


//     this.userService.addUser(newUser).subscribe(res => {
//       alert(res.message);
//       this.username = '';
//       this.password = '';
//       // this.category = 'Staff';
//       this.selectedRole = '';
//       this.ngOnInit(); // Refresh roles after adding a user
//     }, err => {
//       console.error('Error adding user:', err);
//       alert('Failed to add user. Please try again.');
//       this.username = '';
//       this.password = '';
//       // this.category = 'Staff';
//       this.selectedRole = '';
//       this.ngOnInit(); // Refresh roles even on error
//     });
//   }
// }
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
