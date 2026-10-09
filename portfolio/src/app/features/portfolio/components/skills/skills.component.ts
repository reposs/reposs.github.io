import { Component, inject } from '@angular/core';
import { TranslationService } from '../../../../core/i18n/translation.service';
import { SectionHeadingComponent } from '../../../../shared/components/section-heading/section-heading.component';

@Component({
  selector: 'app-skills',
  imports: [SectionHeadingComponent],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss',
})
export class SkillsComponent {
  protected readonly i18n = inject(TranslationService);
}
