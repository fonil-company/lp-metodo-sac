import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createLeadHandler } from '../scripts/leads.mjs';

const lead = { event_id: 'test-event-1', name: 'Teste Integração', phone: '+5511999999999', company: 'Empresa Teste', email: 'teste@example.com', city: 'São Paulo', state: 'SP' };

async function listen(t, handler) {
  const server = createServer(handler);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  return `http://127.0.0.1:${server.address().port}`;
}

async function setup(t, options = {}) {
  const received = { primary: [], fonil: [] };
  const replies = { primary: { status: 200, body: '{"success":true}' }, fonil: { status: 200, body: '{"success":true}' } };
  const upstream = await listen(t, async (req, res) => {
    const destination = req.url.slice(1);
    let body = '';
    for await (const chunk of req) body += chunk;
    received[destination].push({ payload: JSON.parse(body), contentType: req.headers['content-type'], method: req.method });
    const reply = replies[destination];
    if (reply.delay) await new Promise(resolve => setTimeout(resolve, reply.delay));
    res.writeHead(reply.status, { 'Content-Type': 'application/json' });
    res.end(reply.body);
  });
  const api = await listen(t, createLeadHandler({ primaryUrl: `${upstream}/primary`, fonilUrl: `${upstream}/fonil`, ...options }));
  const post = async (payload = lead) => {
    const response = await fetch(api, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    return { status: response.status, body: await response.json() };
  };
  return { api, received, replies, post };
}

test('delivers each contract to two HTTP receivers and confirms both', async t => {
  const { received, post } = await setup(t);
  const tracking = { utm_source: 'meta', utm_medium: 'paid', utm_campaign: 'coleção nova', utm_content: 'A+B', utm_term: ' setor ', utm_id: 'campaign-1', fbclid: 'click-1', gclid: 'click-2', ad_id: 'ad-1', creative_id: 'creative-1', _fbc: 'fb.1.123.click', _fbp: 'fb.1.123.browser', landing_url: 'https://example.test/?utm_source=meta', referrer: 'https://example.test/ad', form_url: 'https://example.test/#form', created_at: '2026-09-18T12:00:00.000Z' };
  assert.deepEqual(await post({ ...lead, document: '12345678000190', pipeline_stage: 'Qualificado', consultant: 'Teste', ...tracking, unrelated: 'drop-me' }), { status: 200, body: { success: true } });
  const contact = lead;
  const extra = { document: '12345678000190', pipeline_stage: 'Qualificado', consultant: 'Teste', ...tracking, event_name: 'Lead' };
  assert.deepEqual(received.primary[0], { method: 'POST', contentType: 'application/json', payload: { ...contact, ...extra } });
  const { company, ...fonil } = contact;
  assert.deepEqual(received.fonil[0].payload, { ...fonil, phone: '11999999999', ...extra });
});

test('retries only the failed receiver in either direction', async t => {
  for (const failed of ['primary', 'fonil']) {
    await t.test(failed, async t => {
      const { received, replies, post } = await setup(t);
      replies[failed] = { status: 500, body: '{}' };
      assert.equal((await post()).status, 502);
      replies[failed] = { status: 200, body: '{"success":true}' };
      assert.equal((await post()).status, 200);
      assert.equal((await post()).status, 200);
      assert.equal(received[failed].length, 2);
      assert.equal(received[failed === 'primary' ? 'fonil' : 'primary'].length, 1);
    });
  }
});

test('shares concurrent attempts and rejects changed data with the same ID', async t => {
  const { received, replies, post } = await setup(t);
  replies.primary.delay = 50;
  const responses = await Promise.all([post(), post(), post()]);
  assert.ok(responses.every(response => response.status === 200));
  assert.equal(received.primary.length, 1);
  assert.equal(received.fonil.length, 1);
  assert.equal((await post({ ...lead, name: 'Outro Teste' })).status, 409);
  assert.equal(received.primary.length, 1);
});

test('HTTP 200 with a negative or invalid body does not confirm delivery', async t => {
  const { received, replies, post } = await setup(t);
  for (const body of ['{"success":false}', '{"ok":false}', '{"error":"rejected"}', '<html>Bad gateway</html>']) {
    replies.fonil = { status: 200, body };
    assert.equal((await post()).body.success, false);
  }
  replies.fonil = { status: 204, body: '' };
  assert.equal((await post()).body.success, true);
  assert.equal(received.primary.length, 1);
});

test('timeouts leave the destination pending for retry', async t => {
  const { received, replies, post } = await setup(t, { timeout: 100 });
  replies.fonil.delay = 200;
  assert.equal((await post()).status, 502);
  replies.fonil.delay = 0;
  assert.equal((await post()).status, 200);
  assert.equal(received.primary.length, 1);
  assert.equal(received.fonil.length, 2);
});

test('validates input before contacting either CRM', async t => {
  const { api, received, post } = await setup(t);
  for (const payload of [{}, null, { phone: '11999999999' }, { ...lead, event_id: 'invalid id' }]) {
    assert.equal((await post(payload)).status, 400);
  }
  assert.equal((await fetch(api, { method: 'POST', body: '{broken' })).status, 400);
  assert.equal((await fetch(api, { method: 'POST', body: 'a'.repeat(33000) })).status, 413);
  assert.equal((await fetch(api)).status, 405);
  assert.equal(received.primary.length + received.fonil.length, 0);
});

test('single-destination setup remains supported and missing primary fails safely', async t => {
  const single = await setup(t, { fonilUrl: '' });
  assert.equal((await single.post()).status, 200);
  assert.equal(single.received.primary.length, 1);
  assert.equal(single.received.fonil.length, 0);
  const missing = await setup(t, { primaryUrl: '' });
  assert.equal((await missing.post()).status, 503);
  assert.equal(missing.received.fonil.length, 0);
});

test('expires delivery records and respects capacity without discarding active records', async t => {
  let time = 0;
  const { received, post } = await setup(t, { now: () => time, ttl: 100, maxEntries: 1 });
  assert.equal((await post()).status, 200);
  assert.equal((await post({ ...lead, event_id: 'second' })).status, 503);
  time = 101;
  assert.equal((await post()).status, 200);
  assert.equal(received.primary.length, 2);
});

test('older clients without event_id also reuse confirmed deliveries', async t => {
  const { post, received } = await setup(t);
  const { event_id, ...oldPayload } = lead;
  assert.equal((await post(oldPayload)).status, 200);
  assert.equal((await post(oldPayload)).status, 200);
  assert.equal(received.primary.length, 1);
  assert.equal(received.fonil.length, 1);
});
