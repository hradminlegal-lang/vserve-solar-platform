import { formatNumber, ResultCard, WarningBanner } from '@vserve/ui';
import Link from 'next/link';
import { CalcForm } from '@/components/calculator/calc-form';
import { CalculatorPage, saveValues, Stat } from '@/components/calculator/calculator-page';
import { InputErrors, NumberFields } from '@/components/calculator/fields';
import {
  calculatorMetadata,
  loadCalculatorPage,
  type SearchParams,
} from '@/lib/calculator-page-data';
import { BATTERY_FIELDS, CALCULATOR_PATHS, runCalculator } from '@/lib/calculators';

export const metadata = calculatorMetadata('battery');

export default async function BatteryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { settings, get, parsed, content, path } = await loadCalculatorPage(
    'battery',
    await searchParams,
  );
  const run = runCalculator('battery', parsed.values, settings);
  if (run.kind !== 'battery') return null;
  const r = run.result;
  const i = run.input;

  return (
    <CalculatorPage
      {...content}
      path={path}
      settings={settings}
      save={{ kind: 'battery', values: saveValues(parsed.values) }}
      form={
        <CalcForm action={path}>
          <NumberFields fields={BATTERY_FIELDS} parsed={parsed} raw={get} className="grid gap-3" />
        </CalcForm>
      }
      results={
        <>
          <InputErrors parsed={parsed} />
          {r.neededKwh === 0 ? (
            <WarningBanner title="Add the loads to keep on">
              Enter the watts and hours you want covered in a brownout.
            </WarningBanner>
          ) : (
            <ResultCard
              highlight
              value={
                <span data-testid="nominalKwh" data-value={r.nominalKwh ?? ''}>
                  {r.nominalKwh === null ? '–' : `${formatNumber(r.nominalKwh, 1)} kWh battery`}
                </span>
              }
              label={`Gives ${formatNumber(r.neededKwh, 1)} kWh of usable energy`}
              explanation={`Pair it with a hybrid inverter of at least ${formatNumber(r.hybridInverterMinKw, 1)} kW so everything can run at once.`}
            />
          )}
          <dl className="rounded-[10px] border border-line bg-surface px-3">
            <Stat
              label="Energy needed"
              value={`${formatNumber(r.neededKwh, 2)} kWh`}
              raw={r.neededKwh}
              testId="neededKwh"
            />
            <Stat
              label="Battery size (nameplate)"
              value={r.nominalKwh === null ? '–' : `${formatNumber(r.nominalKwh, 2)} kWh`}
              raw={r.nominalKwh}
              testId="nominalKwhStat"
            />
            <Stat
              label="Hybrid inverter, at least"
              value={`${formatNumber(r.hybridInverterMinKw, 2)} kW`}
              raw={r.hybridInverterMinKw}
              testId="hybridInverterMinKw"
            />
          </dl>
        </>
      }
      nextStep={
        <p>
          Not sure what your appliances use? Add them up in{' '}
          <Link
            className="font-bold underline underline-offset-4"
            href={CALCULATOR_PATHS.appliances}
          >
            what can solar run
          </Link>
          . Then ask companies for a hybrid quote.
        </p>
      }
      assumptions={
        <ul className="list-disc pl-5">
          <li>
            Energy = essential load × hours + aircon × aircon hours (
            {formatNumber(i.essentialLoadW)} W × {formatNumber(i.backupHours, 1)} h +{' '}
            {formatNumber(i.aircondW)} W × {formatNumber(i.aircondHours, 1)} h).
          </li>
          <li>
            Battery = energy ÷ usable share ({i.depthOfDischargePct}%) ÷ inverter efficiency (
            {i.inverterEfficiencyPct}%).
          </li>
          <li>Hybrid inverter = everything at once plus 25% margin.</li>
          <li>
            Batteries lose some capacity as they age; ask about the warranty in kWh or cycles.
          </li>
        </ul>
      }
    />
  );
}
