import { Component } from '@angular/core';
import { HeroComponent } from './components/hero/hero.component';
import { MetricsComponent } from './components/metrics/metrics.component';
import { PillarsComponent } from './components/pillars/pillars.component';
import { SkillsComponent } from './components/skills/skills.component';
import { ExperienceComponent } from './components/experience/experience.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { EducationComponent } from './components/education/education.component';
import { ContactCtaComponent } from './components/contact-cta/contact-cta.component';

@Component({
  selector: 'app-portfolio-page',
  imports: [
    HeroComponent,
    MetricsComponent,
    PillarsComponent,
    SkillsComponent,
    ExperienceComponent,
    ProjectsComponent,
    EducationComponent,
    ContactCtaComponent,
  ],
  templateUrl: './portfolio-page.component.html',
  styleUrl: './portfolio-page.component.scss',
})
export class PortfolioPageComponent {}
