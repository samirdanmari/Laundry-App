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
statusFilter: 'All' | 'Paid' | 'Unpaid' | 'Unconfirmed' = 'All';
startDate = '';
endDate = '';
report: Report | null = null;

constructor(private http: HttpClient) {}


fetchReport() {
  this.http.post<Report>('http://localhost:3000/api/orders/sales-report', {
    startDate: this.startDate,
    endDate: this.endDate,
    reportType: this.reportType,
    statusFilter: this.statusFilter
  }).subscribe(
    res => this.report = res,
    err => console.error('Report fetch failed', err)
  );
}

// printReport() {
//   window.print();
// }
// }
printReport() {
  const printContents = document.getElementById('print-section')?.innerHTML;
  if (!printContents) {
    alert('Nothing to print');
    return;
  }

  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Sales Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; }
            h3, h4, h5 { margin: 10px 0; }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }
}
}

  // fetchReport() {
  //   this.http.post<Report>('http://localhost:3000/api/orders/sales-report', {
  //     startDate: this.startDate,
  //     endDate: this.endDate,
  //     reportType: this.reportType
  //   }).subscribe(
  //     res => this.report = res,
  //     err => console.error('Report fetch failed', err)
  //   );
  // }




