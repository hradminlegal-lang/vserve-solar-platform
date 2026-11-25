import { formatNumber, formatPhp, NumberInput, ResultCard, WarningBanner } from '@vserve/ui';
import Link from 'next/link';
import { CalcForm } from '@/components/calculator/calc-form';
import { CalculatorPage, saveValues, Stat } from '@/components/calculator/calculator-page';
import { InputErrors, NumberFields } from '@/components/calculator/fields';
import {
  calculatorMetadata,
  loadCalculatorPage,
  type SearchParams,
} from '@/lib/calculator-page-data';
import { APPLIANCE_FIELDS, APPLIANCES, CALCULATOR_PATHS, runCalculator } from '@/lib/calculators';

export const metadata = calculatorMetadata('appliances');

const COLUMNS = [
  { prefix: 'w', label: 'Watts' },
  { prefix: 'q', label: 'How many' },
  { prefix: 'h', label: 'Hours a day' },
] as const;

export default async function AppliancesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { settings, get, parsed, content, path } = await loadCalculatorPage(
    'appliances',
    await searchParams,
  );
  const run = runCalculator('appliances', parsed.values, settings);
  if (run.kind !== 'appliances') return null;
  const { load, run: canRun } = run.result;
  const c = settings.config;
  const kwpField = APPLIANCE_FIELDS.filter((f) => f.key === 'kwp');
  const used = APPLIANCES.map((a, i) => ({ ...a, i, item: run.input.items[i]! })).filter(
    (a) => a.item.qty > 0 && a.item.watts > 0,
  );

  return (
    <CalculatorPage
      {...content}
      path={path}
      settings={settings}
      save={{ kind: 'appliances', values: saveValues(parsed.values) }}
      form={
        <CalcForm action={path}>
          {APPLIANCES.map((a, i) => (
            <fieldset key={a.name} className="rounded-lg border border-line p-2">
              <legend className="px-1 font-bold">{a.name}</legend>
              <div className="grid grid-cols-3 gap-2">
                {COLUMNS.map((col) => {
                  const key = `${col.prefix}${i}`;
                  const field = APPLIANCE_FIELDS.find((f) => f.key === key)!;
                  const error = parsed.errors[key];
                  return (
                    <NumberInput
                      key={key}
                      name={key}
                      label={col.label}
                      error={error}
                      min={field.min}
                      max={field.max}
                      step="any"
                      defaultValue={error ? get(key) : parsed.values[key]}
                    />
                  );
                })}
              </div>
            </fieldset>
          ))}
          <NumberFields fields={kwpField} parsed={parsed} raw={get} className="grid gap-3" />
        </CalcForm>
      }
      results={
        <>
          <InputErrors parsed={parsed} />
          {load.dailyKwh === 0 ? (
            <WarningBanner title="Add an appliance">
              Set how many you have and the hours you use each one.
            </WarningBanner>
          ) : (
            <ResultCard
              highlight
              value={
                <span data-testid="dailyKwh" data-value={load.dailyKwh}>
                  {formatNumber(load.dailyKwh, 1)} kWh a day
                </span>
              }
              label={`About ${formatPhp(load.monthlyCostPhp)} a month at today's rate`}
              explanation={`${load.panels} panels (${formatNumber(load.kwp, 1)} kWp) would cover it. A hybrid inverter for running everything at once needs at least ${formatNumber(load.hybridInverterMinKw, 1)} kW.`}
            />
          )}
          {load.notes.includes('hours_capped') ? (
            <WarningBanner title="Hours were capped at 24 a day" />
          ) : null}
          <dl className="rounded-[10px] border border-line bg-surface px-3">
            <Stat
              label="Per month"
              value={`${formatNumber(load.monthlyKwh)} kWh`}
              raw={load.monthlyKwh}
              testId="monthlyKwh"
            />
            <Stat
              label="Cost per month"
              value={formatPhp(load.monthlyCostPhp)}
              raw={load.monthlyCostPhp}
              testId="monthlyCostPhp"
            />
            <Stat
              label="Panels to cover it"
              value={String(load.panels)}
              raw={load.panels}
              testId="panels"
            />
            <Stat
              label="System size"
              value={`${formatNumber(load.kwp, 1)} kWp`}
              raw={load.kwp}
              testId="kwp"
            />
            <Stat
              label="Everything on at once"
              value={`${formatNumber(load.peakKw, 2)} kW`}
              raw={load.peakKw}
              testId="peakKw"
            />
            <Stat
              label="Hybrid inverter, at least"
              value={`${formatNumber(load.hybridInverterMinKw, 2)} kW`}
              raw={load.hybridInverterMinKw}
              testId="hybridInverterMinKw"
            />
          </dl>
          <div className="rounded-[10px] border border-line bg-surface p-3">
            <h3 className="font-bold">
              What a {formatNumber(run.input.systemKwp, 1)} kWp system can run
            </h3>
            <p className="text-sm text-muted">
              One day of solar ({formatNumber(canRun.dailyKwh, 1)} kWh) on each appliance alone.
            </p>
            {used.length === 0 ? (
              <p className="mt-2 text-sm">No appliances added yet.</p>
            ) : (
              <dl className="mt-1">
                {used.map((a) => (
                  <Stat
                    key={a.name}
                    label={a.item.qty > 1 ? `${a.name} × ${a.item.qty}` : a.name}
                    value={`${formatNumber(canRun.hours[a.i] ?? 0, 1)} hours`}
                    raw={canRun.hours[a.i] ?? 0}
                    testId={`hours-${a.i}`}
                  />
                ))}
              </dl>
            )}
          </div>
        </>
      }
      nextStep={
        <p>
          Need power during brownouts? Size a battery with the{' '}
          <Link className="font-bold underline underline-offset-4" href={CALCULATOR_PATHS.battery}>
            battery backup calculator
          </Link>
          .
        </p>
      }
      assumptions={
        <ul className="list-disc pl-5">
          <li>Watts × how many × hours a day, with hours capped at 24.</li>
          <li>
            Rate ₱{formatNumber(c.ratePhpPerKwh, 2)}/kWh; {c.daysPerMonth} days a month.
          </li>
          <li>
            {formatNumber(c.yieldKwhPerKwpDay, 1)} kWh per kWp per day; panels {c.panelWatts} W.
          </li>
          <li>Hybrid inverter size is everything at once plus 25% margin.</li>
        </ul>
      }
    />
  );
}
