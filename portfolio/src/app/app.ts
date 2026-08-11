import { Component, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { TranslationService } from './core/i18n/translation.service';
import { ThemeService } from './core/theme/theme.service';

@Component({
  selector: 'app-root',
  imports: [NgTemplateOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly i18n = inject(TranslationService);
  protected readonly themeService = inject(ThemeService);
  protected readonly isCvOpen = signal(false);

  openCv(): void {
    this.isCvOpen.set(true);
  }

  closeCv(): void {
    this.isCvOpen.set(false);
  }

  printCv(): void {
    window.print();
  }
}
