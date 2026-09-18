export const STORAGE_KEY = 'sac-diagnostic-v1';
export { attributionFrom } from './attribution.mjs';
export function normalizePhone(value) {
  const digits = value.replace(/\D/g, '');
  return value.trim().startsWith('+') ? '+' + digits : '+55' + digits;
}
export function formatPhone(value) {
  const digits = value.replace(/\D/g, '');
  if (value.startsWith('+') && !value.startsWith('+55')) return '+' + digits.slice(0, 15);
  const local = (value.startsWith('+55') ? digits.slice(2) : digits).slice(0, 11);
  if (!local) return value.startsWith('+') ? '+55 ' : '';
  const prefix = '+55 (' + local.slice(0, 2);
  if (local.length < 3) return prefix;
  const rest = local.slice(2);
  const split = rest.length > 8 ? 5 : 4;
  return prefix + ') ' + rest.slice(0, split) + (rest.length > split ? '-' + rest.slice(split) : '');
}
/** @returns {Record<string, string>} */
export function validateContact(contact) {
  const errors = {};
  if (!contact.name?.trim() || contact.name.trim().split(/\s+/).length < 2) errors.name = 'Informe seu nome completo.';
  if (!contact.company?.trim()) errors.company = 'Informe o nome da empresa.';
  const phone = normalizePhone(contact.phone || '');
  if (!/^\+[1-9]\d{7,14}$/.test(phone) || (phone.startsWith('+55') && !/^\+55[1-9]\d{9,10}$/.test(phone))) errors.phone = 'Informe um WhatsApp válido com DDI e DDD.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact.email || '')) errors.email = 'Informe um e-mail válido.';
  if (!contact.city?.trim()) errors.city = 'Informe a cidade da sede.';
  if (!contact.state) errors.state = 'Selecione o estado.';
  return errors;
}
export function sanitizeAnswers(answers) {
  const result = { ...answers };
  for (const removedKey of ['bottleneck', 'infrastructure', 'crm', 'capacity', 'objective', 'timing', 'budget']) delete result[removedKey];
  return result;
}
export function leadWebhookPayload(contact) {
  return {
    phone: normalizePhone(contact.phone || ''),
    name: contact.name?.trim() || '',
    company: contact.company?.trim() || '',
    email: contact.email?.trim() || '',
    city: contact.city?.trim() || '',
    state: contact.state?.trim() || '',
  };
}
export async function submitLead(endpoint, payload, fetcher = fetch) {
  const response = await fetcher(endpoint, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload), signal: AbortSignal.timeout(25000)
  });
  if (!response.ok) throw new Error('Não foi possível enviar. Suas respostas foram mantidas. Tente novamente.');
  let receipt;
  try {
    const body = await response.text();
    if (body) receipt = JSON.parse(body);
  } catch { /* Respostas inválidas não confirmam a entrega. */ }
  if (receipt?.success !== true) throw new Error('O recebimento não foi confirmado. Suas respostas foram mantidas. Tente novamente.');
  return receipt;
}
