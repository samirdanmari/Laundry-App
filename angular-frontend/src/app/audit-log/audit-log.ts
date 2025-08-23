import { Component, OnInit } from '@angular/core';
import { Audit } from './audit';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-audit-log',
  imports: [DatePipe, CommonModule,FormsModule],
  templateUrl: './audit-log.html',
  styleUrl: './audit-log.css'
})
export class AuditLog implements OnInit {
  logs: any[] = [];


  constructor(private auditService: Audit) {}

  ngOnInit(): void {
    this.auditService.getAuditLogs().subscribe(data => {
      this.logs = data;
    });
  }
}


