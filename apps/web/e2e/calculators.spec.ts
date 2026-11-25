import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, type Locator, type Page, test } from '@playwright/test';

/** Three golden vectors per calculator, entered through the form like a customer would. */

interface Vector {
  input: unknown;
  expected: Record<string, unknown>;
}
const golden = (fn: string): Vector[] =>
  (
    JSON.parse(readFileSync(join(__dirname, `../../../tests/golden/${fn}.json`), 'utf8')) as {
      vectors: Vector[];
    }
  ).vectors;

async function submit(page: Page) {
  const before = page.url();
  await page.getByRole('button', { name: 'Show results' }).click();
  await page.waitForURL((u) => u.toString() !== before);
}

/** Compares every numeric expected value that the page shows (by data-testid) within 0.01. */
async function expectValues(page: Page, expected: Record<string, unknown>, keys?: string[]) {
  let checked = 0;
  for (const [key, want] of Object.entries(expected)) {
    if (keys && !keys.includes(key)) continue;
    if (typeof want !== 'number' && want !== null) continue;
    const el = page.getByTestId(key).first();
    if ((await el.count()) === 0) continue;
    await expect
      .poll(
        async () => {
          const raw = await el.getAttribute('data-value');
          if (want === null) return raw === '';
          return Math.abs(Number(raw) - want) <= 0.01;
        },
        { message: `${key} should be ${want}` },
      )
      .toBe(true);
    checked++;
  }
  expect(checked).toBeGreaterThanOrEqual(3);
}

const set = (scope: Page | Locator, label: string | RegExp, v: number) =>
  scope.getByLabel(label, { exact: typeof label === 'string' }).fill(String(v));

test.describe('bill to system', () => {
  for (const idx of [0, 1, 2]) {
    test(`golden vector ${idx}`, async ({ page }) => {
      const v = golden('billToSystem')[idx]!;
      const i = v.input as Record<string, number>;
      await page.goto('/calculators/bill-to-system');
      await set(page, 'Average monthly bill (₱)', i.monthlyBillPhp!);
      await set(page, 'Share of power used in daytime (%)', i.daytimeSharePct!);
      await set(page, 'How much of your usage to cover (%)', i.offsetPct!);
      await submit(page);
      await expectValues(page, v.expected);
    });
  }
});

const APPLIANCE_ROWS = [
  'Aircon (1 HP)',
  'Refrigerator',
  'Electric fan',
  'LED bulb',
  'Washing machine',
  'TV',
  'Rice cooker',
  'Laptop',
];
type Item = { watts: number; qty: number; hoursPerDay: number };

async function fillAppliances(page: Page, items: Item[]) {
  for (const [r, name] of APPLIANCE_ROWS.entries()) {
    const row = page.getByRole('group', { name });
    const it = items[r];
    if (it) {
      await set(row, 'Watts', it.watts);
      await set(row, 'How many', it.qty);
      await set(row, 'Hours a day', it.hoursPerDay);
    } else {
      await set(row, 'How many', 0);
    }
  }
}

test.describe('appliances', () => {
  for (const idx of [0, 2, 5]) {
    test(`applianceLoad golden vector ${idx}`, async ({ page }) => {
      const v = golden('applianceLoad')[idx]!;
      await page.goto('/calculators/appliances');
      await fillAppliances(page, v.input as Item[]);
      await submit(page);
      await expectValues(page, v.expected);
    });
  }
  for (const idx of [0, 1, 2]) {
    test(`whatCanItRun golden vector ${idx}`, async ({ page }) => {
      const v = golden('whatCanItRun')[idx]!;
      const [kwp, items] = v.input as [number, Item[]];
      await page.goto('/calculators/appliances');
      await fillAppliances(page, items);
      await set(page, 'Solar system size (kWp)', kwp);
      await submit(page);
      const hours = v.expected.hours as number[];
      const expected = Object.fromEntries(hours.map((h, n) => [`hours-${n}`, h]));
      await expectValues(page, expected);
    });
  }
});

test.describe('battery backup', () => {
  for (const idx of [0, 1, 4]) {
    test(`golden vector ${idx}`, async ({ page }) => {
      const v = golden('batteryBackup')[idx]!;
      const i = v.input as Record<string, number>;
      await page.goto('/calculators/battery');
      await set(page, 'Essential load (lights, fans, fridge, Wi-Fi) (W)', i.essentialLoadW!);
      await set(page, 'Hours of backup (h)', i.backupHours!);
      await set(page, 'Aircon during brownouts (W)', i.aircondW!);
      await set(page, 'Aircon hours (h)', i.aircondHours!);
      await set(
        page,
        'Usable share of the battery (depth of discharge) (%)',
        i.depthOfDischargePct!,
      );
      await set(page, 'Inverter efficiency (%)', i.inverterEfficiencyPct!);
      await submit(page);
      await expectValues(page, v.expected);
    });
  }
});

test.describe('savings over 25 years', () => {
  for (const idx of [0, 1, 2]) {
    test(`golden vector ${idx}`, async ({ page }) => {
      const v = golden('financialModel')[idx]!;
      const i = v.input as Record<string, number>;
      await page.goto('/calculators/savings');
      await set(page, 'System price (₱)', i.systemCostPhp!);
      await set(page, 'Production in year 1 (kWh)', i.year1Kwh!);
      await set(page, 'Electricity price rise per year', i.escalationPct!);
      await set(page, 'Share you use directly', i.selfUsePct!);
      await set(page, 'Panel output loss per year', i.degradationPct!);
      await page.getByText('Upkeep, inverter and years').click();
      await set(page, 'Upkeep per year (₱)', i.omPhpPerYear!);
      await set(page, 'Inverter replaced in year (0 = never)', i.inverterReplaceYear!);
      await set(page, 'Inverter replacement cost (₱)', i.inverterReplaceCostPhp!);
      await set(page, 'Years to model', i.years!);
      await page.getByRole('button', { name: 'Show results' }).click();
      await page.waitForURL(/esc=/);
      await expectValues(page, v.expected);
    });
  }
});

test.describe('quote checker', () => {
  for (const idx of [0, 1, 2]) {
    test(`golden vector ${idx}`, async ({ page }) => {
      const v = golden('quoteScore')[idx]!;
      const [q, usage] = v.input as [Record<string, number>, number];
      await page.goto('/calculators/quote-checker');
      await set(page, 'Total price incl. VAT (₱)', q.totalPricePhp!);
      await set(page, 'System size (kWp)', q.kwp!);
      await set(page, 'Battery price in the quote (0 if none) (₱)', q.batteryPricePhp!);
      await set(page, 'Production the quote promises per month (kWh)', q.claimedKwhMonth!);
      await set(page, 'Your monthly usage (kWh)', usage);
      const boxes = page
        .getByRole('group', { name: 'What the quote puts in writing' })
        .getByRole('checkbox');
      for (let n = 0; n < 12; n++) await boxes.nth(n).setChecked(n < q.itemsInWriting!);
      await page.getByRole('button', { name: 'Show results' }).click();
      await page.waitForURL(/price=/);
      await expectValues(page, v.expected);
      await expect(page.getByTestId('itemsInWriting')).toHaveAttribute(
        'data-value',
        String(Math.min(12, q.itemsInWriting!)),
      );
    });
  }
});

test.describe('loan vs savings', () => {
  for (const idx of [0, 3, 4]) {
    test(`golden vector ${idx}`, async ({ page }) => {
      const v = golden('loanVsSavings')[idx]!;
      const i = v.input as Record<string, number>;
      await page.goto('/calculators/loan-vs-savings');
      await set(page, 'System price (₱)', i.pricePhp!);
      await set(page, 'Down payment (₱)', i.downPaymentPhp!);
      await set(page, 'Yearly interest rate your lender quotes (%)', i.annualRatePct!);
      await set(page, 'Loan term (years)', i.termYears!);
      await set(page, 'Monthly bill savings (₱)', i.monthlySavingsPhp!);
      await set(page, 'Electricity price rise per year (%)', i.escalationPct!);
      await submit(page);
      await expectValues(page, v.expected);
    });
  }
});

test.describe('calculator pages', () => {
  test('server-render a worked example with answer, FAQ and structured data', async ({ page }) => {
    await page.goto('/calculators/bill-to-system');
    await expect(
      page.getByRole('heading', { name: 'What size solar system do I need for my bill?' }),
    ).toBeVisible();
    await expect(page.getByTestId('kwp')).toHaveAttribute('data-value', '3');
    await expect(page.getByRole('heading', { name: 'Common questions' })).toBeVisible();
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const types = blocks.flatMap((b) =>
      (JSON.parse(b) as { '@type': string }[]).map((x) => x['@type']),
    );
    expect(types).toEqual(['WebApplication', 'FAQPage', 'BreadcrumbList']);
    await expect(page.getByText(/Defaults checked Oct 2026/)).toBeVisible();
  });

  test('works without JavaScript', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto('/calculators/battery');
    await page.getByLabel('Hours of backup (h)', { exact: true }).fill('12');
    await page.getByRole('button', { name: 'Show results' }).click();
    await expect(page).toHaveURL(/hours=12/);
    await expect(page.getByTestId('neededKwh')).toHaveAttribute('data-value', '4.8');
    await ctx.close();
  });

  test('an invalid value keeps the example and says what to fix', async ({ page }) => {
    await page.goto('/calculators/bill-to-system?bill=6000&daytime=150&offset=80');
    await expect(
      page.getByRole('alert').filter({ hasText: 'One value needs fixing.' }),
    ).toBeVisible();
    await expect(page.getByText('Enter a number from 0 to 100.')).toBeVisible();
    await expect(page.getByTestId('kwp')).toHaveAttribute('data-value', '3');
  });

  test('save asks a signed-out customer to sign in', async ({ page }) => {
    await page.goto('/calculators/loan-vs-savings');
    await page.getByRole('button', { name: 'Save to my profile' }).click();
    await expect(page.getByText('Sign in to save this to your profile.')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Go to sign in' })).toBeVisible();
  });

  test('slider changes update the savings without pressing the button', async ({ page }) => {
    await page.goto('/calculators/savings');
    const before = await page.getByTestId('totalSavingsPhp').getAttribute('data-value');
    await page.getByLabel('Share you use directly').fill('100');
    await page.waitForURL(/self=100/);
    await expect(page.getByTestId('totalSavingsPhp')).not.toHaveAttribute('data-value', before!);
  });

  test('every calculator is linked from the index', async ({ page }) => {
    await page.goto('/calculators');
    for (const name of [
      'Bill to system size',
      'Savings over 25 years',
      'What can solar run?',
      'Battery backup',
      'Quote checker',
      'Loan vs savings',
    ]) {
      await expect(page.getByRole('link', { name })).toBeVisible();
    }
  });
});
