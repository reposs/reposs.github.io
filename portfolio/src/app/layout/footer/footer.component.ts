import { Component, inject } from '@angular/core';
import { TranslationService } from '../../core/i18n/translation.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  protected readonly i18n = inject(TranslationService);
}
