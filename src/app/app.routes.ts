import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DojoComponent } from './components/dojo/dojo.component';

export const routes: Routes = [
  { 
    path: '', 
    component: DashboardComponent,
    children: [
      { path: 'dojo', component: DojoComponent }
    ] 
  }
];
