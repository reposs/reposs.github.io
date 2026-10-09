import { Component, inject } from '@angular/core';
import { TranslationService } from '../../../../core/i18n/translation.service';
import { SectionHeadingComponent } from '../../../../shared/components/section-heading/section-heading.component';

@Component({
  selector: 'app-projects',
  imports: [SectionHeadingComponent],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
})
export class ProjectsComponent {
  protected readonly i18n = inject(TranslationService);
}
