import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

const buttonStyles: Record<ButtonVariant, string> = {
  primary: 'bg-sun text-sun-ink hover:brightness-95',
  secondary: 'border border-line bg-surface text-ink hover:border-sun',
  ghost: 'text-ink hover:bg-sunken',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
}

/** One primary button per screen. Minimum 48 px tall. */
export function Button({
  variant = 'primary',
  loading,
  fullWidth,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] px-4 font-bold transition',
        'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sun',
        'disabled:cursor-not-allowed disabled:opacity-60',
        buttonStyles[variant],
        fullWidth && 'w-full',
        className,
      )}
    >
      {loading ? (
        <span
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden
        />
      ) : null}
      {children}
    </button>
  );
}

export function Card({
  className,
  children,
  as: As = 'div',
}: {
  className?: string;
  children: ReactNode;
  as?: 'div' | 'section' | 'article' | 'li';
}) {
  return (
    <As className={cn('rounded-[10px] border border-line bg-surface p-4', className)}>
      {children}
    </As>
  );
}

type Tone = 'neutral' | 'good' | 'warn' | 'bad' | 'sun';

const toneStyles: Record<Tone, string> = {
  neutral: 'bg-sunken text-muted',
  good: 'bg-good-soft text-good',
  warn: 'bg-warn-soft text-warn',
  bad: 'bg-bad-soft text-bad',
  sun: 'bg-sun-soft text-sun-text',
};

/** Small status label. Always carries a word, so colour is never the only signal. */
export function Chip({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold',
        toneStyles[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export type BadgeKind = 'verified' | 'pro' | 'sold-by-vserve' | 'sponsored';

const badgeText: Record<BadgeKind, string> = {
  verified: 'Verified',
  pro: 'Pro',
  'sold-by-vserve': 'Sold by VServe',
  sponsored: 'Sponsored',
};

const badgeTone: Record<BadgeKind, Tone> = {
  verified: 'good',
  pro: 'good',
  'sold-by-vserve': 'sun',
  sponsored: 'neutral',
};

export function Badge({ kind }: { kind: BadgeKind }) {
  return <Chip tone={badgeTone[kind]}>{badgeText[kind]}</Chip>;
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-sunken motion-reduce:animate-none', className)}
      aria-hidden
    />
  );
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      className="h-2 overflow-hidden rounded-full bg-line"
    >
      <div className="h-full rounded-full bg-sun" style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Big number, what it means, and where it came from. */
export function ResultCard({
  value,
  label,
  explanation,
  highlight,
}: {
  value: ReactNode;
  label: string;
  explanation?: ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-[10px] border p-3',
        highlight ? 'border-sun bg-sun-soft' : 'border-line bg-surface',
      )}
    >
      <div
        className={cn(
          'font-display font-extrabold tabular-nums leading-tight',
          highlight ? 'text-3xl' : 'text-xl',
        )}
      >
        {value}
      </div>
      <div className="text-sm text-muted">{label}</div>
      {explanation ? <p className="mt-1 text-sm">{explanation}</p> : null}
    </div>
  );
}

export function KpiGrid({ children, columns = 2 }: { children: ReactNode; columns?: 2 | 3 | 4 }) {
  const cols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
  }[columns];
  return <div className={cn('grid gap-2', cols)}>{children}</div>;
}

export function KeyValue({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid gap-1.5">
      {items.map((it) => (
        <div key={it.label} className="flex justify-between gap-3 text-sm">
          <dt className="text-muted">{it.label}</dt>
          <dd className="font-bold tabular-nums">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function WarningBanner({
  tone = 'warn',
  title,
  children,
}: {
  tone?: 'warn' | 'bad' | 'good';
  title: string;
  children?: ReactNode;
}) {
  return (
    <div
      role={tone === 'bad' ? 'alert' : 'status'}
      className={cn('rounded-lg px-3 py-2 text-sm', toneStyles[tone])}
    >
      <strong>{title}</strong>
      {children ? <div className="mt-0.5">{children}</div> : null}
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-[10px] border border-dashed border-line bg-surface p-6">
      <h2 className="font-display text-lg font-bold">{title}</h2>
      <p className="max-w-prose text-muted">{body}</p>
      {action}
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  body,
  action,
}: {
  title?: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-2 rounded-[10px] border border-bad bg-bad-soft p-6 text-ink"
    >
      <h2 className="font-display text-lg font-bold">{title}</h2>
      <p className="max-w-prose">{body}</p>
      {action}
    </div>
  );
}
