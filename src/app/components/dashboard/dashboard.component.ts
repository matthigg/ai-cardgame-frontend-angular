import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, Event, NavigationStart } from '@angular/router'; // ✅ include both here

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';

import { DojoService } from '../../services/dojo/dojo.service';
import { ColorThemeService } from '../../services/color-theme/color-theme.service';
import { SidenavToggleComponent } from '../sidenav-toggle-button/sidenav-toggle-button.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { filter } from 'rxjs'; // ✅ RxJS v7+ uses this import

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSidenavModule,
    NavbarComponent,
    ReactiveFormsModule,
    RouterModule,
    SidenavToggleComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  public dojoService = inject(DojoService);
  public colorThemeService = inject(ColorThemeService);
  public router = inject(Router);

  playerCreatureName = '';

  ngOnInit(): void {
    this.playerCreatureName = this.dojoService.dojoFormGroup
      ?.get('playerFC')
      ?.value
      ?.creatureName;

    this.dojoService.dojoFormGroup
      ?.get('playerFC')
      ?.valueChanges
      ?.subscribe(response => {
        this.playerCreatureName = response.creatureName;
      });

    // ✅ Use the correct Angular Router event types
    this.router.events.pipe(
      filter((event: Event): event is NavigationStart => event instanceof NavigationStart)
    ).subscribe(event => {
      console.log('Navigation started:', event);
      // Perform actions when NavigationStart event occurs
    });
  }
}
