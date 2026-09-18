import test from 'node:test';
import assert from 'node:assert/strict';

async function setup(saved = null, blocked = false) {
  const module = await import(`../src/lib/attribution.mjs?test=${crypto.randomUUID()}`);
  const browser = {
    location: new URL('https://example.test/'), document: { referrer: 'https://example.test/ad' },
    sessionStorage: {
      getItem() { if (blocked) throw new Error('blocked'); return saved; },
      setItem(key, value) { if (blocked) throw new Error('blocked'); saved = value; },
    },
  };
  return { module, browser, saved: () => saved };
}

test('keeps the campaign after URL cleanup and reload; replaces the entire set on a new campaign', async () => {
  const { module, browser, saved } = await setup();
  browser.location = new URL('https://example.test/?utm_source=meta&utm_campaign=cole%C3%A7%C3%A3o+nova&utm_content=A%2BB&utm_id=123');
  const first = module.captureAttribution(browser);
  assert.equal(first.utm_campaign, 'coleção nova');
  assert.equal(first.utm_content, 'A+B');
  browser.location = new URL('https://example.test/?utm_source=');
  assert.deepEqual(module.captureAttribution(browser), first);
  const reload = await setup(saved());
  assert.deepEqual(reload.module.captureAttribution(reload.browser), first);
  browser.location = new URL('https://example.test/?utm_source=google');
  const second = module.captureAttribution(browser);
  assert.equal(second.utm_source, 'google');
  assert.equal(second.utm_content, undefined);
  assert.equal(second.utm_id, undefined);
});

test('direct entry, corrupt or blocked storage and malformed cookies do not break attribution', async () => {
  for (const [saved, blocked] of [[null, false], ['invalid', false], [null, true]]) {
    const { module, browser } = await setup(saved, blocked);
    assert.equal(module.captureAttribution(browser).utm_source, undefined);
    browser.location = new URL('https://example.test/?utm_source=meta');
    module.captureAttribution(browser);
    browser.location = new URL('https://example.test/');
    assert.equal(module.captureAttribution(browser).utm_source, 'meta');
    assert.deepEqual(module.readMetaCookies('_fbc=%broken; _fbp=fb.1.123.456; other=ignored'), { _fbp: 'fb.1.123.456' });
  }
});
