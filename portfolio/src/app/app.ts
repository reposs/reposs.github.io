import { Component, inject } from '@angular/core';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { PortfolioPageComponent } from './features/portfolio/portfolio-page.component';
import { CvModalComponent } from './features/cv/components/cv-modal/cv-modal.component';
import { VisitTrackerService } from './core/analytics/visit-tracker.service';
import { InteractiveTiltService } from './core/ui/interactive-tilt.service';
import { BackendWarmupService } from './core/network/backend-warmup.service';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, PortfolioPageComponent, FooterComponent, CvModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly visitTracker = inject(VisitTrackerService);
  private readonly tiltService = inject(InteractiveTiltService);
  private readonly backendWarmup = inject(BackendWarmupService);

  constructor() {
    this.backendWarmup.warmUp();
    this.visitTracker.trackVisit();
    this.tiltService.init();
  }
}
