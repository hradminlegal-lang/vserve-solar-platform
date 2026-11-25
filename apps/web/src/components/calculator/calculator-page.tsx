import Link from 'next/link';
import type { ReactNode } from 'react';
import { calculatorJsonLd, type Faq, jsonLdString } from '@/lib/seo';
import { type CalcSettings, formatAsOf } from '@/lib/settings';
import { SaveForm } from './save-form';

/**
 * Shared layout for every customer calculator: answer first, then the form, results, what to do
 * next, the inputs and dated defaults behind the numbers, FAQ, and JSON-LD.
 */
export function CalculatorPage({
  name,
  path,
  description,
  question,
  answer,
  form,
  results,
  nextStep,
  assumptions,
  faq,
  settings,
  save,
}: {
  name: string;
  path: string;
  description: string;
  question: string;
  answer: string;
  form: ReactNode;
  results: ReactNode;
  nextStep: ReactNode;
  assumptions: ReactNode;
  faq: Faq[];
  settings: CalcSettings;
  save: { kind: string; values: Record<string, string> };
}) {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4 lg:max-w-5xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdString(calculatorJsonLd({ name, description, path, faq })),
        }}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link
              href="/"
              className="inline-flex min-h-12 items-center underline-offset-4 hover:underline"
            >
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link
              href="/calculators"
              className="inline-flex min-h-12 items-center underline-offset-4 hover:underline"
            >
              Calculators
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page">{name}</li>
        </ol>
      </nav>

      <header className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-extrabold">{name}</h1>
        <section aria-labelledby="answer-q" className="rounded-[10px] bg-sunken p-3">
          <h2 id="answer-q" className="font-bold">
            {question}
          </h2>
          <p className="mt-1">{answer}</p>
        </section>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start">
        <section
          aria-labelledby="inputs-h"
          className="rounded-[10px] border border-line bg-surface p-3"
        >
          <h2 id="inputs-h" className="mb-2 font-bold">
            Your numbers
          </h2>
          {form}
        </section>

        <div className="flex flex-col gap-3">
          <section aria-labelledby="results-h" aria-live="polite" className="flex flex-col gap-3">
            <h2 id="results-h" className="font-bold">
              Results
            </h2>
            {results}
          </section>
          <section
            aria-labelledby="next-h"
            className="rounded-[10px] border border-line bg-surface p-3"
          >
            <h2 id="next-h" className="font-bold">
              What to do next
            </h2>
            <div className="mt-1 text-sm">{nextStep}</div>
            <div className="mt-3">
              <SaveForm kind={save.kind} values={save.values} />
            </div>
          </section>
          <section
            aria-labelledby="assume-h"
            className="rounded-[10px] border border-line bg-surface p-3 text-sm"
          >
            <h2 id="assume-h" className="font-bold">
              How we worked this out
            </h2>
            <div className="mt-1 text-muted">{assumptions}</div>
            <p className="mt-2 text-muted">
              Defaults checked {formatAsOf(settings.asOf)}
              {settings.source === 'seed' ? ' (built-in values)' : ''}. Estimate only. Your
              installer confirms the numbers on site.
            </p>
          </section>
        </div>
      </div>

      <section aria-labelledby="faq-h" className="flex flex-col gap-2">
        <h2 id="faq-h" className="font-display text-xl font-bold">
          Common questions
        </h2>
        {faq.map((f) => (
          <div key={f.q} className="rounded-[10px] border border-line bg-surface p-3">
            <h3 className="font-bold">{f.q}</h3>
            <p className="mt-1 text-sm">{f.a}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

/** A value shown in results, with the raw number kept for tests and screen readers. */
export function Stat({
  label,
  value,
  raw,
  testId,
}: {
  label: string;
  value: string;
  raw: number | null;
  testId: string;
}) {
  return (
    <div className="flex justify-between gap-3 border-b border-line py-2 text-sm last:border-b-0">
      <dt className="text-muted">{label}</dt>
      <dd className="font-bold tabular-nums" data-testid={testId} data-value={raw ?? ''}>
        {value}
      </dd>
    </div>
  );
}

/** Values for the save form: everything the results were computed with. */
export function saveValues(values: Record<string, number>, extra: Record<string, string> = {}) {
  return {
    ...Object.fromEntries(Object.entries(values).map(([k, v]) => [k, String(v)])),
    ...extra,
  };
}
