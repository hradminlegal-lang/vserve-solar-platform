import type { FinancialYear } from '@vserve/calc';
import { formatNumber, formatPhp } from '@vserve/ui';

/** C2 cumulative cash chart: inline SVG, no chart library; the label says what it shows. */
export function CumulativeChart({
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
