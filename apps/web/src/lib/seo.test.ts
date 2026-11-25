import { describe, expect, it } from 'vitest';
import { contentFor } from './calculator-content';
import { CALCULATOR_PATHS, type CalculatorKind } from './calculators';
import { calculatorJsonLd, jsonLdString, wordCount } from './seo';
import { SEED_SETTINGS } from './settings';

const KINDS = Object.keys(CALCULATOR_PATHS) as CalculatorKind[];

describe('calculator page content', () => {
  it.each(KINDS)('%s: answer is 40–60 words, with at least 3 FAQ', (kind) => {
    const c = contentFor(kind, SEED_SETTINGS);
    const n = wordCount(c.answer);
    expect(n, c.answer).toBeGreaterThanOrEqual(40);
    expect(n, c.answer).toBeLessThanOrEqual(60);
    expect(c.faq.length).toBeGreaterThanOrEqual(3);
    expect(c.description.length).toBeLessThanOrEqual(160);
    expect(c.answer).not.toMatch(/NaN|undefined|null/);
  });
});

describe('JSON-LD', () => {
  const faq = [{ q: 'Q?', a: 'A.' }];
  const [app, faqPage, crumbs] = calculatorJsonLd({
    name: 'Bill to system size',
    description: 'd',
    path: '/calculators/bill-to-system',
    faq,
    base: 'https://example.ph',
  }) as unknown as [Record<string, unknown>, Record<string, unknown>, Record<string, unknown>];

  it('WebApplication has the properties rich results need', () => {
    expect(app['@type']).toBe('WebApplication');
    expect(app.url).toBe('https://example.ph/calculators/bill-to-system');
    for (const k of ['name', 'applicationCategory', 'operatingSystem', 'offers']) {
      expect(app[k], k).toBeTruthy();
    }
  });

  it('FAQPage lists each question with an accepted answer', () => {
    expect(faqPage.mainEntity).toEqual([
      { '@type': 'Question', name: 'Q?', acceptedAnswer: { '@type': 'Answer', text: 'A.' } },
    ]);
  });

  it('BreadcrumbList has numbered absolute items', () => {
    const items = crumbs.itemListElement as { position: number; item: string }[];
    expect(items.map((i) => i.position)).toEqual([1, 2, 3]);
    expect(items.every((i) => i.item.startsWith('https://example.ph/'))).toBe(true);
  });

  it('cannot break out of its script tag', () => {
    expect(jsonLdString({ a: '</script><script>' })).not.toContain('<');
  });
});
