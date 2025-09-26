import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [ MatButtonModule ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  private router = inject(Router);

  navigateToDojo(): void {
    this.router.navigate(['/dojo']);
  };

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  };
}
