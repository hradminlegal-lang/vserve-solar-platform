import { formatNumber, formatPhp, KpiGrid, ResultCard, WarningBanner } from '@vserve/ui';
import Link from 'next/link';
import { CalcForm } from '@/components/calculator/calc-form';
import { CalculatorPage, saveValues, Stat } from '@/components/calculator/calculator-page';
import { CumulativeChart } from '@/components/calculator/cumulative-chart';
import { InputErrors, NumberFields, RangeFields } from '@/components/calculator/fields';
import {
  calculatorMetadata,
  loadCalculatorPage,
  type SearchParams,
} from '@/lib/calculator-page-data';
import {
  CALCULATOR_PATHS,
  runCalculator,
  SAVINGS_FIELDS,
  SAVINGS_SLIDERS,
} from '@/lib/calculators';

export const metadata = calculatorMetadata('savings');

/** Screen C2: 25-year savings with assumption sliders. */
export default async function SavingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { settings, get, parsed, content, path } = await loadCalculatorPage(
    'savings',
    await searchParams,
  );
  const run = runCalculator('savings', parsed.values, settings);
  if (run.kind !== 'savings') return null;
  const r = run.result;
  const i = run.input;
  const main = SAVINGS_FIELDS.filter((f) => f.key === 'cost' || f.key === 'kwh');
  const sliders = SAVINGS_FIELDS.filter((f) => SAVINGS_SLIDERS.includes(f.key));
  const more = SAVINGS_FIELDS.filter(
    (f) => !SAVINGS_SLIDERS.includes(f.key) && f.key !== 'cost' && f.key !== 'kwh',
  );
  const payback = r.paybackYears === null ? null : formatNumber(r.paybackYears, 1);
  const hasMoreErrors = more.some((f) => parsed.errors[f.key]);

  return (
    <CalculatorPage
      {...content}
      path={path}
      settings={settings}
      save={{ kind: 'savings', values: saveValues(parsed.values) }}
      form={
        <CalcForm action={path}>
          <NumberFields fields={main} parsed={parsed} raw={get} className="grid gap-3" />
          <RangeFields fields={sliders} parsed={parsed} />
          <details className="rounded-lg border border-line p-2" open={hasMoreErrors}>
            <summary className="flex min-h-12 cursor-pointer items-center font-bold">
              Upkeep, inverter and years
            </summary>
            <NumberFields fields={more} parsed={parsed} raw={get} className="mt-2 grid gap-3" />
          </details>
        </CalcForm>
      }
      results={
        <>
          <InputErrors parsed={parsed} />
          <ResultCard
            highlight
            value={
              <span data-testid="totalSavingsPhp" data-value={r.totalSavingsPhp}>
                {formatPhp(r.totalSavingsPhp)} saved
              </span>
            }
            label={`Total bill savings over ${i.years} years`}
            explanation={`After upkeep and the inverter replacement, you keep about ${formatPhp(r.netGainPhp)}.`}
          />
          {payback === null ? (
            <WarningBanner title={`Does not pay back within ${i.years} years`}>
              Check the price and production with the quote checker before you buy.
            </WarningBanner>
          ) : null}
          {r.years.length > 0 ? (
            <figure className="rounded-[10px] border border-line bg-surface p-3">
              <CumulativeChart
                years={r.years}
                cost={i.systemCostPhp}
                paybackYears={r.paybackYears}
              />
              <figcaption className="mt-1 text-sm text-muted">
                Money in your pocket each year after paying for the system.{' '}
                {payback === null ? null : `It pays back in about ${payback} years.`}
              </figcaption>
            </figure>
          ) : null}
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
              value={`₱${formatNumber(i.ratePhpPerKwh, 2)}`}
              label="What Meralco charges now"
            />
          </KpiGrid>
          <dl className="rounded-[10px] border border-line bg-surface px-3">
            <Stat
              label="Net gain"
              value={formatPhp(r.netGainPhp)}
              raw={r.netGainPhp}
              testId="netGainPhp"
            />
            <Stat
              label="Pays back in"
              value={payback === null ? 'Not within the period' : `${payback} years`}
              raw={r.paybackYears}
              testId="paybackYears"
            />
            <Stat
              label="Present value (NPV)"
              value={formatPhp(r.npvPhp)}
              raw={r.npvPhp}
              testId="npvPhp"
            />
            <Stat
              label="Return (IRR)"
              value={r.irr === null ? '–' : `${formatNumber(r.irr * 100, 1)}%`}
              raw={r.irr}
              testId="irr"
            />
            <Stat
              label="Cost per kWh (LCOE)"
              value={r.lcoePhpPerKwh === null ? '–' : `₱${formatNumber(r.lcoePhpPerKwh, 2)}`}
              raw={r.lcoePhpPerKwh}
              testId="lcoePhpPerKwh"
            />
            <Stat
              label="Savings in year 1"
              value={formatPhp(r.year1SavingsPhp)}
              raw={r.year1SavingsPhp}
              testId="year1SavingsPhp"
            />
          </dl>
        </>
      }
      nextStep={
        <p>
          Paying with a loan? Check whether the savings cover it in{' '}
          <Link
            className="font-bold underline underline-offset-4"
            href={`${CALCULATOR_PATHS.loan}?price=${i.systemCostPhp}&save=${Math.round(r.year1SavingsPhp / 12)}`}
          >
            loan vs savings
          </Link>
          .
        </p>
      }
      assumptions={
        <ul className="list-disc pl-5">
          <li>
            Year-1 production {formatNumber(i.year1Kwh)} kWh, falling {i.degradationPct}% a year.
          </li>
          <li>
            You use {i.selfUsePct}% directly at ₱{formatNumber(i.ratePhpPerKwh, 2)}/kWh; the rest
            earns ₱{formatNumber(i.exportCreditPhpPerKwh, 2)}/kWh net-metering credit. Both rise{' '}
            {i.escalationPct}% a year.
          </li>
          <li>
            Upkeep {formatPhp(i.omPhpPerYear)} a year, rising {i.inflationPct}% a year.
            {i.inverterReplaceYear > 0
              ? ` Inverter replaced in year ${i.inverterReplaceYear} for ${formatPhp(i.inverterReplaceCostPhp)}.`
              : ' No inverter replacement.'}
          </li>
          <li>Present value and cost per kWh use a {i.discountPct}% discount rate.</li>
        </ul>
      }
    />
  );
}
