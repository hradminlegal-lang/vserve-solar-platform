/** Structured data (schema.org JSON-LD) for calculator and education pages. */

export interface Faq {
  q: string;
  a: string;
}

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
}

export function calculatorJsonLd(p: {
  name: string;
  description: string;
  path: string;
  faq: Faq[];
  base?: string;
}) {
  const base = p.base ?? siteUrl();
  const url = `${base}${p.path}`;
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: p.name,
      description: p.description,
      url,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires a web browser',
      isAccessibleForFree: true,
      inLanguage: 'en-PH',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'PHP' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: p.faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${base}/` },
        { '@type': 'ListItem', position: 2, name: 'Calculators', item: `${base}/calculators` },
        { '@type': 'ListItem', position: 3, name: p.name, item: url },
      ],
    },
  ];
}

/** Serialises JSON-LD for a <script> tag; escapes "<" so content cannot close the tag. */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/** Words in a string, for the 40–60 word answer-first rule. */
export function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}
