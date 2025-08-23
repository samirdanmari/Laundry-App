import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.css'
})
export class OrderDetail implements OnInit{
currentTime = new Date().toLocaleString();
user = JSON.parse(sessionStorage.getItem('user') || '{}');
depositChannel = 'Main POS';
editedOrder: any = {};
editMode = false;
isAdmin = false;


  @Input() order: any;
  @Output() close = new EventEmitter<void>();

  constructor(private http: HttpClient) {}
ngOnInit() {
  this.editedOrder = JSON.parse(JSON.stringify(this.order));
  this.isAdmin = localStorage.getItem('role') === 'SuperAdmin';

  try {
    this.parsedItems = typeof this.order.items === 'string'
      ? JSON.parse(this.order.items)
      : this.order.items;
  } catch (e) {
    console.error('❌ Failed to parse items:', e);
    this.parsedItems = [];
  }
}

  parsedItems: any[] = [];


canConfirmPayment() {
  return ['Accountant', 'SuperAdmin'].includes(this.user.role)
    && this.order.payment_status !== 'Paid';
}

caneEditandDeleteOrder() {
  return ['SuperAdmin'].includes(this.user.role);
}
// this.order.payment_status === 'Unconfirmed', 
confirmPayment() {
  this.http.post(`http://localhost:3000/api/orders/confirm-payment/${this.order.id}`, {
    username: this.user.username,
    deposit_channel: this.depositChannel
  }).subscribe(
    res => {
      this.order.payment_status = 'Paid';
      this.order.payment_deposit_channel = this.depositChannel;
      this.order.payment_confirmed_by = this.user.username;
      this.order.payment_confirmed_at = new Date().toISOString();
    },
    err => console.error('Failed to confirm payment')
  );
}

// Check Permission If permited to edit or delete
  checkAdminPermission(): boolean {
    return localStorage.getItem('role') === 'SuperAdmin';
  }
// Edit Order
enableEdit() {
  this.editMode = true;
}

cancelEdit() {
  this.editMode = false;
  this.editedOrder = { ...this.order };
}


saveChanges() {
const payload = {
  ...this.order,
  customer_name: this.editedOrder.customer_name || this.order.customer_name,
  contact_number: this.editedOrder.contact_number || this.order.contact_number,
  room_number: this.editedOrder.room_number || this.order.room_number,
  total_amount: this.editedOrder.total_amount || this.order.total_amount,
  expected_date: this.editedOrder.expected_date || this.order.expected_date,
  payment_status: this.editedOrder.payment_status || this.order.payment_status,
  items: JSON.stringify(this.parsedItems)
};

  this.http.put(`http://localhost:3000/api/orders/${this.order.id}`, payload)
    .subscribe({
      next: res => {
        alert('Order updated');
        this.order = { ...payload };
        this.editedOrder = JSON.parse(JSON.stringify(this.order));
        this.parsedItems = JSON.parse(payload.items); 
        this.editMode = false;
        // this.isAdmin = localStorage.getItem('role') === 'SuperAdmin';
      },
      error: () => alert('Failed to update order')
    });
}


  
  // Delete Order
 deleteOrder() {
  if (confirm('Are you sure you want to delete this order?')) {
    this.http.delete(`http://localhost:3000/api/orders/${this.order.id}`)
      .subscribe({
        next: res => {
          alert('Order deleted');
          this.close.emit(); // Close modal after deletion
        },
        error: () => alert('Failed to delete order')
      });
  }
}


// reprint Receipt
  reprintReceipt() {
  const receiptContent = document.querySelector('.receipt-area')?.innerHTML;

  if (!receiptContent) {
    alert('Receipt content not found.');
    return;
  }

  const printWindow = window.open('', '_blank', 'width=600,height=800');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Reprint Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h3 { margin-bottom: 10px; }
            ul { list-style: none; padding: 0; }
            li { margin-bottom: 5px; }
            p { margin: 5px 0; }
          </style>
        </head>
        <body>
          ${receiptContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  } else {
    alert('Unable to open print window.');
  }
}

  // window.print();
}







