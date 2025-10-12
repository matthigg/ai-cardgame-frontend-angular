import { OverlayContainer } from '@angular/cdk/overlay';
import { inject, Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ColorThemeService {
  private fb: FormBuilder = inject(FormBuilder);
  private overlay = inject(OverlayContainer);

  colorThemeFormGroup = this.fb.group({
    colorThemeFC: '',
    lightOrDarkFC: false,
  });

  private currentThemeClass: string = 'blue-theme-light'; // full class name
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

  constructor() {}

  setTheme(theme: string, lightOrDark: 'light' | 'dark'): void {
    const themeClass = `${theme.toLowerCase()}-theme-${lightOrDark}`;
    const body = document.body;
    const host = this.overlay.getContainerElement();

    // Remove all previous theme classes from body
    this.themes.forEach(oldTheme => {
      body.classList.remove(`${oldTheme.toLowerCase()}-theme-light`);
      body.classList.remove(`${oldTheme.toLowerCase()}-theme-dark`);
    });

    // Add the new theme class to body
    body.classList.add(themeClass);

    // Remove previous theme from overlay
    if (this.currentThemeClass) {
      host.classList.remove(this.currentThemeClass);
    }

    // Add new theme to overlay
    host.classList.add(themeClass);

    // Update current theme
    this.currentThemeClass = themeClass;

    console.log('--- Theme applied:', themeClass);
  }

  getTheme(): string {
    return this.currentThemeClass;
  }
}
