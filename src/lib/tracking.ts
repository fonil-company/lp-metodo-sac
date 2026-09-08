type TrackingWindow = Window & { dataLayer?: Record<string, unknown>[]; gtag?: (...args: unknown[]) => void };
export const consentKey = 'sac-analytics-consent';
export function readConsent() { try { return localStorage.getItem(consentKey); } catch { return null; } }
export function track(event: string, params: Record<string, unknown> = {}) {
  if (readConsent() !== 'accepted') return;
  const target = window as TrackingWindow;
  target.dataLayer = target.dataLayer || [];
  target.dataLayer.push({ event, ...params });
  window.dispatchEvent(new CustomEvent('sac:analytics', { detail: { event, ...params } }));
}
