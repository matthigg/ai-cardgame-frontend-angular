import { Component, effect, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login/login.service';
import { take } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SettingsDialogComponent } from '../settings-dialog/settings-dialog.component';
import { PlayerModel } from '../../shared/models/players.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [ 
    CommonModule,
    MatButtonModule, 
    MatCardModule, 
    MatDialogModule, 
    MatToolbarModule 
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  public loginService = inject(LoginService);
  private router = inject(Router);
  readonly dialog = inject(MatDialog);
  userInfo: PlayerModel | null = null;

  constructor() {
    effect(() => {
      this.userInfo = this.loginService.userInfoSignal()
    })
  }

  navigateToDojo(): void {
    this.router.navigate(['/dojo']);
  };

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  };

  navigateToNeurodeck(): void {
    this.router.navigate(['/neurodeck']);
  }

  logout(): void {
    this.loginService.userInfoSignal.set(null);
    this.router.navigate(['/login']);
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(SettingsDialogComponent, {
      data: {},
    });

    dialogRef.afterClosed().pipe(take(1)).subscribe(result => {
    });
  }
}
