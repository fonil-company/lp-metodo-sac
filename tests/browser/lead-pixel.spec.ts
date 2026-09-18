import { test, expect } from '@playwright/test';
import { steps } from '../../src/diagnostic-data';

test('Lead requires valid contact and a positive API receipt, never just a click', async ({ page }) => {
  await page.route('https://connect.facebook.net/**', route => route.fulfill({ contentType: 'application/javascript', body: '' }));
  await page.route('https://www.clarity.ms/**', route => route.fulfill({ contentType: 'application/javascript', body: '' }));
  await page.addInitScript(({ step }) => {
    localStorage.setItem('sac-analytics-consent', 'accepted');
    sessionStorage.setItem('sac-diagnostic-v1', JSON.stringify({ step }));
  }, { step: steps.length });
  let attempts = 0;
  let releaseSuccess: (() => void) | undefined;
  const successReady = new Promise<void>(resolve => { releaseSuccess = resolve; });
  const replies = [
    { status: 503, body: '{"success":false}' },
    { status: 200, body: '{"success":false}' },
    { status: 200, body: '<html>Invalid receipt</html>' },
  ];
  await page.route('**/api/leads', async route => {
    const reply = replies[attempts++];
    if (reply) await route.fulfill({ ...reply, contentType: 'application/json' });
    else {
      await successReady;
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' });
    }
  });
  await page.goto('/');
  const queue = () => page.evaluate(() => (window as any).fbq.queue as unknown[][]);
  const leads = async () => (await queue()).filter(call => call[0] === 'track' && call[1] === 'Lead');
  const initialization = await queue();
  expect(initialization.slice(0, 3)).toEqual([
    ['set', 'autoConfig', false, '1014610764961858'],
    ['set', 'smartSetup', false, '1014610764961858'],
    ['init', '1014610764961858'],
  ]);
  expect(initialization.filter(call => call[1] === 'PageView')).toHaveLength(1);
  const panel = page.locator('#diagnostic-panel');
  const submit = panel.getByRole('button', { name: 'Finalizar meu diagnóstico SAC', exact: true });
  await submit.click();
  await expect(panel.getByRole('alert')).toHaveCount(7);
  expect(attempts).toBe(0);
  expect(await leads()).toHaveLength(0);
  await panel.getByRole('textbox', { name: 'Nome completo' }).fill('Teste Pixel');
  await panel.getByRole('textbox', { name: 'Empresa', exact: true }).fill('Teste');
  await panel.getByRole('textbox', { name: 'WhatsApp' }).fill('+5511999999999');
  await panel.getByRole('textbox', { name: 'E-mail corporativo' }).fill('invalid');
  await panel.getByRole('textbox', { name: 'Cidade da sede' }).fill('São Paulo');
  await panel.getByRole('combobox', { name: 'Estado' }).selectOption('SP');
  await panel.getByRole('checkbox').check();
  await submit.click();
  await expect(panel.getByRole('alert')).toHaveCount(1);
  expect(attempts).toBe(0);
  expect(await leads()).toHaveLength(0);
  await panel.getByRole('textbox', { name: 'E-mail corporativo' }).fill('teste@example.com');
  for (let attempt = 1; attempt <= replies.length; attempt++) {
    await submit.click();
    await expect.poll(() => attempts).toBe(attempt);
    await expect(submit).toBeEnabled();
    await expect(panel.getByRole('alert')).toHaveCount(1);
    expect(await leads()).toHaveLength(0);
  }
  await submit.click();
  await expect.poll(() => attempts).toBe(4);
  await expect(panel.getByRole('button', { name: 'Enviando...' })).toBeDisabled();
  expect(await leads()).toHaveLength(0);
  releaseSuccess!();
  await expect(panel.getByRole('heading', { name: 'Diagnóstico recebido.' })).toBeVisible();
  expect(await leads()).toHaveLength(1);
});

test('disables automatic events when a Pixel queue already exists', async ({ page }) => {
  await page.route('https://www.clarity.ms/**', route => route.fulfill({ contentType: 'application/javascript', body: '' }));
  await page.addInitScript(() => {
    localStorage.setItem('sac-analytics-consent', 'accepted');
    const calls: unknown[][] = [];
    const fbq = (...args: unknown[]) => calls.push(args);
    fbq.queue = calls;
    (window as any).fbq = fbq;
  });
  await page.goto('/');
  const calls = await page.evaluate(() => (window as any).fbq.queue as unknown[][]);
  expect(calls.slice(0, 2)).toEqual([
    ['set', 'autoConfig', false, '1014610764961858'],
    ['set', 'smartSetup', false, '1014610764961858'],
  ]);
  expect(calls.filter(call => call[0] === 'init')).toHaveLength(0);
  expect(calls.filter(call => call[1] === 'Lead')).toHaveLength(0);
});
