'use client';

import { Button } from '@vserve/ui';
import Form from 'next/form';
import { useSearchParams } from 'next/navigation';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

/**
 * A GET form: the server page reads the values from the URL and computes the results, so no
 * calculation runs in the browser. With JavaScript, sliders and checkboxes update the results as
 * they change; without it, the "Show results" button does the same with a full page load.
 */
export function CalcForm({ action, children }: { action: string; children: ReactNode }) {
  const ref = useRef<HTMLFormElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const query = useSearchParams().toString();
  const [pending, setPending] = useState(false);
  // New results have arrived when the URL changes.
  useEffect(() => setPending(false), [query]);
  return (
    <Form
      ref={ref}
      action={action}
      replace
      scroll={false}
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        const data = new FormData(e.currentTarget);
        const next = new URLSearchParams(
          [...data.entries()].map(([k, v]) => [k, String(v)] as [string, string]),
        ).toString();
        if (next !== query) setPending(true);
      }}
      onChange={(e) => {
        const t = e.target as HTMLInputElement;
        if (t.type !== 'range' && t.type !== 'checkbox') return;
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => ref.current?.requestSubmit(), 250);
      }}
    >
      {children}
      <Button type="submit" fullWidth loading={pending}>
        Show results
      </Button>
      <p role="status" className="sr-only">
        {pending ? 'Updating results' : ''}
      </p>
    </Form>
  );
}

/** Slider with its current value shown next to the label. */
export function RangeField({
  name,
  label,
  unit,
  min,
  max,
  step,
  defaultValue,
}: {
  name: string;
  label: string;
  unit?: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
}) {
  const id = useId();
  const [value, setValue] = useState(defaultValue);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm text-muted">
          {label}
        </label>
        <output htmlFor={id} className="font-bold tabular-nums">
          {value}
          {unit ?? ''}
        </output>
      </div>
      <input
        id={id}
        name={name}
        type="range"
        min={min}
        max={max}
        step={step}
        defaultValue={defaultValue}
        onInput={(e) => setValue(Number((e.target as HTMLInputElement).value))}
        className="h-12 w-full accent-[var(--vs-sun)]"
      />
    </div>
  );
}
