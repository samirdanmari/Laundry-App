import { Component, OnInit } from '@angular/core';
import { Audit } from './audit';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-audit-log',
  imports: [CommonModule, FormsModule],
  templateUrl: './audit-log.html',
  styleUrl: './audit-log.css'
})
export class AuditLog implements OnInit {
auditLogs: any[] = [];



  constructor(private auditService: Audit) {}
  
  ngOnInit() {
    this.auditService.getAuditLogs().subscribe({
      next: logs => this.auditLogs = logs,
      error: () => alert('Failed to load audit logs')
    });
}

}


