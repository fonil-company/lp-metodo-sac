import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://connect.facebook.net/**', route => route.fulfill({ contentType: 'application/javascript', body: '' }));
  await page.route('https://www.clarity.ms/**', route => route.fulfill({ contentType: 'application/javascript', body: '' }));
});

for (const analytics of [false, true]) {
test(`desktop: complete diagnostic, analytics=${analytics}`, async ({ page }) => {
  const errors: string[] = [];
  let submittedLead: Record<string, string> | undefined;
  const attempts: Record<string, string>[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/api/leads', async route => {
    submittedLead = route.request().postDataJSON();
    attempts.push(submittedLead!);
    await route.fulfill({ status: attempts.length === 1 ? 502 : 200, contentType: 'application/json', body: JSON.stringify({ success: attempts.length > 1 }) });
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/?utm_source=browser-test&utm_medium=paid&utm_campaign=cole%C3%A7%C3%A3o+nova&utm_content=A%2BB&utm_term=teste&utm_id=campaign-1&fbclid=click-1');
  const pixelLeads = () => page.evaluate(() => ((window as any).fbq?.queue || []).filter((call: any[]) => call[0] === 'track' && call[1] === 'Lead'));
  await page.getByRole('button', { name: analytics ? 'Aceitar métricas' : 'Só essenciais', exact: true }).click();
  expect(await pixelLeads()).toHaveLength(0);
  if (analytics) expect(await page.evaluate(() => (window as any).fbq.queue.filter((call: any[]) => call[1] === 'PageView'))).toHaveLength(1);
  await page.evaluate(() => history.replaceState(null, '', '/'));
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.screenshot({ path: 'test-results/desktop.png' });
  await page.getByRole('link', { name: /Iniciar diagnóstico SAC/ }).first().click();
  const panel = page.locator('#diagnostic-panel');
  await panel.getByRole('button', { name: 'Continuar', exact: true }).click();
  await expect(panel.getByRole('alert')).toHaveCount(2);
  await panel.getByRole('radio', { name: 'Indústria', exact: true }).check();
  await panel.locator('select').selectOption('Alimentos e bebidas');
  await panel.getByRole('button', { name: 'Continuar', exact: true }).click();
  await panel.getByRole('radio', { name: 'R$ 1 milhão a R$ 3 milhões/mês', exact: true }).check();
  await panel.getByRole('radio', { name: '51 a 100', exact: true }).check();
  await page.reload();
  await expect(panel.getByRole('radio', { name: '51 a 100', exact: true })).toBeChecked();
  await panel.getByRole('button', { name: 'Voltar', exact: true }).click();
  await expect(panel.getByRole('radio', { name: 'Indústria', exact: true })).toBeChecked();
  await panel.getByRole('button', { name: 'Continuar', exact: true }).click();
  await panel.getByRole('button', { name: 'Continuar', exact: true }).click();
  await panel.locator('fieldset').nth(0).getByRole('radio').nth(1).check();
  await panel.locator('fieldset').nth(1).getByRole('radio').nth(2).check();
  await panel.getByRole('button', { name: 'Continuar', exact: true }).click();
  await panel.locator('select').selectOption('Prospecção dos representantes');
  await panel.getByRole('radio', { name: '1 a 5', exact: true }).check();
  await panel.getByRole('button', { name: 'Continuar', exact: true }).click();
  await panel.getByRole('radio').first().check();
  await panel.getByRole('button', { name: 'Continuar', exact: true }).click();
  await panel.getByRole('radio', { name: 'Sou o principal decisor', exact: true }).check();
  await panel.locator('select').selectOption('Diretor Comercial');
  await panel.getByRole('button', { name: 'Continuar', exact: true }).click();
  await panel.getByRole('button', { name: 'Finalizar meu diagnóstico SAC', exact: true }).click();
  await expect(panel.getByRole('alert')).toHaveCount(7);
  expect(attempts).toHaveLength(0);
  expect(await pixelLeads()).toHaveLength(0);
  await panel.getByRole('textbox', { name: 'Nome completo' }).fill('Ana Silva');
  await panel.getByRole('textbox', { name: 'Empresa', exact: true }).fill('Empresa Teste');
  await panel.getByRole('textbox', { name: 'WhatsApp' }).fill('+5511999999999');
  await panel.getByRole('textbox', { name: 'E-mail corporativo' }).fill('ana@example.com');
  await panel.getByRole('textbox', { name: 'Cidade da sede' }).fill('São Paulo');
  await panel.getByRole('combobox', { name: 'Estado' }).selectOption('SP');
  await panel.getByRole('checkbox').check();
  await panel.getByRole('button', { name: 'Finalizar meu diagnóstico SAC', exact: true }).click();
  await expect(panel.getByRole('alert')).toContainText('Não foi possível enviar');
  await expect(panel.getByRole('heading', { name: 'Diagnóstico recebido.' })).toHaveCount(0);
  expect(await pixelLeads()).toHaveLength(0);
  await page.reload();
  await expect(panel.getByRole('textbox', { name: 'Nome completo' })).toHaveValue('Ana Silva');
  await panel.getByRole('checkbox').check();
  await panel.getByRole('button', { name: 'Finalizar meu diagnóstico SAC', exact: true }).click();
  await expect(panel.getByRole('heading', { name: 'Diagnóstico recebido.' })).toBeVisible();
  expect(attempts).toHaveLength(2);
  expect(attempts[0].event_id).toBeTruthy();
  expect(attempts[1]).toEqual(attempts[0]);
  expect(submittedLead?.phone).toBe('+5511999999999');
  expect(submittedLead?.name).toBe('Ana Silva');
  expect(submittedLead?.company).toBe('Empresa Teste');
  expect(submittedLead?.answers).toMatchObject({ profile: 'Indústria', segment: 'Alimentos e bebidas', revenue: 'R$ 1 milhão a R$ 3 milhões/mês', employees: '51 a 100', source: 'Prospecção dos representantes', newClients: '1 a 5', authority: 'Sou o principal decisor', role: 'Diretor Comercial' });
  expect(Object.keys(submittedLead?.answers || {})).toHaveLength(11);
  expect(submittedLead).toMatchObject({ utm_source: 'browser-test', utm_medium: 'paid', utm_campaign: 'coleção nova', utm_content: 'A+B', utm_term: 'teste', utm_id: 'campaign-1', fbclid: 'click-1', event_name: 'Lead' });
  expect(submittedLead?.landing_url).toContain('utm_source=browser-test');
  expect(submittedLead?.form_url).not.toContain('utm_source=');
  const leads = await pixelLeads();
  expect(leads).toHaveLength(analytics ? 1 : 0);
  if (analytics) expect(leads[0][3]).toEqual({ eventID: submittedLead?.event_id });
  expect(await page.evaluate(() => sessionStorage.getItem('sac-diagnostic-v1'))).toBeNull();
  if (!analytics) expect(await page.evaluate(() => (window as any).dataLayer)).toBeUndefined();
  expect(errors).toEqual([]);
});
}

test('mobile: navigation, accordion, consent and viewport overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Aceitar métricas', exact: true }).click();
  await page.screenshot({ path: 'test-results/mobile.png' });
  await page.getByRole('button', { name: 'Abrir menu' }).click();
  await page.getByRole('link', { name: 'Para quem', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Abrir menu' })).toBeVisible();
  await expect(page).toHaveURL(/#para-quem/);
  await page.getByRole('button', { name: /Preciso trocar meu CRM/ }).click();
  await expect(page.locator('#faq-answer-2')).toBeVisible();
  await expect(page.locator('#faq-answer-0')).toBeHidden();
  await page.getByRole('button', { name: 'Privacidade', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    expect(overflow, 'horizontal overflow at ' + width).toBe(false);
  }
  expect(await page.evaluate(() => (window as any).dataLayer.some((item: any) => item.event === 'lp_view'))).toBe(true);
});
