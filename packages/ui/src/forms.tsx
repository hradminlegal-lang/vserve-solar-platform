'use client';

import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react';
import { cn } from './cn';

const control =
  'min-h-12 w-full min-w-0 rounded-lg border border-line bg-bg px-3 text-base text-ink tabular-nums focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-sun aria-[invalid=true]:border-bad';

interface FieldProps {
  label: string;
  help?: string;
  error?: string;
  children: (ids: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode;
}

/** Label, control, help text and error message, wired together for screen readers. */
export function Field({ label, help, error, children }: FieldProps) {
  const id = useId();
  const helpId = help ? `${id}-help` : undefined;
  const errId = error ? `${id}-err` : undefined;
  const describedBy = [helpId, errId].filter(Boolean).join(' ') || undefined;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm text-muted">
        {label}
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {help ? (
        <p id={helpId} className="text-xs text-muted">
          {help}
        </p>
      ) : null}
      {error ? (
        <p id={errId} className="text-xs font-bold text-bad">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  help?: string;
  error?: string;
}

export function Input({ label, help, error, className, ...rest }: InputProps) {
  return (
    <Field label={label} help={help} error={error}>
      {({ id, describedBy, invalid }) => (
        <input
          id={id}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          className={cn(control, className)}
          {...rest}
        />
      )}
    </Field>
  );
}

export interface NumberInputProps extends Omit<InputProps, 'type'> {
  /** Unit shown after the value, e.g. "₱", "kWh", "kWp", "%". */
  unit?: string;
}

/** Numeric input with a unit suffix and a decimal keypad on phones. */
export function NumberInput({ label, help, error, unit, className, ...rest }: NumberInputProps) {
  return (
    <Field label={unit ? `${label} (${unit})` : label} help={help} error={error}>
      {({ id, describedBy, invalid }) => (
        <div className="relative">
          <input
            id={id}
            type="number"
            inputMode="decimal"
            aria-describedby={describedBy}
            aria-invalid={invalid}
            className={cn(control, unit && 'pr-14', className)}
            {...rest}
          />
          {unit ? (
            <span
              className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted"
              aria-hidden
            >
              {unit}
            </span>
          ) : null}
        </div>
      )}
    </Field>
  );
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  label: string;
  help?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, help, error, options, className, ...rest }: SelectProps) {
  return (
    <Field label={label} help={help} error={error}>
      {({ id, describedBy, invalid }) => (
        <select
          id={id}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          className={cn(control, className)}
          {...rest}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}

export function Checkbox({
  label,
  ...rest
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { label: string }) {
  const id = useId();
  return (
    <div className="flex min-h-12 items-center gap-3">
      <input id={id} type="checkbox" className="size-5 accent-[var(--vs-sun)]" {...rest} />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}
