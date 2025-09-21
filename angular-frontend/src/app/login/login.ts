import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login  implements OnInit{
  username = '';
  password = '';
  errorMessage = '';

  constructor(private http: HttpClient, private router: Router) {}

ngOnInit() {
  const user = sessionStorage.getItem('user');
  if (user) {
    this.router.navigate(['/dashboard']);
  }
}

 loginUser() {
  this.http.post<any>('http://localhost:3000/api/login', {
    username: this.username,
    password: this.password
  }).subscribe(
    res => {
      sessionStorage.setItem('user', JSON.stringify({ username: res.username, role: res.role }));
      this.router.navigate(['/dashboard']);
    },
    err => {
      this.errorMessage = err.error.message;
    }
  );
}

}