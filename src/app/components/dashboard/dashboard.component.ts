import {
  Component,
  inject,
  NgZone,
  OnInit,
  signal,
  WritableSignal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, Event, NavigationEnd } from '@angular/router';
import { filter, map, startWith } from 'rxjs';

// Angular Material (v19+)
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
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSidenavModule,
    NavbarComponent,
    SidenavToggleComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  public dojoService = inject(DojoService);
  public colorThemeService = inject(ColorThemeService);
  private router = inject(Router);
  private zone = inject(NgZone);

  // ✅ Convert the router's url$ observable into a signal
  activeRoute$ = this.router.events.pipe(
    filter((e): e is NavigationEnd => e instanceof NavigationEnd),
    map(e => e.urlAfterRedirects),
    startWith(this.router.url)
  );

  playerCreatureName = '';

  ngOnInit(): void {
    const playerFC = this.dojoService.dojoFormGroup?.get('playerFC');
    if (playerFC) {
      this.playerCreatureName = playerFC.value?.creatureName ?? '';
      playerFC.valueChanges?.subscribe(value => {
        this.playerCreatureName = value.creatureName;
      });
    }
  }
}
