type MetaPixelFn = { (...args: unknown[]): void; callMethod?: (...args: unknown[]) => void; queue: unknown[]; loaded: boolean; version: string; push: MetaPixelFn };
type ClarityFn = { (...args: unknown[]): void; q?: unknown[][] };
type TrackingWindow = Window & { dataLayer?: Record<string, unknown>[]; gtag?: (...args: unknown[]) => void; fbq?: MetaPixelFn; _fbq?: MetaPixelFn; clarity?: ClarityFn };
export const consentKey = 'sac-analytics-consent';
export function readConsent() { try { return localStorage.getItem(consentKey); } catch { return null; } }

const metaPixelId = '1014610764961858';
let metaPixelReady = false;
function ensureMetaPixel() {
  const target = window as TrackingWindow;
  if (metaPixelReady || target.fbq) { metaPixelReady = true; return; }
  const fbq = function (...args: unknown[]) { if (fbq.callMethod) fbq.callMethod(...args); else fbq.queue.push(args); } as MetaPixelFn;
  fbq.queue = []; fbq.loaded = true; fbq.version = '2.0'; fbq.push = fbq;
  target._fbq = fbq; target.fbq = fbq;
  const script = document.createElement('script');
  script.async = true; script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  const first = document.getElementsByTagName('script')[0];
  first?.parentNode?.insertBefore(script, first);
  fbq('init', metaPixelId);
  metaPixelReady = true;
}
// lp_view e diagnostic_submit mapeiam para eventos padrão do Meta (PageView/Lead) para otimização de anúncios; os demais viram eventos customizados com o mesmo nome, mantendo paridade total com o dataLayer.
const metaStandardEvents: Record<string, string> = { lp_view: 'PageView', diagnostic_submit: 'Lead' };
function trackMetaPixel(event: string, params: Record<string, unknown>) {
  ensureMetaPixel();
  const target = window as TrackingWindow;
  if (!target.fbq) return;
  const { event_id, ...rest } = params;
  const options = event_id ? { eventID: String(event_id) } : undefined;
  const standardName = metaStandardEvents[event];
  if (standardName) target.fbq('track', standardName, rest, options);
  else target.fbq('trackCustom', event, rest, options);
}

const clarityProjectId = 'yjx5j5uhnu';
let clarityReady = false;
function ensureClarity() {
  const target = window as TrackingWindow;
  if (clarityReady || target.clarity) { clarityReady = true; return; }
  const clarity = function (...args: unknown[]) { (clarity.q = clarity.q || []).push(args); } as ClarityFn;
  target.clarity = clarity;
  const script = document.createElement('script');
  script.async = true; script.src = 'https://www.clarity.ms/tag/' + clarityProjectId;
  const first = document.getElementsByTagName('script')[0];
  first?.parentNode?.insertBefore(script, first);
  clarityReady = true;
}
function trackClarity(event: string) {
  ensureClarity();
  (window as TrackingWindow).clarity?.('event', event);
}

export function track(event: string, params: Record<string, unknown> = {}) {
  if (readConsent() !== 'accepted') return;
  const target = window as TrackingWindow;
  target.dataLayer = target.dataLayer || [];
  target.dataLayer.push({ event, ...params });
  window.dispatchEvent(new CustomEvent('sac:analytics', { detail: { event, ...params } }));
  trackMetaPixel(event, params);
  trackClarity(event);
}
