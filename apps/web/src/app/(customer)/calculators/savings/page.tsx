import { DEFAULT_CONFIG, financialModel, type FinancialYear } from '@vserve/calc';
import { formatNumber, formatPhp, KpiGrid, ResultCard } from '@vserve/ui';
import Link from 'next/link';

export const metadata = {
  title: 'Savings over 25 years',
  description:
    'How much a solar system saves over 25 years, when it pays back, and what each kWh really costs.',
};

/**
 * Reference screen C2 with an example system. The interactive version (prompt 05) takes the
 * customer's own numbers; defaults will come from the settings table instead of DEFAULT_CONFIG.
 */
const EXAMPLE = {
  kwp: 5.4,
  systemCostPhp: 290000,
  year1Kwh: 7228,
  degradationPct: 0.5,
  escalationPct: 2,
  selfUsePct: 65,
  omPhpPerYear: 3000,
  inflationPct: 3,
  inverterReplaceYear: 12,
  inverterReplaceCostPhp: 45000,
  years: 25,
  discountPct: 8,
};

export default function SavingsPage() {
  const config = DEFAULT_CONFIG;
  const r = financialModel({
    ...EXAMPLE,
    ratePhpPerKwh: config.ratePhpPerKwh,
    exportCreditPhpPerKwh: config.exportCreditPhpPerKwh,
  });

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-3">
      <div>
        <Link href="/calculators" className="inline-flex min-h-12 items-center text-sm text-muted">
          ← Calculators
        </Link>
        <h1 className="font-display text-2xl font-extrabold">Savings over 25 years</h1>
        <p className="text-sm text-muted">
          Example: {EXAMPLE.kwp} kWp system at {formatPhp(EXAMPLE.systemCostPhp)}
        </p>
      </div>

      <ResultCard
        highlight
        value={`${formatPhp(r.totalSavingsPhp)} saved`}
        label="Total bill savings over 25 years"
        explanation={`After upkeep and one inverter replacement, you keep about ${formatPhp(r.netGainPhp)}.`}
      />

      <figure className="rounded-[10px] border border-line bg-surface p-3">
        <CumulativeChart
          years={r.years}
          cost={EXAMPLE.systemCostPhp}
          paybackYears={r.paybackYears}
        />
        <figcaption className="mt-1 text-sm text-muted">
          Money in your pocket each year after paying for the system. It pays back in about{' '}
          {r.paybackYears === null ? 'more than 25' : formatNumber(r.paybackYears, 1)} years.
        </figcaption>
      </figure>

      <KpiGrid>
        <ResultCard value={formatPhp(r.year1SavingsPhp)} label="Savings in year 1" />
        <ResultCard
          value={r.irr === null ? '–' : `${formatNumber(r.irr * 100)}% a year`}
          label="Return (IRR)"
        />
        <ResultCard
          value={r.lcoePhpPerKwh === null ? '–' : `₱${formatNumber(r.lcoePhpPerKwh, 2)}`}
          label="Cost per kWh from your panels"
        />
        <ResultCard
          value={`₱${formatNumber(config.ratePhpPerKwh, 2)}`}
          label="What Meralco charges now"
        />
      </KpiGrid>

      <section className="rounded-[10px] border border-line bg-surface p-3 text-sm">
        <h2 className="font-bold">Assumptions</h2>
        <ul className="mt-1 list-disc pl-5 text-muted">
          <li>
            First-year production {formatNumber(EXAMPLE.year1Kwh)} kWh, falling{' '}
            {EXAMPLE.degradationPct}% a year.
          </li>
          <li>
            You use {EXAMPLE.selfUsePct}% of it directly; the rest earns ₱
            {formatNumber(config.exportCreditPhpPerKwh, 2)}/kWh in net-metering credit.
          </li>
          <li>Electricity rates rise {EXAMPLE.escalationPct}% a year.</li>
          <li>
            Upkeep {formatPhp(EXAMPLE.omPhpPerYear)} a year; inverter replaced in year{' '}
            {EXAMPLE.inverterReplaceYear} for {formatPhp(EXAMPLE.inverterReplaceCostPhp)}.
          </li>
        </ul>
        <p className="mt-2 text-muted">
          Estimate only. Your installer confirms production on site.
        </p>
      </section>
    </div>
  );
}

function CumulativeChart({
  years,
  cost,
  paybackYears,
}: {
  years: FinancialYear[];
  cost: number;
  paybackYears: number | null;
}) {
  const W = 320;
  const H = 150;
  const pad = { l: 8, r: 8, t: 12, b: 22 };
  const values = [-cost, ...years.map((y) => y.cumulativePhp)];
  const max = Math.max(...values);
  const min = Math.min(...values);
  const x = (i: number) => pad.l + (i / (values.length - 1)) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + ((max - v) / (max - min || 1)) * (H - pad.t - pad.b);
  const points = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const zeroY = y(0);
  const pbX = paybackYears === null ? null : x(paybackYears);
  const label = `Cumulative savings start at minus ${formatPhp(cost)}, cross zero in year ${
    paybackYears === null ? 'never' : formatNumber(paybackYears, 1)
  } and reach ${formatPhp(values[values.length - 1] ?? 0)} by year ${years.length}.`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="h-auto w-full">
      <line
        x1={pad.l}
        x2={W - pad.r}
        y1={zeroY}
        y2={zeroY}
        stroke="var(--vs-line)"
        strokeWidth="1"
      />
      <polyline
        fill="none"
        stroke="var(--vs-sun)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        points={points}
      />
      {pbX !== null ? (
        <>
          <circle cx={pbX} cy={zeroY} r="4" fill="var(--vs-ink)" />
          <text x={pbX + 6} y={zeroY - 6} fontSize="10" fill="var(--vs-ink)">
            pays back
          </text>
        </>
      ) : null}
      <text x={pad.l} y={H - 6} fontSize="10" fill="var(--vs-muted)">
        Today
      </text>
      <text x={W - pad.r} y={H - 6} fontSize="10" fill="var(--vs-muted)" textAnchor="end">
        Year {years.length}
      </text>
    </svg>
  );
}
