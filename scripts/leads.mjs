import { createHash } from 'node:crypto';
import { attributionFields } from '../src/lib/attribution.mjs';

const fields = ['phone', 'name', 'company', 'email', 'document', 'city', 'state', 'pipeline_stage', 'consultant'];
const trackingFields = [...attributionFields, 'event_id', 'form_url', 'created_at', '_fbc', '_fbp'];
const result = (status, error) => ({ status, body: error ? { success: false, error } : { success: true } });

// Each server process remembers confirmed deliveries for 24 hours.
export function createLeadHandler({ primaryUrl, fonilUrl, fetcher = fetch, now = Date.now, ttl = 86400000, maxEntries = 10000, timeout = 15000 }) {
  const deliveries = new Map();
  const destinations = [
    { name: 'primary', url: primaryUrl?.trim(), adapt: lead => lead },
    { name: 'fonil', url: fonilUrl?.trim(), adapt: lead => {
      const { company, ...contact } = lead;
      const digits = contact.phone.replace(/\D/g, '');
      // Brazilian numbers use DDD + number, as in the Fonil contract.
      contact.phone = /^55\d{10,11}$/.test(digits) ? digits.slice(2) : digits;
      return contact;
    } },
  ].filter(destination => destination.url);

  async function deliver(submitted) {
    if (!primaryUrl?.trim()) return result(503, 'O recebimento de leads não está configurado.');
    const lead = Object.fromEntries(fields
      .filter(key => typeof submitted?.[key] === 'string' && submitted[key].trim())
      .map(key => [key, submitted[key].trim()]));
    if (!lead.phone || !lead.name) return result(400, 'Nome e telefone são obrigatórios.');
    if (submitted.event_id !== undefined && (typeof submitted.event_id !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(submitted.event_id))) {
      return result(400, 'Identificador de envio inválido.');
    }
    for (const key of trackingFields) {
      if (typeof submitted[key] === 'string' && submitted[key].trim()) lead[key] = submitted[key];
    }
    lead.event_name = 'Lead';
    const fingerprint = createHash('sha256').update(JSON.stringify(lead)).digest('hex');
    // Payload hash also protects retries from pages opened before this deployment.
    const key = submitted.event_id ? `event:${submitted.event_id}` : `payload:${fingerprint}`;
    for (const [id, entry] of deliveries) {
      if (!entry.pending && now() >= entry.expires) deliveries.delete(id);
    }
    let entry = deliveries.get(key);
    if (entry && entry.fingerprint !== fingerprint) return result(409, 'Os dados deste envio foram alterados.');
    if (!entry) {
      if (deliveries.size >= maxEntries) return result(503, 'Tente novamente em alguns instantes.');
      entry = { fingerprint, confirmed: new Set(), expires: now() + ttl, pending: null };
      deliveries.set(key, entry);
    }
    if (entry.pending) return entry.pending;
    entry.pending = (async () => {
      await Promise.all(destinations.map(async destination => {
        if (entry.confirmed.has(destination.name)) return;
        try {
          const upstream = await fetcher(destination.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(destination.adapt(lead)),
            signal: AbortSignal.timeout(timeout),
          });
          const body = await upstream.text();
          const receipt = body.trim() ? JSON.parse(body) : {};
          if (!upstream.ok || receipt?.success === false || receipt?.ok === false || receipt?.error) {
            console.error(`Lead destination ${destination.name} did not confirm receipt (HTTP ${upstream.status})`);
            return;
          }
          entry.confirmed.add(destination.name);
        } catch {
          // Never log tokens, upstream bodies or contact details.
          console.error(`Lead destination ${destination.name} request failed`);
        }
      }));
      return entry.confirmed.size === destinations.length
        ? result(200)
        : result(502, 'Não foi possível confirmar o envio completo. Tente novamente.');
    })();
    try { return await entry.pending; }
    finally { entry.pending = null; }
  }

  return async function handleLead(request, response) {
    const send = ({ status, body }) => {
      response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
      response.end(JSON.stringify(body));
    };
    if (request.method !== 'POST') {
      response.setHeader('Allow', 'POST');
      send(result(405, 'Método não permitido.'));
      return;
    }
    try {
      let size = 0;
      const chunks = [];
      for await (const chunk of request) {
        size += chunk.length;
        if (size > 32 * 1024) { send(result(413, 'Payload muito grande.')); return; }
        chunks.push(chunk);
      }
      let submitted;
      try { submitted = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
      catch { send(result(400, 'JSON inválido.')); return; }
      send(await deliver(submitted));
    } catch {
      send(result(502, 'Não foi possível conectar ao CRM.'));
    }
  };
}
