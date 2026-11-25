import Link from 'next/link';
import { Card, Chip } from '@vserve/ui';

export const metadata = { title: 'Calculators' };

const calculators = [
  {
    href: '/calculators/savings',
    title: 'Savings over 25 years',
    body: 'Payback, return and cost per kWh for a system.',
    ready: true,
  },
  {
    href: '#',
    title: 'Bill to system size',
    body: 'From your monthly bill to kWp, panels and price.',
    ready: false,
  },
  {
    href: '#',
    title: 'What can solar run?',
    body: 'Hours each appliance can run on your system.',
    ready: false,
  },
  { href: '#', title: 'Battery backup', body: 'Battery size for brownouts.', ready: false },
  { href: '#', title: 'Quote checker', body: 'Compare quotes fairly.', ready: false },
  { href: '#', title: 'Loan vs savings', body: 'Will the savings cover the loan?', ready: false },
];

export default function CalculatorsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-2xl font-extrabold">Calculators</h1>
      <ul className="grid gap-2 sm:grid-cols-2">
        {calculators.map((c) => (
          <li key={c.title}>
            <Card className="flex h-full flex-col gap-1">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-bold">
                  {c.ready ? (
                    <Link href={c.href} className="underline decoration-sun underline-offset-4">
                      {c.title}
                    </Link>
                  ) : (
                    c.title
                  )}
                </h2>
                {c.ready ? null : <Chip>Coming soon</Chip>}
              </div>
              <p className="text-sm text-muted">{c.body}</p>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
