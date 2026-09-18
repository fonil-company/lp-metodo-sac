export const ATTRIBUTION_KEY = 'sac-attribution-v1';
export const campaignFields = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id', 'fbclid', 'gclid', 'ad_id', 'creative_id'];
export const attributionFields = [...campaignFields, 'landing_url', 'referrer'];
let snapshot;

export function attributionFrom(search) {
  const params = new URLSearchParams(search);
  return Object.fromEntries(campaignFields.filter(key => params.get(key)?.trim()).map(key => [key, params.get(key)]));
}

// Last campaign entry in this tab. Direct navigation keeps the existing entry.
export function captureAttribution(browser = window) {
  const campaign = attributionFrom(browser.location.search);
  if (!snapshot) {
    try {
      const saved = JSON.parse(browser.sessionStorage.getItem(ATTRIBUTION_KEY) || 'null');
      if (saved && typeof saved === 'object') {
        snapshot = Object.fromEntries(attributionFields.filter(key => typeof saved[key] === 'string').map(key => [key, saved[key]]));
      }
    } catch { /* Keep an in-memory snapshot when storage is unavailable. */ }
  }
  if (Object.keys(campaign).length || !snapshot) {
    snapshot = { ...campaign, landing_url: browser.location.href, referrer: browser.document.referrer || '' };
  }
  try { browser.sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(snapshot)); } catch { /* Memory still preserves attribution. */ }
  return { ...snapshot };
}

export function readMetaCookies(cookie = document.cookie) {
  const values = {};
  for (const part of cookie.split(';')) {
    const [name, ...value] = part.trim().split('=');
    if (!['_fbc', '_fbp'].includes(name)) continue;
    try { values[name] = decodeURIComponent(value.join('=')); } catch { /* Malformed cookies must not block the form. */ }
  }
  return values;
}

export function getAttribution() {
  return snapshot ? { ...snapshot } : captureAttribution();
}
