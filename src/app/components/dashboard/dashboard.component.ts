import { Component, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { DojoService } from '../../services/dojo/dojo.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    MatButtonModule,
    MatSidenavModule,
    RouterModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  public dojoService: DojoService = inject(DojoService)
}
