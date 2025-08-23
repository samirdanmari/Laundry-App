import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Report } from '../Interface/sales-report';
@Component({
  selector: 'app-sales-report',
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-report.html',
  styleUrl: './sales-report.css'
})

export class SalesReport {
  reportType: 'daily' | 'range' = 'daily';
  startDate = '';
  endDate = '';
  report: Report | null = null;

// Inject HttpClient in the constructor
constructor(private http: HttpClient) {}


  fetchReport() {
    this.http.post<Report>('http://localhost:3000/api/orders/sales-report', {
      startDate: this.startDate,
      endDate: this.endDate,
      reportType: this.reportType
    }).subscribe(
      res => this.report = res,
      err => console.error('Report fetch failed', err)
    );
  }
  printReport() {
  window.print();
}

}






