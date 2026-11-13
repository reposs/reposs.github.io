import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class BackendWarmupService {
  private readonly platformId = inject(PLATFORM_ID);

  private readonly backendUrls: readonly string[] = [
    'https://demo-nestjs-myw0.onrender.com/docs',
    'https://fastapi-demo-1373c10f.fastapicloud.dev/docs',
  ];

  warmUp(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Fire immediate non-blocking wake-up pings as soon as the portfolio loads
    for (const url of this.backendUrls) {
      this.pingEndpoint(url);
    }
  }

  private pingEndpoint(url: string): void {
    try {
      const separator = url.includes('?') ? '&' : '?';
      const cacheBustedUrl = `${url}${separator}_wakeup=${Date.now()}`;

      void fetch(cacheBustedUrl, {
        method: 'GET',
        mode: 'no-cors',
        cache: 'no-store',
        credentials: 'omit',
      }).catch(() => {
        // Ignore network/cold-start timeouts silently so visitor UX is unaffected
      });
    } catch {
      // Fail silently
    }
  }
}
