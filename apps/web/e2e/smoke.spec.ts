import { expect, test } from '@playwright/test';

test('home page loads with the main call to action', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('How much solar do I need?');
  await expect(page.getByRole('link', { name: 'See my savings' })).toBeVisible();
});

test('web app manifest is served', async ({ request }) => {
  const res = await request.get('/manifest.webmanifest');
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.name).toBe('VServe Solar');
});

test('unknown pages show a helpful not-found state', async ({ page }) => {
  await page.goto('/no-such-page');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
});
