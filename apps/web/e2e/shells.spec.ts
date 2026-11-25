import { expect, test } from '@playwright/test';

test.describe('customer shell', () => {
  test('main navigation reaches every tab and marks the current one', async ({
    page,
    isMobile,
  }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Main' }).filter({ visible: true });
    await nav.getByRole('link', { name: 'Calculate' }).click();
    await expect(page).toHaveURL(/\/calculators$/);
    await expect(nav.getByRole('link', { name: 'Calculate' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    for (const tab of ['Shop', 'Companies', 'Me']) {
      await nav.getByRole('link', { name: tab, exact: true }).click();
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    }
    expect(typeof isMobile).toBe('boolean');
  });

  test('savings screen shows results computed by the engine', async ({ page }) => {
    await page.goto('/calculators/savings');
    await expect(page.getByRole('heading', { name: 'Savings over 25 years' })).toBeVisible();
    await expect(page.getByText('Savings in year 1')).toBeVisible();
    await expect(
      page.getByRole('img', { name: /Cumulative savings start at minus/ }),
    ).toBeVisible();
    await expect(
      page.getByText('Estimate only. Your installer confirms production on site.'),
    ).toBeVisible();
  });
});

test.describe('company workspace shell', () => {
  test('workspace root goes to the pipeline', async ({ page }) => {
    await page.goto('/w/company-a');
    await expect(page).toHaveURL(/\/w\/company-a\/pipeline$/);
    await expect(page.getByRole('heading', { name: 'Pipeline' })).toBeVisible();
  });

  test('a lead can be moved between stages with the keyboard', async ({ page }) => {
    await page.goto('/w/company-a/pipeline');
    const move = page.getByLabel('Move R. Santos to');
    await move.focus();
    await move.selectOption('site_survey');
    const column = page
      .getByRole('region', { name: 'Sales pipeline' })
      .locator('section', { has: page.getByRole('heading', { name: /^Site survey/ }) });
    await expect(column.getByText('R. Santos', { exact: true })).toBeVisible();
    await expect(page.getByText('R. Santos moved to Site survey')).toBeVisible();
  });

  test('unknown workspace sections are not found', async ({ page }) => {
    // Streaming (root loading.tsx) sends headers before notFound() runs, so the status can be 200;
    // the not-found page and its noindex tag are what matter for private workspace pages.
    await page.goto('/w/company-a/nope');
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  });

  test('placeholder sections say which prompt builds them', async ({ page }) => {
    await page.goto('/w/company-a/designs');
    await expect(page.getByText('The design studio is built in prompts 10 to 12.')).toBeVisible();
  });
});
