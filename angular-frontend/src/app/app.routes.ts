import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Dashboard } from './dashboard/dashboard';
import { AddOrder } from './add-order/add-order';
import { SalesReport } from './sales-report/sales-report';
import { MainLayout } from './main-layout/main-layout';
import { RoleManagement } from './role-management/role-management';
import { UserManagement } from './user-management/user-management';
import { Ordersettings } from './setting/ordersettings/ordersettings';
import { AuditLog } from './audit-log/audit-log';
export const routes: Routes = [
{ path: '', component: Login },
  {
  path: '',
  component: MainLayout,
  children: [
    { path: 'dashboard', component: Dashboard },
    { path: 'add-order', component: AddOrder },
    { path: 'sales-report', component: SalesReport },
    {path: 'order-settings', component: Ordersettings},
    { path: 'role-management', component: RoleManagement },
    { path: 'user-management', component: UserManagement },
    { path: 'audit-log', component: AuditLog },
    // other routes here
  ]
}
]


