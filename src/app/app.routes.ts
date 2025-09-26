import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DojoComponent } from './components/dojo/dojo.component';
import { LoginComponent } from './components/login/login.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { 
    path: '', 
    component: DashboardComponent,
    children: [
      { path: 'dojo', component: DojoComponent },
      { path: 'login', component: LoginComponent },
    ]
  },
];
