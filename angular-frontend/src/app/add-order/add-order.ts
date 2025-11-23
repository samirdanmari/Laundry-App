import { Component, OnInit } from '@angular/core';
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
export class AddOrder  {
  roomNumber = '';
  customerName = '';
  contactNumber = '';
  expectedDate = '';
  items: any[] = [];

  itemPriceMap: any = {}; // { Shirt: { 'Wash & Iron': 500, 'Wash Only': 300, 'Iron Only': 200 }, ... }
  availableItems: string[] = [];
  serviceTypes = ['Wash & Iron', 'Wash Only', 'Iron Only'];

  newItem = {
    type: '',
    quantity: 1,
    serviceType: 'Wash Only',
    price: 0
  };

  totalAmount = 0;
  message = '';
  showReceipt = false;
  user = JSON.parse(sessionStorage.getItem('user') || '{}');
  today = new Date().toISOString().split('T')[0];
  paymentMethod = 'Cash';
  isPaidMarked = false;

  @Output() orderCompleted = new EventEmitter<void>();

  constructor(public http: HttpClient, private router: Router) {
    this.loadItemPrices();
  }

  loadItemPrices() {
    this.http.get<any>('http://localhost:3000/api/orders/item-price-map').subscribe(res => {
      this.itemPriceMap = res;
      this.availableItems = Object.keys(res);
    });
  }

  updatePrice() {
    const itemPrices = this.itemPriceMap[this.newItem.type];
    this.newItem.price = itemPrices?.[this.newItem.serviceType] || 0;
  }

  addItem() {
    if (!this.newItem.type || !this.newItem.serviceType || this.newItem.price <= 0) {
      alert('Please select valid item and service type');
      return;
    }

    this.items.push({ ...this.newItem });
    this.newItem = { type: '', quantity: 1, price: 0, serviceType: 'Wash Only' };
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

  resetForm() {
    this.roomNumber = '';
    this.customerName = '';
    this.contactNumber = '';
    this.expectedDate = '';
    this.items = [];
    this.newItem = { type: '', quantity: 1, price: 0, serviceType: 'Wash Only' };
    this.totalAmount = 0;
    this.message = '';
    this.showReceipt = false;
  }

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
      (res: any) => {
        this.message = res.message || 'Order saved successfully!';
        this.showReceipt = true;
        this.orderCompleted.emit();
      },
      err => this.message = 'Failed to add order.'
    );
  }

  printReceipt() {
    window.print();
  }
}

//   roomNumber = '';
//   customerName = '';
//   contactNumber = '';
//   expectedDate = '';
//   items: any[] = [];
//   newItem = { type: '', quantity: 1, price: 0, serviceType: 'Wash_only' };
// selectedItem = '';
// selectedService = '';
//   totalAmount = 0;
//   message = '';
//   showReceipt = false;
//   user = JSON.parse(sessionStorage.getItem('user') || '{}');
//   today = new Date().toISOString().split('T')[0];
//   paymentMethod = 'Cash';
//   isPaidMarked = false;

//   resetForm() {
//     this.roomNumber = '';
//     this.customerName = '';
//     this.contactNumber = '';
//     this.expectedDate = '';
//     this.items = [];
//     this.newItem = { type: '', quantity: 1, price: 0, serviceType: 'Wash_only' };
//     this.totalAmount = 0;
//     this.message = '';
//     this.showReceipt = false;
//   }

//   constructor(public http: HttpClient, private router: Router) {}

//   addItem() {
//     this.items.push({ ...this.newItem });
//     this.newItem = { type: '', quantity: 1, price: 0, serviceType: 'Wash_only' };
//     this.calculateTotal();
//   }

//   removeItem(index: number) {
//     this.items.splice(index, 1);
//     this.calculateTotal();
//   }

//   editItem(index: number) {
//     this.newItem = { ...this.items[index] };
//     this.items.splice(index, 1);
//     this.calculateTotal();
//   }

//   calculateTotal() {
//     this.totalAmount = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
//   }

//   @Output() orderCompleted = new EventEmitter<void>();

// saveOrder() {
//   const payment_status = this.isPaidMarked ? 'Unconfirmed' : 'Unpaid';
//   const orderData = {
//     roomNumber: this.roomNumber,
//     customerName: this.customerName,
//     contactNumber: this.contactNumber,
//     items: this.items,
//     totalAmount: this.totalAmount,
//     createdBy: this.user.username,
//     date: this.today,
//     expectedDate: this.expectedDate,
//     payment_method: this.paymentMethod,
//     payment_status: payment_status
//   };

//   this.http.post('http://localhost:3000/api/orders/add', orderData).subscribe(
//     res => {
//       this.message = 'Order saved successfully!';
//       this.showReceipt = true;
//     },
//     err => this.message = 'Failed to add order.'
//   );
// }

//   printReceipt() {
//     window.print();
//   }

// }


