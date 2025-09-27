import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { take } from 'rxjs';
import { BattleService } from '../../services/battle/battle.service';
import { ColorThemeService } from '../../services/color-theme/color-theme.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    MatToolbarModule,
    ReactiveFormsModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  public battleService = inject(BattleService);
  public colorThemeService: ColorThemeService = inject(ColorThemeService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  loginFG = this.fb.group({
    loginName: '',
    createPlayerName: '',
    createCreature: '',
  });

  creatureTemplate = {};
  errorMessage = signal(null);
  loggedInUser = {};
  Object = Object;

  ngOnInit(): void {
    this.colorThemeService.setTheme('Cyan', 'dark');

    this.battleService.getCreatures()
      .pipe(take(1))
      .subscribe(response => {
        console.log('--- creature tempalte response: ', response);
        this.creatureTemplate = response;
      });
  }

  create(playerName: string | undefined | null, creature: string | undefined | null): any {
    if (playerName && creature) {
      this.battleService.postCreate(playerName, creature)
        .pipe(take(1))
        .subscribe(
          response => {
            console.log('--- create response: ', response);
            this.loggedInUser = response;
            this.router.navigate(['/dojo']);
          },
          error => {
            console.log('--- create error: ', error);
          }
        ); 
    }
  }

  login(playerName: string | undefined | null): any {
    if (playerName) {
      this.battleService.postLogin(playerName)
        .pipe(take(1))
        .subscribe(response => {
          console.log('--- login response: ', response);
          this.router.navigate(['/dojo']);
        });
    }
  }
}
