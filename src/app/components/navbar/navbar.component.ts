import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login/login.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [ MatButtonModule, MatCardModule, MatToolbarModule ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  public loginService = inject(LoginService);
  private router = inject(Router);

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
}
