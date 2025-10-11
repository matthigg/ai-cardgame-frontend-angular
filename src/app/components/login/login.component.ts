import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
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
import { CommonModule } from '@angular/common';
import { LoginService } from '../../services/login/login.service';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
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
  public loginService = inject(LoginService);
  public colorThemeService: ColorThemeService = inject(ColorThemeService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  loginFG = this.fb.group({
    loginName: '',
    createPlayerName: '',
    createCreature: '',
  });

  creatureTemplate = {};
  errorMessageCreate: WritableSignal<{ error: { detail: string } } | null> = signal(null);
  errorMessageGetCreatures: WritableSignal<{ error: { detail: string } } | null> = signal(null);
  errorMessageLogin: WritableSignal<{ error: { detail: string } } | null> = signal(null);
  Object = Object;

  ngOnInit(): void {
    this.colorThemeService.setTheme('Cyan', 'dark');

    this.battleService.getCreatures()
      .pipe(take(1))
      .subscribe(
        response => {
          this.creatureTemplate = response;
        },
        error => {
          this.errorMessageGetCreatures.set(error);
        }
      );
  }

  create(playerName: string | undefined | null, creature: string | undefined | null): any {
    if (playerName && creature) {
      this.loginService.postCreate(playerName, creature)
        .pipe(take(1))
        .subscribe(
          response => {
            this.router.navigate(['/dojo']);
          },
          error => {
            this.errorMessageCreate.set(error);
          }
        ); 
    }
  }

  login(playerName: string | undefined | null): any {
    if (playerName) {
      this.loginService.postLogin(playerName)
        .pipe(take(1))
        .subscribe(
          response => {
            this.router.navigate(['/dojo']);
          },
          error => {
            this.errorMessageLogin.set(error)
          }
        );
    }
  }
}
