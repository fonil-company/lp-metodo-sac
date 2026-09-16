import test from 'node:test';
import assert from 'node:assert/strict';
import { validateContact, formatPhone, normalizePhone, sanitizeAnswers, attributionFrom, leadWebhookPayload, submitLead } from '../src/lib/diagnostic.mjs';

const contact = { name: 'Ana Silva', company: 'Empresa Teste', phone: '+55 (11) 99999-9999', email: 'ana@example.com', city: 'São Paulo', state: 'SP' };
test('validates Brazilian and international contacts', () => {
  assert.deepEqual(validateContact(contact), {});
  assert.deepEqual(validateContact({ ...contact, phone: '+1 212 555 1234' }), {});
  assert.equal(Object.keys(validateContact({})).length, 6);
  assert.ok(validateContact({ ...contact, phone: '+55 (11) 9999' }).phone);
  assert.ok(validateContact({ ...contact, email: 'invalid' }).email);
});
test('formats and normalizes WhatsApp without dropping DDI', () => {
  assert.equal(formatPhone('11999999999'), '+55 (11) 99999-9999');
  assert.equal(normalizePhone('+55 (11) 99999-9999'), '+5511999999999');
  assert.equal(formatPhone('+351912345678'), '+351912345678');
  assert.equal(normalizePhone('11999999999'), '+5511999999999');
});
test('removes answers from deleted diagnostic steps', () => {
  assert.deepEqual(sanitizeAnswers({ bottleneck: 'Gargalo', infrastructure: 'Planilhas', crm: 'Old CRM', capacity: 'Sim', objective: 'Crescer', timing: 'Imediatamente', budget: 'R$ 15.000', profile: 'Indústria' }), { profile: 'Indústria' });
});
test('preserves attribution fields without unrelated URL values', () => {
  assert.deepEqual(attributionFrom('?utm_source=google&gclid=abc&email=secret'), { utm_source: 'google', gclid: 'abc' });
});
test('maps contact data to the CRM webhook contract', () => {
  assert.deepEqual(leadWebhookPayload(contact), {
    phone: '+5511999999999',
    name: 'Ana Silva',
    email: 'ana@example.com',
    city: 'São Paulo',
    state: 'SP',
  });
});
test('accepts a successful webhook response and rejects HTTP or explicit API errors', async () => {
  const calls = [];
  const result = await submitLead('https://example.test/leads', { phone: '+5511999999999' }, async (...args) => { calls.push(args); return { ok: true, text: async () => JSON.stringify({ success: true }) }; });
  assert.equal(result.success, true);
  assert.equal(JSON.parse(calls[0][1].body).phone, '+5511999999999');
  assert.deepEqual(await submitLead('/leads', {}, async () => ({ ok: true, text: async () => '' })), { success: true });
  await assert.rejects(submitLead('/leads', {}, async () => ({ ok: false })), /Não foi possível/);
  await assert.rejects(submitLead('/leads', {}, async () => ({ ok: true, text: async () => JSON.stringify({ success: false }) })), /não foi confirmado/);
});
