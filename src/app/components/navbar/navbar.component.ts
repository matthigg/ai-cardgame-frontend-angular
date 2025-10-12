import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login/login.service';
import { take } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SettingsDialogComponent } from '../settings-dialog/settings-dialog.component';

@Component({
  selector: 'app-navbar',
  imports: [ 
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

  navigateToDojo(): void {
    this.router.navigate(['/dojo']);
  };

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  };

  logout(playerName: string | undefined | null): any {
    if (playerName) {
      this.loginService.postLogout(playerName)
        .pipe(take(1))
        .subscribe(
          response => {
            console.log('--- logout response: ', response);
            this.router.navigate(['/login']);
          },
          error => {
            console.log('--- logout error: ', error);
          }
        );
    }
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(SettingsDialogComponent, {
      // data: {name: this.name(), animal: this.animal()},
      data: {},
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      // if (result !== undefined) {
      //   this.animal.set(result);
      // }
    });
  }
}
