import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class InteractiveTiltService {
  private readonly platformId = inject(PLATFORM_ID);
  private initialized = false;
  private rafId: number | null = null;

  private readonly cardSelector = [
    '.hero-profile-card',
    '.proof-card',
    '.pillar-card',
    '.skill-card',
    '.timeline-card',
    '.project-card',
    '.edu-card',
    '.side-card',
    '.cta-inner',
  ].join(', ');

  init(): void {
    if (!isPlatformBrowser(this.platformId) || this.initialized) {
      return;
    }
    this.initialized = true;

    // Respect touch-only devices where hover tilt isn't applicable
    if (window.matchMedia?.('(hover: none)').matches) {
      return;
    }

    window.addEventListener(
      'mousemove',
      (event: MouseEvent) => {
        if (this.rafId !== null) {
          cancelAnimationFrame(this.rafId);
        }
        this.rafId = requestAnimationFrame(() => {
          this.updateCards(event.clientX, event.clientY);
          this.rafId = null;
        });
      },
      { passive: true },
    );
  }

  private updateCards(clientX: number, clientY: number): void {
    const cards = document.querySelectorAll<HTMLElement>(this.cardSelector);
    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      // Only compute for cards near the viewport
      if (rect.bottom < -100 || rect.top > window.innerHeight + 100) {
        return;
      }

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      card.style.setProperty('--mx', `${x.toFixed(1)}px`);
      card.style.setProperty('--my', `${y.toFixed(1)}px`);

      const isInside = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
      if (isInside) {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        // Gentle, high-precision 3D levitation (stronger on smaller cards, subtler on wide timeline cards)
        const maxTilt = rect.width > 650 ? 2.2 : 4.5;
        const rotateX = ((y - centerY) / centerY) * -maxTilt;
        const rotateY = ((x - centerX) / centerX) * maxTilt;
        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-5px) scale(1.008)`;
      } else {
        card.style.transform = '';
      }
    });
  }
}
