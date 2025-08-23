import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AddOrder } from "../add-order/add-order";
import { ViewOrders } from "../view-orders/view-orders";
import { BaseChartDirective } from 'ng2-charts';
import { AuditLog } from "../audit-log/audit-log";


@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [FormsModule, CommonModule, AddOrder, ViewOrders, BaseChartDirective, AuditLog],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  username = '';
  role = '';
  reportRange: any;
  showAddOrder = false;
  showDashboardContent = true;

constructor(private router: Router) {}

// Chart data for dashboard
dailyRevenueData = [
  { data: [2000, 3200, 2800, 4500, 3900], label: 'Daily ₦' }
];

monthlyLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
monthlyRevenueData = [
  { data: [42000, 53000, 47000, 61000, 58000], label: 'Monthly ₦' }
];

statusLabels = ['Paid', 'Unconfirmed', 'Unpaid'];
statusRevenueData = [
  {
    data: [145000, 12000, 7000],
    backgroundColor: ['#4CAF50', '#FFC107', '#F44336'],
    label: 'Revenue Status'
  }
];


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

gotoAuditLog(){
this.router.navigate(['/audit-log'])
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
}

// Method to logout user
logout() {
  sessionStorage.clear();
  this.router.navigate(['/']);
}


// Method to check user roles for different functionalities

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



}
