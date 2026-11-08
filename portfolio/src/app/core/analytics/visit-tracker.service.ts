import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface GeoIpData {
  ip: string;
  city?: string;
  region?: string;
  postal?: string;
  country?: string;
  countryCode?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  isp?: string;
  org?: string;
  asn?: string;
  domain?: string;
  proxyOrVpn?: string;
}

@Injectable({
  providedIn: 'root',
})
export class VisitTrackerService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly sessionKey = 'portfolio_visit_notified_v1';
  private readonly localHistoryKey = 'portfolio_visitor_history_v1';
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

      // Only filter known search engine indexers (keep headless/automation tools so we can detect them)
      const userAgent = navigator.userAgent || '';
      if (/googlebot|bingbot|yandexbot|duckduckbot|baiduspider|slurp/i.test(userAgent)) {
        return;
      }

      // Avoid duplicate emails on simple refresh within the same tab session
      if (!isForceTest && sessionStorage.getItem(this.sessionKey) === 'true') {
        return;
      }

      sessionStorage.setItem(this.sessionKey, 'true');
      void this.collectAndSendFullReport();
    } catch {
      // Fail silently
    }
  }

  private async collectAndSendFullReport(): Promise<void> {
    const [geo, clientHints, batteryInfo, fingerprintId] = await Promise.all([
      this.fetchGeoIpWithFallback(),
      this.getHighEntropyClientHints(),
      this.getBatteryInfo(),
      this.computeHardwareFingerprint(),
    ]);

    const now = new Date();
    const formattedDate = new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'full',
      timeStyle: 'long',
      timeZone: 'Europe/Madrid',
    }).format(now);

    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Desconocida';
    const tzOffsetMinutes = -now.getTimezoneOffset();
    const tzOffsetStr = `UTC${tzOffsetMinutes >= 0 ? '+' : ''}${tzOffsetMinutes / 60}`;

    // Check for VPN / Proxy mismatch between IP timezone and Browser system clock timezone
    const vpnMismatch =
      geo.timezone && browserTimezone && geo.timezone !== browserTimezone
        ? `⚠️ POSIBLE VPN/PROXY (IP en ${geo.timezone} pero reloj del sistema en ${browserTimezone})`
        : 'Sin discrepancia de zona horaria';

    // Check for automation / headless browser flags
    const navAny = navigator as unknown as Record<string, unknown>;
    const isWebdriver = Boolean(navigator.webdriver);
    const hasLanguages = Array.isArray(navigator.languages) && navigator.languages.length > 0;
    const automationFlags: string[] = [];
    if (isWebdriver) automationFlags.push('navigator.webdriver=true (Selenium/Puppeteer/Playwright)');
    if (!hasLanguages) automationFlags.push('Sin idiomas de navegador');
    if (/headless|phantom|electron|cypress/i.test(navigator.userAgent)) {
      automationFlags.push('User-Agent de herramienta automatizada');
    }

    const gpuInfo = this.getWebGlGpuInfo();
    const visitHistory = this.updateAndGetLocalHistory(now.toISOString(), fingerprintId);
    const netInfo = this.getNetworkConnectionInfo(navAny);

    const locationParts = [geo.city, geo.region, geo.postal, geo.country].filter(Boolean);
    const locationSummary = locationParts.length > 0 ? locationParts.join(', ') : 'Desconocida';
    const mapsLink =
      geo.lat !== undefined && geo.lon !== undefined
        ? `https://www.google.com/maps?q=${geo.lat},${geo.lon}`
        : 'No disponible';

    const payload = {
      _subject: `🛡️ Informe de Visita Portfolio — IP: ${geo.ip} (${geo.city || 'Desc.'}, ${geo.country || 'Desc.'}) [ID: ${fingerprintId}]`,
      _template: 'table',
      _captcha: 'false',
      '01_Fecha_y_Hora_Madrid': formattedDate,
      '02_Huella_Hardware_ID': `${fingerprintId} (Permite identificar el mismo equipo aunque use VPN o modo incógnito)`,
      '03_Historial_Visitante': visitHistory,
      '04_Direccion_IP': geo.ip,
      '05_Ubicacion_IP': locationSummary,
      '06_Mapa_Coordenadas': mapsLink,
      '07_Proveedor_ISP_Organizacion': `${geo.isp || 'N/A'} | Org: ${geo.org || 'N/A'} | ASN: ${geo.asn || 'N/A'} | Dominio: ${geo.domain || 'N/A'}`,
      '08_Analisis_VPN_y_Zona_Horaria': `Reloj Navegador: ${browserTimezone} (${tzOffsetStr}) | Timezone IP: ${geo.timezone || 'N/A'} -> ${vpnMismatch}`,
      '09_Deteccion_Bot_o_Automatizacion':
        automationFlags.length > 0 ? `⚠️ ALERTA: ${automationFlags.join(' | ')}` : 'Navegador humano estándar',
      '10_Origen_Referrer': document.referrer || 'Entrada directa (URL / Marcador / PDF)',
      '11_URL_Completa_Entrada': window.location.href,
      '12_Sistema_Operativo_y_CPU': `${clientHints} | Plataforma: ${navigator.platform || 'N/A'} | CPU: ${navigator.hardwareConcurrency || '?'} núcleos | RAM: ${String(navAny['deviceMemory'] || '?')} GB`,
      '13_Tarjeta_Grafica_GPU': gpuInfo,
      '14_Pantalla_y_Ventana': `Monitor: ${window.screen.width}x${window.screen.height} ( Ventana: ${window.innerWidth}x${window.innerHeight} ) · PixelRatio: ${window.devicePixelRatio || 1}x · Color: ${window.screen.colorDepth}bit · TouchPoints: ${navigator.maxTouchPoints || 0}`,
      '15_Idiomas_Configurados': `${navigator.language} (Lista completa: ${(navigator.languages || []).join(', ')})`,
      '16_Red_y_Bateria': `Conexión: ${netInfo} | Batería: ${batteryInfo}`,
      '17_Preferencias_Navegador': `Tema SO: ${window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'Oscuro' : 'Claro'} | DoNotTrack: ${navigator.doNotTrack || 'No'} | Cookies: ${navigator.cookieEnabled ? 'Sí' : 'No'}`,
      '18_User_Agent_Completo': navigator.userAgent,
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

  private getWebGlGpuInfo(): string {
    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl') ||
        (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
      if (!gl) {
        return 'WebGL deshabilitado';
      }
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        return `${vendor} — ${renderer}`;
      }
      return String(gl.getParameter(gl.RENDERER) || 'WebGL estándar');
    } catch {
      return 'No accesible';
    }
  }

  private async getHighEntropyClientHints(): Promise<string> {
    try {
      const navAny = navigator as unknown as {
        userAgentData?: {
          platform?: string;
          mobile?: boolean;
          getHighEntropyValues?: (hints: string[]) => Promise<Record<string, unknown>>;
        };
      };
      if (navAny.userAgentData?.getHighEntropyValues) {
        const values = await navAny.userAgentData.getHighEntropyValues([
          'platform',
          'platformVersion',
          'architecture',
          'bitness',
          'model',
        ]);
        const parts = [
          values['platform'] || navAny.userAgentData.platform,
          values['platformVersion'] ? `v${values['platformVersion']}` : '',
          values['architecture'] ? `${values['architecture']}` : '',
          values['bitness'] ? `${values['bitness']}-bit` : '',
          values['model'] ? `Modelo: ${values['model']}` : '',
          navAny.userAgentData.mobile ? 'Móvil' : 'Escritorio',
        ].filter(Boolean);
        return parts.join(' ');
      }
    } catch {
      // Fallback
    }
    return 'Client Hints no soportados';
  }

  private async getBatteryInfo(): Promise<string> {
    try {
      const navAny = navigator as unknown as {
        getBattery?: () => Promise<{ level: number; charging: boolean }>;
      };
      if (typeof navAny.getBattery === 'function') {
        const battery = await navAny.getBattery();
        const pct = Math.round(battery.level * 100);
        return `${pct}% (${battery.charging ? 'Cargando 🔌' : 'En batería 🔋'})`;
      }
    } catch {
      // Ignore
    }
    return 'No expuesto por el navegador';
  }

  private getNetworkConnectionInfo(navAny: Record<string, unknown>): string {
    try {
      const conn = (navAny['connection'] ||
        navAny['mozConnection'] ||
        navAny['webkitConnection']) as Record<string, unknown> | undefined;
      if (conn) {
        return `Tipo: ${conn['effectiveType'] || 'N/A'} · Bajada: ~${conn['downlink'] || '?'} Mbps · RTT: ${conn['rtt'] || '?'} ms`;
      }
    } catch {
      // Ignore
    }
    return 'No expuesto';
  }

  private async computeHardwareFingerprint(): Promise<string> {
    try {
      const navAny = navigator as unknown as Record<string, unknown>;
      const gpu = this.getWebGlGpuInfo();
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      const rawComponents = [
        gpu,
        navigator.platform || '',
        String(navigator.hardwareConcurrency || ''),
        String(navAny['deviceMemory'] || ''),
        `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`,
        String(window.devicePixelRatio || 1),
        tz,
        (navigator.languages || []).join(','),
        String(navigator.maxTouchPoints || 0),
      ].join('||');

      if (window.crypto?.subtle) {
        const encoded = new TextEncoder().encode(rawComponents);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', encoded);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
        return hex.substring(0, 12).toUpperCase();
      }
    } catch {
      // Fallback
    }
    return 'FP-UNKNOWN';
  }

  private updateAndGetLocalHistory(nowIso: string, fingerprintId: string): string {
    try {
      const raw = localStorage.getItem(this.localHistoryKey);
      if (!raw) {
        const initial = { count: 1, firstVisit: nowIso, lastVisit: nowIso, fp: fingerprintId };
        localStorage.setItem(this.localHistoryKey, JSON.stringify(initial));
        return 'Primera visita registrada en este navegador (Visita #1)';
      }
      const parsed = JSON.parse(raw) as { count?: number; firstVisit?: string; lastVisit?: string };
      const count = (parsed.count || 1) + 1;
      const firstVisit = parsed.firstVisit || nowIso;
      const prevVisit = parsed.lastVisit || nowIso;
      localStorage.setItem(
        this.localHistoryKey,
        JSON.stringify({ count, firstVisit, lastVisit: nowIso, fp: fingerprintId }),
      );
      return `Visitante RECURRENTE (Visita #${count}) · 1ª vez: ${firstVisit} · Anterior: ${prevVisit}`;
    } catch {
      return 'Almacenamiento local bloqueado (Posible modo incógnito estricto)';
    }
  }

  private async fetchGeoIpWithFallback(): Promise<GeoIpData> {
    // 1. Primary lookup: ipwho.is
    try {
      const res = await fetch('https://ipwho.is/');
      if (res.ok) {
        const data = await res.json();
        if (data && data.ip) {
          return {
            ip: data.ip,
            city: data.city,
            region: data.region,
            postal: data.postal,
            country: data.country,
            countryCode: data.country_code,
            lat: data.latitude,
            lon: data.longitude,
            timezone: data.timezone?.id,
            isp: data.connection?.isp,
            org: data.connection?.org,
            asn: data.connection?.asn ? `AS${data.connection.asn}` : undefined,
            domain: data.connection?.domain,
          };
        }
      }
    } catch {
      // Next fallback
    }

    // 2. Second lookup: ipapi.co
    try {
      const res = await fetch('https://ipapi.co/json/');
      if (res.ok) {
        const data = await res.json();
        if (data && data.ip) {
          return {
            ip: data.ip,
            city: data.city,
            region: data.region,
            postal: data.postal,
            country: data.country_name,
            countryCode: data.country_code,
            lat: data.latitude,
            lon: data.longitude,
            timezone: data.timezone,
            isp: data.org,
            org: data.org,
            asn: data.asn,
          };
        }
      }
    } catch {
      // Next fallback
    }

    // 3. Third lookup: Cloudflare CDN trace (very rarely blocked by ad-blockers)
    try {
      const res = await fetch('https://www.cloudflare.com/cdn-cgi/trace');
      if (res.ok) {
        const text = await res.text();
        const map: Record<string, string> = {};
        for (const line of text.split('\n')) {
          const [k, v] = line.split('=');
          if (k && v) map[k.trim()] = v.trim();
        }
        if (map['ip']) {
          return {
            ip: map['ip'],
            country: map['loc'],
            countryCode: map['loc'],
          };
        }
      }
    } catch {
      // Next fallback
    }

    // 4. Fourth lookup: ipify
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

    return { ip: 'No detectada (bloqueador de red estricto)' };
  }
}
