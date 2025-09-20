import { inject, Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ColorThemeService {
  private fb: FormBuilder = inject(FormBuilder);

  colorThemeFormGroup = this.fb.group({
    colorThemeFC: '',
    lightOrDarkFC: false,
  });

  private currentTheme: string = 'blue';
  public themes = [
    'Red', 
    'Green', 
    'Blue',
    'Yellow',
    'Cyan',
    'Magenta',
    'Orange',
    'Chartreuse',
    'Spring-Green',
    'Azure',
    'Violet',
    'Rose'
  ];

  setTheme(theme: string, lightOrDark: string): void {
    const body = document.body;
    this.themes.forEach(oldTheme => {
      body.classList.remove(`${oldTheme.toLowerCase()}-theme-light`);
      body.classList.remove(`${oldTheme.toLowerCase()}-theme-dark`);
    });
    body.classList.add(`${theme.toLowerCase()}-theme-${lightOrDark}`);
    this.currentTheme = theme;
  }

  getTheme(): string {
    return this.currentTheme;
  }

  constructor() { }
}
