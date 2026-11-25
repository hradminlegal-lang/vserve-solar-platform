import { NumberInput } from '@vserve/ui';
import type { NumField, Parsed } from '@/lib/calculators';
import { RangeField } from './calc-form';

/** Number inputs for a list of calculator fields, showing the value the result was computed with. */
export function NumberFields({
  fields,
  parsed,
  raw,
  className = 'grid gap-3 sm:grid-cols-2',
}: {
  fields: NumField[];
  parsed: Parsed;
  /** What the customer typed, so an invalid entry stays visible next to its error. */
  raw: (key: string) => string | undefined;
  className?: string;
}) {
  return (
    <div className={className}>
      {fields.map((f) => {
        const error = parsed.errors[f.key];
        return (
          <NumberInput
            key={f.key}
            name={f.key}
            label={f.label}
            unit={f.unit}
            help={f.help}
            error={error}
            min={f.min}
            max={f.max}
            step="any"
            defaultValue={error ? raw(f.key) : parsed.values[f.key]}
          />
        );
      })}
    </div>
  );
}

export function RangeFields({ fields, parsed }: { fields: NumField[]; parsed: Parsed }) {
  return (
    <div className="flex flex-col gap-2">
      {fields.map((f) => (
        <RangeField
          key={f.key}
          name={f.key}
          label={f.label}
          unit={f.unit}
          min={f.min}
          max={f.max}
          step={f.step}
          defaultValue={parsed.values[f.key] ?? f.min}
        />
      ))}
    </div>
  );
}

/** Lists input errors at the top of the results so they are not missed. */
export function InputErrors({ parsed }: { parsed: Parsed }) {
  const n = Object.keys(parsed.errors).length;
  if (n === 0) return null;
  return (
    <p role="alert" className="rounded-lg bg-bad-soft px-3 py-2 text-sm">
      <strong>{n === 1 ? 'One value needs fixing.' : `${n} values need fixing.`}</strong> Results
      below use the example value for {n === 1 ? 'it' : 'them'}.
    </p>
  );
}
