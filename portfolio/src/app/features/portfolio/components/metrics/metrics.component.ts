import { Component, inject } from '@angular/core';
import { TranslationService } from '../../../../core/i18n/translation.service';

@Component({
  selector: 'app-metrics',
  templateUrl: './metrics.component.html',
  styleUrl: './metrics.component.scss',
})
export class MetricsComponent {
  protected readonly i18n = inject(TranslationService);
}
