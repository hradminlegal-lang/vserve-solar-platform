import Link from 'next/link';
import { Card } from '@vserve/ui';

const shortcuts = [
  {
    href: '/calculators/savings',
    title: 'Savings over 25 years',
    body: 'Payback, return and cost per kWh',
  },
  { href: '/calculators', title: 'What can solar run?', body: 'Aircon, ref, pump and more' },
  { href: '/companies', title: 'Find solar companies', body: 'Verified, with real reviews' },
  { href: '/shop', title: 'Shop panels and kits', body: 'Compare price per watt' },
];

export default function HomePage() {
  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-xl bg-navy p-5 text-navy-ink">
        <p className="text-sm text-navy-muted">Start here</p>
        <h1 className="font-display text-3xl font-extrabold">How much solar do I need?</h1>
        <p className="mt-1 max-w-prose text-navy-muted">
          See the size, price and savings for your home before anyone sells to you.
        </p>
        <Link
          href="/calculators/savings"
          className="mt-4 inline-flex min-h-12 items-center rounded-[10px] bg-sun px-4 font-bold text-sun-ink"
        >
          See my savings
        </Link>
      </section>
      <ul className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {shortcuts.map((s) => (
          <li key={s.href}>
            <Link
              href={s.href}
              className="block h-full rounded-[10px] focus-visible:outline-3 focus-visible:outline-sun"
            >
              <Card className="h-full hover:border-sun">
                <h2 className="font-bold">{s.title}</h2>
                <p className="text-sm text-muted">{s.body}</p>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
