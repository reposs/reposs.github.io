import { Component, HostListener, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { TranslationService } from '../../../../core/i18n/translation.service';
import { CvService } from '../../services/cv.service';

@Component({
  selector: 'app-cv-modal',
  imports: [NgTemplateOutlet],
  templateUrl: './cv-modal.component.html',
  styleUrl: './cv-modal.component.scss',
})
export class CvModalComponent {
  protected readonly i18n = inject(TranslationService);
  protected readonly cvService = inject(CvService);

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    if (this.cvService.isOpen()) {
      this.close();
    }
  }

  close(): void {
    this.cvService.close();
  }

  printCv(): void {
    this.cvService.print();
  }
}
