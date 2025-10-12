import { Component, effect, inject } from '@angular/core';
import { ColorThemeService } from '../../services/color-theme/color-theme.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PlayerModel } from '../../shared/models/players.model';
import { LoginService } from '../../services/login/login.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-settings-dialog',
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: './settings-dialog.component.html',
  styleUrl: './settings-dialog.component.scss',
})
export class SettingsDialogComponent {
  public colorThemeService = inject(ColorThemeService);
  public loginService = inject(LoginService);
  private router = inject(Router);
  private dialogRef = inject(MatDialogRef<SettingsDialogComponent>);
  userInfo: PlayerModel | null = null;

  // track whether confirmation is visible
  confirmingDelete = false;

  constructor() {
    effect(() => {
      this.userInfo = this.loginService.userInfoSignal();
    });
  }

  get colorThemeFC(): FormControl {
    return this.colorThemeService.colorThemeFormGroup.get('colorThemeFC') as FormControl;
  }

  get lightOrDarkFC(): FormControl {
    return this.colorThemeService.colorThemeFormGroup.get('lightOrDarkFC') as FormControl;
  }

  showDeleteConfirmation(): void {
    this.confirmingDelete = true;
  }

  cancelDelete(): void {
    this.confirmingDelete = false;
  }

  confirmDelete(playerName: string | undefined | null): void {
    if (!playerName) {
      this.router.navigate(['/login']);
      return;
    }

    this.loginService.postDelete(playerName)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.dialogRef.close(); 
          this.router.navigate(['/login']);
        },
        error: error => {
          this.confirmingDelete = false;
        }
      });
  }
}
