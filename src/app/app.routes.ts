import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DojoComponent } from './components/dojo/dojo.component';
import { LoginComponent } from './components/login/login.component';
import { NeurodeckComponent } from './components/neurodeck/neurodeck.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: '', 
    component: DashboardComponent,
    children: [
      { path: 'dojo', component: DojoComponent },
      { path: 'neurodeck', component: NeurodeckComponent },
    ]
  },
];
