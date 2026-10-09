import { Component, inject } from '@angular/core';
import { TranslationService } from '../../../../core/i18n/translation.service';
import { SectionHeadingComponent } from '../../../../shared/components/section-heading/section-heading.component';

@Component({
  selector: 'app-education',
  imports: [SectionHeadingComponent],
  templateUrl: './education.component.html',
  styleUrl: './education.component.scss',
})
export class EducationComponent {
  protected readonly i18n = inject(TranslationService);
}
