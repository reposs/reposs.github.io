import { Component, inject } from '@angular/core';
import { TranslationService } from '../../../../core/i18n/translation.service';
import { SectionHeadingComponent } from '../../../../shared/components/section-heading/section-heading.component';

@Component({
  selector: 'app-pillars',
  imports: [SectionHeadingComponent],
  templateUrl: './pillars.component.html',
  styleUrl: './pillars.component.scss',
})
export class PillarsComponent {
  protected readonly i18n = inject(TranslationService);
}
