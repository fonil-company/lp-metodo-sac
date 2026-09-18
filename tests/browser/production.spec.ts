import { test, expect } from '@playwright/test';
import { createServer, type Server } from 'node:http';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { steps } from '../../src/diagnostic-data';

async function listen(server: Server) {
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  return (server.address() as { port: number }).port;
}

test('compiled page delivers contact and attribution through the real API before Lead', async ({ page }) => {
  const received: Record<string, any>[] = [];
  let accept = false;
  const receiver = createServer(async (req, res) => {
    let body = '';
    for await (const chunk of req) body += chunk;
    received.push({ destination: req.url, body: JSON.parse(body) });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: req.url === '/primary' || accept }));
  });
  const receiverPort = await listen(receiver);
  const reservation = createServer();
  const port = await listen(reservation);
  await new Promise<void>(resolve => reservation.close(() => resolve()));
  const server = spawn(process.execPath, ['scripts/serve.mjs'], {
    env: { ...process.env, PORT: String(port), HOST: '127.0.0.1', LEAD_WEBHOOK_URL: `http://127.0.0.1:${receiverPort}/primary`, FONIL_CRM_WEBHOOK_URL: `http://127.0.0.1:${receiverPort}/fonil` },
    stdio: 'ignore', windowsHide: true,
  });
  try {
    await expect.poll(async () => {
      try { return (await fetch(`http://127.0.0.1:${port}/_health`)).status; } catch { return 0; }
    }).toBe(200);
    const invalid = await fetch(`http://127.0.0.1:${port}/api/leads`, { method: 'POST', body: '{}' });
    expect(invalid.status).toBe(400);
    expect(received).toHaveLength(0);
    await page.route('https://connect.facebook.net/**', route => route.fulfill({ contentType: 'application/javascript', body: '' }));
    await page.route('https://www.clarity.ms/**', route => route.fulfill({ contentType: 'application/javascript', body: '' }));
    await page.addInitScript(({ step }) => {
      localStorage.setItem('sac-analytics-consent', 'accepted');
      sessionStorage.setItem('sac-diagnostic-v1', JSON.stringify({ step, contact: { name: 'Teste Local', company: 'Teste', phone: '+5511999999999', email: 'teste@example.com', city: 'São Paulo', state: 'SP' } }));
    }, { step: steps.length });
    await page.goto(`http://127.0.0.1:${port}/?utm_source=meta&utm_medium=paid&utm_campaign=cole%C3%A7%C3%A3o+nova&utm_content=A%2BB&utm_term=teste`);
    const leads = () => page.evaluate(() => (window as any).fbq.queue.filter((call: any[]) => call[1] === 'Lead'));
    expect(await leads()).toHaveLength(0);
    const panel = page.locator('#diagnostic-panel');
    await panel.getByRole('checkbox').check();
    const submit = panel.getByRole('button', { name: 'Finalizar meu diagnóstico SAC', exact: true });
    await submit.click();
    await expect(panel.getByRole('alert')).toContainText('Não foi possível enviar');
    expect(await leads()).toHaveLength(0);
    accept = true;
    await submit.dblclick();
    await expect(panel.getByRole('heading', { name: 'Diagnóstico recebido.' })).toBeVisible();
    expect(received.filter(item => item.destination === '/primary')).toHaveLength(1);
    const fonil = received.filter(item => item.destination === '/fonil');
    expect(fonil).toHaveLength(2);
    expect(fonil[1].body).toEqual(fonil[0].body);
    expect(fonil[1].body).toMatchObject({ name: 'Teste Local', phone: '11999999999', email: 'teste@example.com', city: 'São Paulo', state: 'SP', utm_source: 'meta', utm_medium: 'paid', utm_campaign: 'coleção nova', utm_content: 'A+B', utm_term: 'teste', event_name: 'Lead' });
    const events = await leads();
    expect(events).toHaveLength(1);
    expect(events[0][3]).toEqual({ eventID: fonil[1].body.event_id });
  } finally {
    const exited = once(server, 'exit');
    server.kill();
    await exited;
    await new Promise<void>(resolve => { receiver.close(() => resolve()); receiver.closeAllConnections(); });
  }
});
