import { formatNumber, formatPhp, ResultCard, WarningBanner } from '@vserve/ui';
import { CalcForm } from '@/components/calculator/calc-form';
import { CalculatorPage, saveValues, Stat } from '@/components/calculator/calculator-page';
import { InputErrors, NumberFields } from '@/components/calculator/fields';
import {
  calculatorMetadata,
  loadCalculatorPage,
  type SearchParams,
} from '@/lib/calculator-page-data';
import { LOAN_FIELDS, runCalculator } from '@/lib/calculators';

export const metadata = calculatorMetadata('loan');

function monthText(m: number) {
  const y = Math.floor((m - 1) / 12);
  const mm = ((m - 1) % 12) + 1;
  return y === 0 ? `month ${m}` : `month ${m} (year ${y + 1}, month ${mm})`;
}

export default async function LoanVsSavingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { settings, get, parsed, content, path } = await loadCalculatorPage(
    'loan',
    await searchParams,
  );
  const run = runCalculator('loan', parsed.values, settings);
  if (run.kind !== 'loan') return null;
  const r = run.result;
  const i = run.input;
  const covers = r.monthlyCashFlow >= 0;

  return (
    <CalculatorPage
      {...content}
      path={path}
      settings={settings}
      save={{ kind: 'loan', values: saveValues(parsed.values) }}
      form={
        <CalcForm action={path}>
          <NumberFields fields={LOAN_FIELDS} parsed={parsed} raw={get} className="grid gap-3" />
        </CalcForm>
      }
      results={
        <>
          <InputErrors parsed={parsed} />
          {i.downPaymentPhp > i.pricePhp ? (
            <WarningBanner title="Down payment is more than the price">
              Nothing is borrowed. Lower the down payment to compare a loan.
            </WarningBanner>
          ) : null}
          <ResultCard
            highlight
            value={
              <span data-testid="monthlyPayment" data-value={r.monthlyPayment}>
                {formatPhp(r.monthlyPayment)} a month
              </span>
            }
            label={`Loan payment for ${formatNumber(i.termYears)} years`}
            explanation={
              covers
                ? `Your savings of ${formatPhp(i.monthlySavingsPhp)} cover it, leaving ${formatPhp(r.monthlyCashFlow)} a month.`
                : `Your savings of ${formatPhp(i.monthlySavingsPhp)} fall ${formatPhp(-r.monthlyCashFlow)} short each month until the loan ends.`
            }
          />
          <dl className="rounded-[10px] border border-line bg-surface px-3">
            <Stat
              label={covers ? 'Left over each month' : 'Short each month'}
              value={formatPhp(Math.abs(r.monthlyCashFlow))}
              raw={r.monthlyCashFlow}
              testId="monthlyCashFlow"
            />
            <Stat
              label="Total interest"
              value={formatPhp(r.totalInterest)}
              raw={r.totalInterest}
              testId="totalInterest"
            />
            <Stat
              label="Break-even"
              value={
                r.breakEvenMonth === null ? 'Not within 25 years' : monthText(r.breakEvenMonth)
              }
              raw={r.breakEvenMonth}
              testId="breakEvenMonth"
            />
            <Stat
              label="Net gain over 25 years"
              value={formatPhp(r.netGain25y)}
              raw={r.netGain25y}
              testId="netGain25y"
            />
          </dl>
        </>
      }
      nextStep={
        <p>
          Ask lenders for their yearly rate, fees and terms in writing. Indicative offers, each with
          the date we checked it, will appear in Financing.
        </p>
      }
      assumptions={
        <ul className="list-disc pl-5">
          <li>Fixed-rate loan with equal monthly payments; fees not included.</li>
          <li>
            Savings start at {formatPhp(i.monthlySavingsPhp)} a month and rise {i.escalationPct}% a
            year.
          </li>
          <li>Break-even and net gain count 25 years (300 months).</li>
          <li>The rate is the one you enter. VServe does not set or suggest lender rates.</li>
        </ul>
      }
    />
  );
}
