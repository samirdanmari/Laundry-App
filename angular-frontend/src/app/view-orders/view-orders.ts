import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { OrderDetail } from "../order-detail/order-detail";
import { FormsModule } from '@angular/forms';
// Mateial Modules
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
@Component({
  selector: 'app-view-orders',
  standalone: true,
  imports: [CommonModule, OrderDetail,FormsModule, MatTableModule, MatPaginatorModule, MatSortModule],
  templateUrl: './view-orders.html',
  styleUrl: './view-orders.css'
})
export class ViewOrders  implements OnInit{
    displayedColumns: string[] = ['room', 'name', 'contact', 'total', 'status', 'date', 'expected'];
  dataSource = new MatTableDataSource<any>();
  orders: any[] = [];
  selectedOrder: any = null;
  roomFilter = '';
  startDate = '';
  endDate = '';
  paidFilter = 'All'; // All, Paid, Unpaid

  // ViewChild to access MatPaginator
    @ViewChild(MatPaginator) paginator!: MatPaginator;
  
    //Inject HttpClient to make API calls 
  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchOrders();
    
  }

  fetchOrders() {
    this.http.get<any>('http://localhost:3000/api/orders/all')
      .subscribe(
        res => this.orders = res.orders,
        err => console.error('Failed to fetch orders:', err)
      );
    }
//Method to get Revenue Summary and Unpaid Order sum
get unpaidCount() {
  return this.filteredOrders.filter(order => order.payment_status == 'Unpaid').length;
}
  //  get length and total amount of unpaid orders
  get unpaidTotal() {
    return this.filteredOrders
      .filter(order => order.payment_status !== 'Paid' &&order.payment_status !== 'Unconfirmed' )
      .reduce((sum, order) => sum + order.total_amount, 0);
  }


// Method to get Unconfirmed Orders Count
get UnconfirmedCount() {
  return this.filteredOrders.filter(order => order.payment_status === 'Unconfirmed').length;
}
  get unconfirmedTotal() {
    return this.filteredOrders
      .filter(order => order.payment_status === 'Unconfirmed')
      .reduce((sum, order) => sum + order.total_amount, 0);
  }

// Method to get Paid Orders Total
get totalRevenue() {
  return this.filteredOrders
    .filter(order => order.payment_status === 'Paid' || order.payment_status === 'Unconfirmed')
    .reduce((sum, order) => sum + order.total_amount, 0);
}


// To View Order details modal
selectOrder(order: any) {
  this.selectedOrder = order;
}

//filter and search method
get filteredOrders() {
  return this.orders.filter(order => {
    const matchesRoom = this.roomFilter === '' || order.room_number.toLowerCase().includes(this.roomFilter.toLowerCase());
    
    const date = new Date(order.date);
    const matchesStart = this.startDate === '' || new Date(this.startDate) <= date;
    const matchesEnd = this.endDate === '' || date <= new Date(this.endDate);

    const matchesPaid = 
      this.paidFilter === 'All' || 
      (this.paidFilter === 'Paid' && order.payment_status === 'Paid') ||
      (this.paidFilter === 'Unpaid' && order.payment_status === 'Unpaid') ||
      (this.paidFilter === 'Unconfirmed' && order.payment_status === 'Unconfirmed');

    return matchesRoom && matchesStart && matchesEnd && matchesPaid;
  });
}


  
}

// 
