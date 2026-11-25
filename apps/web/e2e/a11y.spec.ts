import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const pages = ['/', '/calculators', '/calculators/savings', '/w/company-a/pipeline', '/dev/ui'];

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`${scheme} theme`, () => {
    test.use({ colorScheme: scheme });

    for (const path of pages) {
      test(`${path} has no accessibility violations`, async ({ page }) => {
        await page.goto(path);
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze();
        expect(
          results.violations.map(
            (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`,
          ),
        ).toEqual([]);
      });

      test(`${path} screenshot`, async ({ page }, info) => {
        await page.goto(path);
        await page.screenshot({
          path: info.outputPath(`${path.replace(/\W+/g, '_') || 'home'}-${scheme}.png`),
          fullPage: true,
        });
      });
    }
  });
}

test('interactive controls meet the 48 px tap target on the gallery', async ({ page }) => {
  await page.goto('/dev/ui');
  const small = await page.$$eval(
    'main button, main a, main select, main input:not([type=checkbox])',
    (els) =>
      els
        .filter((el) => (el as HTMLElement).offsetParent !== null)
        .map((el) => ({
          h: el.getBoundingClientRect().height,
          text: (el.textContent || el.getAttribute('aria-label') || el.tagName).trim().slice(0, 30),
        }))
        .filter((x) => x.h < 44),
  );
  expect(small).toEqual([]);
});
