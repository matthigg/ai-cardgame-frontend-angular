import { Component, inject } from '@angular/core';
import { ColorThemeService } from '../../services/color-theme/color-theme.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-settings-dialog',
  imports: [
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: './settings-dialog.component.html',
  styleUrl: './settings-dialog.component.scss'
})
export class SettingsDialogComponent {
  public colorThemeService: ColorThemeService = inject(ColorThemeService);

  get colorThemeFC(): FormControl {
    return this.colorThemeService.colorThemeFormGroup.get('colorThemeFC') as FormControl;
  }

  get lightOrDarkFC(): FormControl {
    return this.colorThemeService.colorThemeFormGroup.get('lightOrDarkFC') as FormControl;
  }
}
