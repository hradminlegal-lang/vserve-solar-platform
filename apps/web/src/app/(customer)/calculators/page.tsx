import { Card } from '@vserve/ui';
import Link from 'next/link';
import { contentFor } from '@/lib/calculator-content';
import { CALCULATOR_PATHS, type CalculatorKind } from '@/lib/calculators';
import { SEED_SETTINGS } from '@/lib/settings';

export const metadata = {
  title: 'Solar calculators',
  description:
    'Free solar calculators for Philippine homes: system size from your bill, appliances, battery backup, 25-year savings, quote checker and loans.',
  alternates: { canonical: '/calculators' },
};

const ORDER: CalculatorKind[] = ['bill', 'savings', 'appliances', 'battery', 'quote', 'loan'];

export default function CalculatorsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Solar calculators</h1>
        <p className="text-muted">
          Start with your bill. Every result shows how it was worked out.
        </p>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {ORDER.map((kind) => {
          const c = contentFor(kind, SEED_SETTINGS);
          return (
            <li key={kind}>
              <Card className="flex h-full flex-col gap-1">
                <h2 className="font-bold">
                  <Link
                    href={CALCULATOR_PATHS[kind]}
                    className="inline-flex min-h-12 items-center underline decoration-sun underline-offset-4"
                  >
                    {c.name}
                  </Link>
                </h2>
                <p className="text-sm text-muted">{c.question}</p>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
