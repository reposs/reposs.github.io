import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface GeoIpData {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  org?: string;
}

@Injectable({
  providedIn: 'root',
})
export class VisitTrackerService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly storageKey = 'portfolio_visit_notified_v1';
  private readonly notifyEndpoint = 'https://formsubmit.co/ajax/rdavid.marquez.prieto@gmail.com';

  trackVisit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const isForceTest = urlParams.get('trackTest') === '1';

      // Ignore local development unless ?trackTest=1 is explicitly passed
      const hostname = window.location.hostname;
      if (
        !isForceTest &&
        (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.'))
      ) {
        return;
      }

      // Filter out automated bots, crawlers, and lighthouse checks
      const userAgent = navigator.userAgent || '';
      if (/bot|crawler|spider|headless|lighthouse|pagespeed|slurp|bingpreview/i.test(userAgent)) {
        return;
      }

      // Avoid sending duplicate emails on page reload within the same session
      if (!isForceTest && sessionStorage.getItem(this.storageKey) === 'true') {
        return;
      }

      sessionStorage.setItem(this.storageKey, 'true');
      void this.collectAndSendVisitInfo();
    } catch {
      // Fail silently so visitor UX is never impacted
    }
  }

  private async collectAndSendVisitInfo(): Promise<void> {
    const geo = await this.fetchGeoIpWithFallback();

    const now = new Date();
    const formattedDate = new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'full',
      timeStyle: 'medium',
      timeZone: 'Europe/Madrid',
    }).format(now);

    const locationParts = [geo.city, geo.region, geo.country].filter(Boolean);
    const locationSummary = locationParts.length > 0 ? locationParts.join(', ') : 'Desconocida';

    const payload = {
      _subject: `🚀 Nueva visita al Portfolio — IP: ${geo.ip} (${locationSummary})`,
      _template: 'table',
      _captcha: 'false',
      Fecha_y_Hora: formattedDate,
      Direccion_IP: geo.ip,
      Ubicacion: locationSummary,
      Proveedor_Red_ISP: geo.org || 'No disponible',
      Origen_Visita: document.referrer || 'Entrada directa (URL / Marcador)',
      Pagina_Entrada: window.location.href,
      Idioma_y_Pantalla: `${navigator.language} · ${window.screen.width}x${window.screen.height}`,
      Navegador_Dispositivo: navigator.userAgent,
    };

    try {
      await fetch(this.notifyEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
        keepalive: true,
      });
    } catch {
      // Fail silently
    }
  }

  private async fetchGeoIpWithFallback(): Promise<GeoIpData> {
    // 1. Primary lookup: ipwho.is (HTTPS, CORS-friendly, no key required)
    try {
      const res = await fetch('https://ipwho.is/');
      if (res.ok) {
        const data = await res.json();
        if (data && data.ip) {
          return {
            ip: data.ip,
            city: data.city,
            region: data.region,
            country: data.country,
            org: data.connection?.org || data.connection?.isp,
          };
        }
      }
    } catch {
      // Try next fallback
    }

    // 2. First fallback: ipapi.co
    try {
      const res = await fetch('https://ipapi.co/json/');
      if (res.ok) {
        const data = await res.json();
        if (data && data.ip) {
          return {
            ip: data.ip,
            city: data.city,
            region: data.region,
            country: data.country_name,
            org: data.org,
          };
        }
      }
    } catch {
      // Try next fallback
    }

    // 3. Second fallback: ipify (IP only)
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      if (res.ok) {
        const data = await res.json();
        if (data && data.ip) {
          return { ip: data.ip };
        }
      }
    } catch {
      // Ignore
    }

    return { ip: 'No detectada (bloqueador de red / AdBlock)' };
  }
}
