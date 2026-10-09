import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppLanguage } from './translation.model';

export type { AppLanguage };

/** Centralizes application language selection and translation lookups. */
@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);
  private readonly storageKey = 'portfolio-language';
  private readonly refreshVersion = signal(0);

  readonly language = signal<AppLanguage>(this.getSavedLanguage());

  constructor() {
    this.translate.setFallbackLang('en');
    this.translate.use(this.language());
    this.translate.onLangChange.subscribe(({ lang }) => {
      this.document.documentElement.lang = lang;
      this.refreshVersion.update((version) => version + 1);
    });
  }

  setLanguage(language: AppLanguage): void {
    this.language.set(language);
    localStorage.setItem(this.storageKey, language);
    this.translate.use(language);
  }

  translateKey(key: string): string {
    this.refreshVersion();
    return this.translate.instant(key) as string;
  }

  private getSavedLanguage(): AppLanguage {
    const savedLanguage = localStorage.getItem(this.storageKey);
    return savedLanguage === 'es' ? 'es' : 'en';
  }
}
