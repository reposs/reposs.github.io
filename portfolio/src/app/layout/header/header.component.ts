import { Component, inject, signal } from '@angular/core';
import { TranslationService } from '../../core/i18n/translation.service';
import { ThemeService } from '../../core/theme/theme.service';
import { CvService } from '../../features/cv/services/cv.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  protected readonly i18n = inject(TranslationService);
  protected readonly themeService = inject(ThemeService);
  protected readonly cvService = inject(CvService);

  protected readonly mobileMenuOpen = signal(false);

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  onCvClick(): void {
    this.cvService.open();
    this.closeMobileMenu();
  }
}
