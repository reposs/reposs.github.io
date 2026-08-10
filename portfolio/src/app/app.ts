import { Component, inject } from '@angular/core';
import { TranslationService } from './core/i18n/translation.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly i18n = inject(TranslationService);
}
