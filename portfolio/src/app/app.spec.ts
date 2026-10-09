import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { App } from './app';
import { CvService } from './features/cv/services/cv.service';
import { ThemeService } from './core/theme/theme.service';

describe('App', () => {
  beforeEach(async () => {
    localStorage.removeItem('portfolio-theme');
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideTranslateService({
          fallbackLang: 'es',
          lang: 'es',
        }),
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render brand name in navbar', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.brand-name')?.textContent).toContain('Roberto David');
  });

  it('should toggle CV modal state via CvService', () => {
    const cvService = TestBed.inject(CvService);
    expect(cvService.isOpen()).toBe(false);
    cvService.open();
    expect(cvService.isOpen()).toBe(true);
    cvService.close();
    expect(cvService.isOpen()).toBe(false);
  });

  it('should default to dark theme in ThemeService', () => {
    const themeService = TestBed.inject(ThemeService);
    expect(themeService.theme()).toBe('dark');
  });
});
