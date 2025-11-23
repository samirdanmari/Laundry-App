import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AddOrder } from "../add-order/add-order";
import { ViewOrders } from "../view-orders/view-orders";
import { BaseChartDirective } from 'ng2-charts';
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [FormsModule, CommonModule, AddOrder, ViewOrders, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  username = '';
  role = '';
  overdueOrders: any[] = [];
  reportRange: any;
  showAddOrder = false;
  showDashboardContent = true;

constructor(private router: Router, private http: HttpClient) {}


// Method to toggle Add Order form visibility
toggleAddOrder() {
  this.showAddOrder = true;
  this.showDashboardContent = false;
}

// Method to handle order completion
handleOrderCompletion() {
  this.showAddOrder = false;
  this.showDashboardContent = true;
}
// Method to navigate to Sales Report
goToSalesReport() {
  this.router.navigate(['/sales-report']);
}
// Method to navigate to User Management
goToUserManagement() {
  this.router.navigate(['/user-management']);
}
// Method to navigate to Role Management
goToRoleManagement() {
  this.router.navigate(['/role-management']);
}

// Method to navigate to order setting
gotoOrderSettings(){
  this.router.navigate(['/order-settings']);
}

gotoAuditLog(){
this.router.navigate(['/audit-log'])
}

getOverdueOrders() {
  return this.http.get<any[]>('http://localhost:3000/api/orders/overdue-orders');
}

// load overdueorders
loadOverdueOrders(): void {
  this.getOverdueOrders().subscribe({
    next: (orders) => {
      this.overdueOrders = Array.isArray(orders) ? orders : [];
    },
    error: (err) => {
      console.error('Failed to load overdue orders', err);
      this.overdueOrders = [];
    }
  });
}


ngOnInit() {
  // Get user details from session storage
  // and set username and role for display
  const user = sessionStorage.getItem('user');
  if (user) {
    const parsed = JSON.parse(user);
    this.username = parsed.username;
    this.role = parsed.role;
  } else {
    this.router.navigate(['/']); // redirect to login if not logged in
  }
    this.loadOverdueOrders();
}

canAddOrder() {
  return ['Staff', 'Accountant', 'SuperAdmin'].includes(this.role);
}

canViewOrders() {
  const role = JSON.parse(sessionStorage.getItem('user') || '{}').role;
  return ['Staff', 'Accountant', 'SuperAdmin'].includes(role);
}

// Can generate report
canGenerateReport(){
 return ['Accountant', 'SuperAdmin'].includes(this.role);
}

canConfirmPayment() {
  return ['Accountant', 'SuperAdmin'].includes(this.role);
}

canAssignRoles() {
  return this.role === 'SuperAdmin';
}
canAuditLog(){
  return this.role === 'SuperAdmin';
}

// Method to logout user
logout() {
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const loginTime = sessionStorage.getItem('loginTime');

  this.http.post('http://localhost:3000/api/logout', {
    user,
    loginTime
  }).subscribe({
    next: () => {
      sessionStorage.clear();
      this.router.navigate(['/']);
    },
    error: () => {
      alert('Logout failed');
      sessionStorage.clear();
      this.router.navigate(['/']);
    }
  });
}

}