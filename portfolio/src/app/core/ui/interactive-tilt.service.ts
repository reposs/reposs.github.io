import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface GridTrailCell {
  x: number;
  y: number;
  alpha: number;
}

@Injectable({
  providedIn: 'root',
})
export class InteractiveTiltService {
  private readonly platformId = inject(PLATFORM_ID);
  private initialized = false;
  private rafId: number | null = null;

  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private mouseX = -1000;
  private mouseY = -1000;
  private readonly gridSize = 32;
  private readonly trailCells: GridTrailCell[] = [];

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

    this.createCadCanvas();
    this.decorateCadCorners();

    window.addEventListener(
      'mousemove',
      (event: MouseEvent) => {
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;

        const gx = Math.floor(this.mouseX / this.gridSize) * this.gridSize;
        const gy = Math.floor(this.mouseY / this.gridSize) * this.gridSize;
        const existing = this.trailCells.find((c) => c.x === gx && c.y === gy);
        if (existing) {
          existing.alpha = 0.42;
        } else {
          this.trailCells.push({ x: gx, y: gy, alpha: 0.42 });
          if (this.trailCells.length > 26) {
            this.trailCells.shift();
          }
        }

        const coordsEl = document.getElementById('hud-grid-coords');
        if (coordsEl) {
          coordsEl.textContent = `X:${String(Math.round(this.mouseX)).padStart(4, '0')} Y:${String(Math.round(this.mouseY)).padStart(4, '0')}`;
        }

        if (this.rafId === null) {
          this.rafId = requestAnimationFrame(() => {
            this.updateCards(this.mouseX, this.mouseY);
            this.rafId = null;
          });
        }
      },
      { passive: true },
    );

    // Ensure corner markers are applied once DOM components finish rendering
    setTimeout(() => this.decorateCadCorners(), 400);
    this.startCanvasLoop();
  }

  private createCadCanvas(): void {
    const canvas = document.createElement('canvas');
    canvas.id = 'quantum-cad-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, {
      position: 'fixed',
      inset: '0',
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: '0',
    });
    document.body.prepend(canvas);
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    const resize = () => {
      if (!this.canvas) return;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });
  }

  private decorateCadCorners(): void {
    const cards = document.querySelectorAll<HTMLElement>(this.cardSelector);
    cards.forEach((card) => {
      if (card.querySelector('.cad-corner-mark')) {
        return;
      }
      const positions = ['tl', 'tr', 'bl', 'br'];
      for (const pos of positions) {
        const mark = document.createElement('span');
        mark.className = `cad-corner-mark cad-${pos}`;
        mark.setAttribute('aria-hidden', 'true');
        mark.textContent = '+';
        card.appendChild(mark);
      }
    });
  }

  private startCanvasLoop(): void {
    const render = () => {
      if (this.canvas && this.ctx) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const ctx = this.ctx;
        ctx.clearRect(0, 0, w, h);

        const isDark = document.documentElement.classList.contains('dark-mode');
        const baseLine = isDark ? 'rgba(56, 189, 248, 0.065)' : 'rgba(30, 64, 175, 0.065)';

        // 1. Base CAD grid lines
        ctx.strokeStyle = baseLine;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x <= w; x += this.gridSize) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
        }
        for (let y = 0; y <= h; y += this.gridSize) {
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
        }
        ctx.stroke();

        // 2. Illuminated quantum trail cells under cursor path
        for (let i = this.trailCells.length - 1; i >= 0; i--) {
          const cell = this.trailCells[i];
          cell.alpha *= 0.93;
          if (cell.alpha < 0.015) {
            this.trailCells.splice(i, 1);
            continue;
          }
          ctx.fillStyle = isDark
            ? `rgba(0, 242, 254, ${cell.alpha * 0.38})`
            : `rgba(37, 99, 235, ${cell.alpha * 0.28})`;
          ctx.fillRect(cell.x + 1, cell.y + 1, this.gridSize - 2, this.gridSize - 2);

          ctx.strokeStyle = isDark
            ? `rgba(0, 242, 254, ${cell.alpha * 0.95})`
            : `rgba(29, 78, 216, ${cell.alpha * 0.85})`;
          ctx.strokeRect(cell.x + 0.5, cell.y + 0.5, this.gridSize - 1, this.gridSize - 1);
        }

        // 3. Illuminated calibration crosshairs (+) at grid intersections near cursor
        if (this.mouseX >= 0 && this.mouseY >= 0) {
          const radius = 190;
          const startX = Math.max(0, Math.floor((this.mouseX - radius) / this.gridSize) * this.gridSize);
          const endX = Math.min(w, Math.ceil((this.mouseX + radius) / this.gridSize) * this.gridSize);
          const startY = Math.max(0, Math.floor((this.mouseY - radius) / this.gridSize) * this.gridSize);
          const endY = Math.min(h, Math.ceil((this.mouseY + radius) / this.gridSize) * this.gridSize);

          for (let x = startX; x <= endX; x += this.gridSize) {
            for (let y = startY; y <= endY; y += this.gridSize) {
              const dist = Math.hypot(x - this.mouseX, y - this.mouseY);
              if (dist < radius) {
                const intensity = (1 - dist / radius) * 0.8;
                ctx.strokeStyle = isDark
                  ? `rgba(0, 242, 254, ${intensity})`
                  : `rgba(29, 78, 216, ${intensity})`;
                ctx.beginPath();
                ctx.moveTo(x - 3.5, y);
                ctx.lineTo(x + 3.5, y);
                ctx.moveTo(x, y - 3.5);
                ctx.lineTo(x, y + 3.5);
                ctx.stroke();
              }
            }
          }
        }
      }
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }

  private updateCards(clientX: number, clientY: number): void {
    const cards = document.querySelectorAll<HTMLElement>(this.cardSelector);
    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      if (rect.bottom < -120 || rect.top > window.innerHeight + 120) {
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
        const maxTilt = rect.width > 650 ? 2.0 : 4.2;
        const rotateX = ((y - centerY) / centerY) * -maxTilt;
        const rotateY = ((x - centerX) / centerX) * maxTilt;
        card.style.transform = `perspective(1100px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-5px) scale(1.006)`;
      } else {
        card.style.transform = '';
      }
    });
  }
}
