import { Component, inject } from '@angular/core';
import { TranslationService } from '../../../../core/i18n/translation.service';
import { SectionHeadingComponent } from '../../../../shared/components/section-heading/section-heading.component';

@Component({
  selector: 'app-experience',
  imports: [SectionHeadingComponent],
  templateUrl: './experience.component.html',
  styleUrl: './experience.component.scss',
})
export class ExperienceComponent {
  protected readonly i18n = inject(TranslationService);
}
