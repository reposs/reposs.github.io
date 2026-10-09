import { Component, input } from '@angular/core';

@Component({
  selector: 'app-section-heading',
  templateUrl: './section-heading.component.html',
  styleUrl: './section-heading.component.scss',
})
export class SectionHeadingComponent {
  readonly index = input<string>('');
  readonly kicker = input<string>('');
  readonly title = input<string>('');
  readonly subtitle = input<string>('');
}
