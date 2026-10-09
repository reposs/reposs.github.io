import { Component, inject, signal } from '@angular/core';
import { TranslationService } from '../../../../core/i18n/translation.service';
import { CvService } from '../../../cv/services/cv.service';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent {
  protected readonly i18n = inject(TranslationService);
  protected readonly cvService = inject(CvService);

  protected readonly emailCopied = signal(false);

  async copyEmail(): Promise<void> {
    try {
      await navigator.clipboard.writeText('rdavid.marquez.prieto@gmail.com');
      this.emailCopied.set(true);
      setTimeout(() => this.emailCopied.set(false), 2400);
    } catch {
      // Fallback if clipboard API is blocked
    }
  }

  onCvClick(): void {
    this.cvService.open();
  }

  openCv(): void {
    this.cvService.open();
  }
}
