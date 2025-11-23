import { Component, OnInit } from '@angular/core';
import { Itemservice } from './itemservice';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-ordersettings',
  imports: [FormsModule, CurrencyPipe, CommonModule],
  templateUrl: './ordersettings.html',
  styleUrls: ['./ordersettings.css']
})
export class Ordersettings implements OnInit {
items: any[] = [];
newItem = {
  name: '',
  prices: {
    'Wash & Iron': 0,
    'Wash Only': 0,
    'Iron Only': 0
  }
};

ngOnInit() {
  this.loadItems();
}

  constructor(private itemService: Itemservice) {}

loadItems() {
  this.itemService.getItems().subscribe(res => this.items = res);
}

// saveItem() {
//   if (!this.newItem.name.trim()) {
//     alert('Item name is required');
//     return;
//   }
//   this.itemService.saveItem(this.newItem).subscribe((res: any) => {
//     alert(res.message);
//     this.newItem = {
//       name: '',
//       prices: {
//         'Wash & Iron': 0,
//         'Wash Only': 0,
//         'Iron Only': 0
//       }
//     };
//     this.loadItems();
//   });
// }
saveItem() {
  const payload = {
    name: this.newItem.name,
    prices: {
      'Wash & Iron': this.newItem.prices['Wash & Iron'],
      'Wash Only': this.newItem.prices['Wash Only'],
      'Iron Only': this.newItem.prices['Iron Only']
    }
  };

  this.itemService.saveItem(payload).subscribe((res: any) => {
    alert(res.message);
    this.loadItems();
  });
}



//   constructor(private http: HttpClient) {}
// items: any[] = [];
// newItem = { name: '', category: '', price: null };
// apiUrl = 'http://localhost:3000/api/orders';
// ngOnInit() {
//   this.loadItems();
// }

// loadItems() {
//   this.http.get<any[]>(`${this.apiUrl}/items`).subscribe(res => this.items = res);
// }

// saveItem() {
//   if (!this.newItem.name || !this.newItem.price) {
//     alert('Name and price are required');
//     return;
//   }

//   this.http.post<{ message: string }>(`${this.apiUrl}/items`, this.newItem).subscribe(res => {
//     alert(res.message);
//     this.newItem = { name: '', category: '', price: null };
//     this.loadItems();
//   });
// }

// deleteItem(id: number) {
//   if (confirm('Delete this item?')) {
//     this.http.delete(`${this.apiUrl}/items/${id}`).subscribe(() => this.loadItems());
//   }
// }

}
