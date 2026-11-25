import { Checkbox, formatNumber, formatPhp, ResultCard, WarningBanner } from '@vserve/ui';
import Link from 'next/link';
import { CalcForm } from '@/components/calculator/calc-form';
import { CalculatorPage, saveValues, Stat } from '@/components/calculator/calculator-page';
import { InputErrors, NumberFields } from '@/components/calculator/fields';
import {
  calculatorMetadata,
  loadCalculatorPage,
  type SearchParams,
} from '@/lib/calculator-page-data';
import {
  CALCULATOR_PATHS,
  parseQuoteDocs,
  QUOTE_DEFAULT_DOCS,
  QUOTE_DOC_ITEMS,
  QUOTE_FIELDS,
  runCalculator,
} from '@/lib/calculators';

export const metadata = calculatorMetadata('quote');

const PRICE_TEXT = {
  below_range: 'Below the typical range. Check what is left out.',
  in_range: 'Inside the typical range.',
  above_range: 'Above the typical range. Ask what justifies it.',
} as const;
const SIZE_TEXT = {
  undersized: 'Small for your usage.',
  fits: 'Fits your usage.',
  oversized: 'Large for your usage; much of it would be exported.',
} as const;
const CLAIM_TEXT = {
  plausible: 'Realistic.',
  too_high: 'Higher than we would expect. Ask how it was worked out.',
  too_low: 'Lower than we would expect for this size.',
} as const;

export default async function QuoteCheckerPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { settings, get, parsed, content, path } = await loadCalculatorPage(
    'quote',
    await searchParams,
  );
  const docs = parseQuoteDocs(get, parsed.submitted, QUOTE_DEFAULT_DOCS);
  const run = runCalculator('quote', parsed.values, settings, docs);
  if (run.kind !== 'quote') return null;
  const r = run.result;
  const c = settings.config;
  const missing = QUOTE_DOC_ITEMS.filter((_, i) => !docs[i]);

  return (
    <CalculatorPage
      {...content}
      path={path}
      settings={settings}
      save={{
        kind: 'quote',
        values: saveValues(
          parsed.values,
          Object.fromEntries(docs.flatMap((on, i) => (on ? [[`d${i}`, 'on']] : []))),
        ),
      }}
      form={
        <CalcForm action={path}>
          <NumberFields fields={QUOTE_FIELDS} parsed={parsed} raw={get} className="grid gap-3" />
          <fieldset className="rounded-lg border border-line p-2">
            <legend className="px-1 font-bold">What the quote puts in writing</legend>
            {QUOTE_DOC_ITEMS.map((label, i) => (
              <Checkbox key={label} name={`d${i}`} label={label} defaultChecked={docs[i]} />
            ))}
          </fieldset>
        </CalcForm>
      }
      results={
        <>
          <InputErrors parsed={parsed} />
          <ResultCard
            highlight
            value={
              <span data-testid="score" data-value={r.score}>
                {r.score} out of 100
              </span>
            }
            label="Quote score: price 40, sizing 25, production claim 15, documents 20"
            explanation={`${formatPhp(r.perKwp)} per kWp without the battery. ${PRICE_TEXT[r.priceFlag]}`}
          />
          <dl className="rounded-[10px] border border-line bg-surface px-3">
            <Stat
              label="Price per kWp"
              value={formatPhp(r.perKwp)}
              raw={r.perKwp}
              testId="perKwp"
            />
            <Stat
              label="Price check"
              value={PRICE_TEXT[r.priceFlag]}
              raw={null}
              testId="priceFlag"
            />
            <Stat
              label="Expected production"
              value={`${formatNumber(r.expectedKwh)} kWh a month`}
              raw={r.expectedKwh}
              testId="expectedKwh"
            />
            <Stat
              label="Size vs your usage"
              value={`${formatNumber(r.sizeRatio * 100)}% · ${SIZE_TEXT[r.sizeFlag]}`}
              raw={r.sizeRatio}
              testId="sizeRatio"
            />
            <Stat
              label="Production promised"
              value={`${formatNumber(r.claimRatio * 100)}% of expected · ${CLAIM_TEXT[r.claimFlag]}`}
              raw={r.claimRatio}
              testId="claimRatio"
            />
            <Stat
              label="Items in writing"
              value={`${run.input.itemsInWriting} of 12`}
              raw={run.input.itemsInWriting}
              testId="itemsInWriting"
            />
          </dl>
          {missing.length > 0 ? (
            <WarningBanner title="Ask the company to put these in writing">
              <ul className="list-disc pl-5">
                {missing.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </WarningBanner>
          ) : null}
        </>
      }
      nextStep={
        <p>
          Compare quotes side by side with the same checks, then see the 25-year picture in the{' '}
          <Link
            className="font-bold underline underline-offset-4"
            href={`${CALCULATOR_PATHS.savings}?cost=${run.input.totalPricePhp}&kwh=${Math.round(run.input.claimedKwhMonth * 12)}`}
          >
            savings calculator
          </Link>
          .
        </p>
      }
      assumptions={
        <ul className="list-disc pl-5">
          <li>
            Typical installed price {formatPhp(c.priceLowPerKwp)}–{formatPhp(c.priceHighPerKwp)} per
            kWp, grid-tied, battery excluded.
          </li>
          <li>
            Expected production: kWp × {formatNumber(c.yieldKwhPerKwpDay, 1)} kWh per kWp per day ×{' '}
            {c.daysPerMonth} days. Claims within 10% count as realistic.
          </li>
          <li>Sizing fits when expected production is 80–130% of your usage.</li>
          <li>The 12 written items follow the standard quote format.</li>
        </ul>
      }
    />
  );
}
