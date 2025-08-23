import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
import { Output, EventEmitter } from '@angular/core';   
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-add-order',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './add-order.html',
  styleUrl: './add-order.css'
})
export class AddOrder {
  roomNumber = '';
  customerName = '';
  contactNumber = '';
  expectedDate = '';
  items: any[] = [];
  newItem = { type: '', quantity: 1, price: 0, serviceType: 'Wash_only' };
  totalAmount = 0;
  message = '';
  showReceipt = false;
  user = JSON.parse(sessionStorage.getItem('user') || '{}');
  today = new Date().toISOString().split('T')[0];
  paymentMethod = 'Cash';
  isPaidMarked = false;

  resetForm() {
    this.roomNumber = '';
    this.customerName = '';
    this.contactNumber = '';
    this.expectedDate = '';
    this.items = [];
    this.newItem = { type: '', quantity: 1, price: 0, serviceType: 'Wash_only' };
    this.totalAmount = 0;
    this.message = '';
    this.showReceipt = false;
  }

  constructor(public http: HttpClient, private router: Router) {}

  addItem() {
    this.items.push({ ...this.newItem });
    this.newItem = { type: '', quantity: 1, price: 0, serviceType: 'Wash_only' };
    this.calculateTotal();
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
    this.calculateTotal();
  }

  editItem(index: number) {
    this.newItem = { ...this.items[index] };
    this.items.splice(index, 1);
    this.calculateTotal();
  }

  calculateTotal() {
    this.totalAmount = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  @Output() orderCompleted = new EventEmitter<void>();

saveOrder() {
  const payment_status = this.isPaidMarked ? 'Unconfirmed' : 'Unpaid';
  const orderData = {
    roomNumber: this.roomNumber,
    customerName: this.customerName,
    contactNumber: this.contactNumber,
    items: this.items,
    totalAmount: this.totalAmount,
    createdBy: this.user.username,
    date: this.today,
    expectedDate: this.expectedDate,
    payment_method: this.paymentMethod,
    payment_status: payment_status
  };

  this.http.post('http://localhost:3000/api/orders/add', orderData).subscribe(
    res => {
      this.message = 'Order saved successfully!';
      this.showReceipt = true;
    },
    err => this.message = 'Failed to add order.'
  );
}

  printReceipt() {
    window.print();
  }

}


