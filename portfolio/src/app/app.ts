import { Component } from '@angular/core';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { PortfolioPageComponent } from './features/portfolio/portfolio-page.component';
import { CvModalComponent } from './features/cv/components/cv-modal/cv-modal.component';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, PortfolioPageComponent, FooterComponent, CvModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
