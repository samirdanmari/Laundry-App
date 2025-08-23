import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-main-layout',
  imports: [RouterModule],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayout implements OnInit {
  username = '';
  role = '';

  ngOnInit() {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    this.username = user.username || '';
    this.role = user.role || '';
  }

  dashboard(){
     window.location.href = '/dashboard'; // Or use router.navigate(['/']);
  }

  logout() {
    sessionStorage.clear();
    window.location.href = '/'; // Or use router.navigate(['/']);
  }
}

