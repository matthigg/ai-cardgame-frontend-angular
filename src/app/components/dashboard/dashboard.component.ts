import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

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

@Component({
  selector: 'app-dashboard',
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
export class DashboardComponent {
  public dojoService: DojoService = inject(DojoService);
  public colorThemeService: ColorThemeService = inject(ColorThemeService);

  playerCreatureName: string = '';

  ngOnInit(): void {
    this.playerCreatureName = this.dojoService.dojoFormGroup
      ?.get('playerFC')
      ?.value
      ?.creatureName;
    
    this.dojoService.dojoFormGroup
      ?.get('playerFC')
      ?.valueChanges
      ?.subscribe(response => {
        this.playerCreatureName = response;
      });
  }

  get colorThemeFC(): FormControl {
    return this.colorThemeService.colorThemeFormGroup.get('colorThemeFC') as FormControl;
  }

  get lightOrDarkFC(): FormControl {
    return this.colorThemeService.colorThemeFormGroup.get('lightOrDarkFC') as FormControl;
  }

}
