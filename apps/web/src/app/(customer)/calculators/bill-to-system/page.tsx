import { formatNumber, formatPhp, ResultCard, WarningBanner } from '@vserve/ui';
import Link from 'next/link';
import { CalcForm } from '@/components/calculator/calc-form';
import { CalculatorPage, saveValues, Stat } from '@/components/calculator/calculator-page';
import { InputErrors, NumberFields } from '@/components/calculator/fields';
import {
  calculatorMetadata,
  loadCalculatorPage,
  type SearchParams,
} from '@/lib/calculator-page-data';
import { BILL_FIELDS, CALCULATOR_PATHS, runCalculator } from '@/lib/calculators';

export const metadata = calculatorMetadata('bill');

export default async function BillToSystemPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { settings, get, parsed, content, path } = await loadCalculatorPage(
    'bill',
    await searchParams,
  );
  const run = runCalculator('bill', parsed.values, settings);
  if (run.kind !== 'bill') return null;
  const r = run.result;
  const c = settings.config;
  const payback =
    r.paybackYearsLow === null || r.paybackYearsHigh === null
      ? null
      : `${formatNumber(r.paybackYearsLow, 1)}–${formatNumber(r.paybackYearsHigh, 1)} years`;

  return (
    <CalculatorPage
      {...content}
      path={path}
      settings={settings}
      save={{ kind: 'bill', values: saveValues(parsed.values) }}
      form={
        <CalcForm action={path}>
          <NumberFields fields={BILL_FIELDS} parsed={parsed} raw={get} className="grid gap-3" />
        </CalcForm>
      }
      results={
        <>
          <InputErrors parsed={parsed} />
          {r.panels === 0 ? (
            <WarningBanner title="Enter your monthly bill">
              With no bill there is nothing to size. Try your average bill from the last few months.
            </WarningBanner>
          ) : (
            <>
              <ResultCard
                highlight
                value={
                  <span data-testid="kwp" data-value={r.kwp}>
                    {formatNumber(r.kwp, 1)} kWp system
                  </span>
                }
                label={`${r.panels} panels of ${c.panelWatts} W, about ${formatNumber(r.roofAreaM2)} m² of roof`}
                explanation={`It saves about ${formatPhp(r.savingsPhp)} a month and costs ${formatPhp(r.priceLow)}–${formatPhp(r.priceHigh)}. It pays back in ${payback ?? 'more than 25 years'}.`}
              />
              {r.notes.includes('mostly_exported') ? (
                <WarningBanner title="Most of this power goes to the grid">
                  Exported power earns less than the power you use yourself. A smaller system, or
                  more daytime use, pays back faster.
                </WarningBanner>
              ) : null}
            </>
          )}
          <dl className="rounded-[10px] border border-line bg-surface px-3">
            <Stat
              label="Your usage"
              value={`${formatNumber(r.usageKwh)} kWh a month`}
              raw={r.usageKwh}
              testId="usageKwh"
            />
            <Stat label="Panels" value={String(r.panels)} raw={r.panels} testId="panels" />
            <Stat
              label="Roof area"
              value={`${formatNumber(r.roofAreaM2, 1)} m²`}
              raw={r.roofAreaM2}
              testId="roofAreaM2"
            />
            <Stat
              label="Production"
              value={`${formatNumber(r.productionKwh)} kWh a month`}
              raw={r.productionKwh}
              testId="productionKwh"
            />
            <Stat
              label="Used in your home"
              value={`${formatNumber(r.selfUsedKwh)} kWh`}
              raw={r.selfUsedKwh}
              testId="selfUsedKwh"
            />
            <Stat
              label="Sent to the grid"
              value={`${formatNumber(r.exportedKwh)} kWh`}
              raw={r.exportedKwh}
              testId="exportedKwh"
            />
            <Stat
              label="Savings a month"
              value={formatPhp(r.savingsPhp)}
              raw={r.savingsPhp}
              testId="savingsPhp"
            />
            <Stat
              label="Price, low"
              value={formatPhp(r.priceLow)}
              raw={r.priceLow}
              testId="priceLow"
            />
            <Stat
              label="Price, high"
              value={formatPhp(r.priceHigh)}
              raw={r.priceHigh}
              testId="priceHigh"
            />
            <Stat
              label="Savings over 25 years (flat rates)"
              value={formatPhp(r.savings25yPhp)}
              raw={r.savings25yPhp}
              testId="savings25yPhp"
            />
          </dl>
        </>
      }
      nextStep={
        <p>
          See how these savings grow over 25 years in the{' '}
          <Link
            className="font-bold underline underline-offset-4"
            href={`${CALCULATOR_PATHS.savings}?cost=${Math.round((r.priceLow + r.priceHigh) / 2)}&kwh=${Math.round(r.productionKwh * 12)}`}
          >
            savings calculator
          </Link>
          , or ask verified companies for quotes.
        </p>
      }
      assumptions={
        <ul className="list-disc pl-5">
          <li>Rate ₱{formatNumber(c.ratePhpPerKwh, 2)}/kWh (Meralco residential).</li>
          <li>
            {formatNumber(c.yieldKwhPerKwpDay, 1)} kWh per kWp per day, {c.daysPerMonth} days a
            month. A design for your roof uses simulated sun data instead.
          </li>
          <li>
            Panels {c.panelWatts} W, {formatNumber(c.panelAreaM2, 1)} m² each with spacing.
          </li>
          <li>
            Installed price {formatPhp(c.priceLowPerKwp)}–{formatPhp(c.priceHighPerKwp)} per kWp,
            grid-tied.
          </li>
          <li>Power sent to the grid earns ₱{formatNumber(c.exportCreditPhpPerKwh, 2)}/kWh.</li>
        </ul>
      }
    />
  );
}
