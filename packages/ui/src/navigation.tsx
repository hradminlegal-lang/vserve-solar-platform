import type { ComponentType, ReactNode } from 'react';
import { cn } from './cn';

/** A link component, e.g. next/link. Kept as a prop so this package does not depend on Next.js. */
export type LinkLike = ComponentType<{
  href: string;
  className?: string;
  children: ReactNode;
  'aria-current'?: 'page';
}>;

export interface NavItem {
  href: string;
  label: string;
  icon?: ReactNode;
}

export function TopBar({
  title,
  back,
  actions,
  LinkAs,
}: {
  title: string;
  back?: string;
  actions?: ReactNode;
  LinkAs: LinkLike;
}) {
  return (
    <header className="sticky top-0 z-20 flex min-h-14 items-center gap-3 border-b border-line bg-surface px-4">
      {back ? (
        <LinkAs
          href={back}
          className="-ml-2 inline-flex min-h-12 min-w-12 items-center justify-center rounded-lg hover:bg-sunken"
        >
          <span aria-hidden>←</span>
          <span className="sr-only">Back</span>
        </LinkAs>
      ) : null}
      <h1 className="font-display text-lg font-bold">{title}</h1>
      {actions ? <div className="ml-auto flex items-center gap-2">{actions}</div> : null}
    </header>
  );
}

/** Phone navigation: five tabs fixed to the bottom. Hidden from 1024 px, where the top nav takes over. */
export function BottomTabBar({
  items,
  activeHref,
  LinkAs,
  label,
}: {
  items: NavItem[];
  activeHref: string;
  LinkAs: LinkLike;
  label: string;
}) {
  return (
    <nav
      aria-label={label}
      className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul
        className="grid"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((it) => {
          const active = it.href === activeHref;
          return (
            <li key={it.href}>
              <LinkAs
                href={it.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs',
                  active ? 'font-bold text-sun-text' : 'text-muted',
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'block size-1.5 rounded-full',
                    active ? 'bg-sun' : 'bg-transparent',
                  )}
                />
                {it.label}
              </LinkAs>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Desktop navigation as a row of links. */
export function TopNav({
  items,
  activeHref,
  LinkAs,
  label,
  tone = 'light',
}: {
  items: NavItem[];
  activeHref: string;
  LinkAs: LinkLike;
  label: string;
  tone?: 'light' | 'navy';
}) {
  return (
    <nav aria-label={label}>
      <ul className="flex flex-wrap gap-1">
        {items.map((it) => {
          const active = it.href === activeHref;
          return (
            <li key={it.href}>
              <LinkAs
                href={it.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'inline-flex min-h-11 items-center rounded-full px-3 text-sm',
                  tone === 'navy'
                    ? active
                      ? 'bg-sun font-bold text-sun-ink'
                      : 'text-navy-muted hover:text-navy-ink'
                    : active
                      ? 'bg-sun-soft font-bold text-ink'
                      : 'text-muted hover:bg-sunken hover:text-ink',
                )}
              >
                {it.label}
              </LinkAs>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Wizard progress: "Step 2 of 4" plus a labelled list of steps. */
export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div>
      <p className="text-sm text-muted">
        Step {current + 1} of {steps.length}: <strong className="text-ink">{steps[current]}</strong>
      </p>
      <ol className="mt-2 flex gap-1" aria-label="Steps">
        {steps.map((s, i) => (
          <li key={s} className="flex-1" aria-current={i === current ? 'step' : undefined}>
            <span className={cn('block h-1.5 rounded-full', i <= current ? 'bg-sun' : 'bg-line')} />
            <span className="sr-only">
              {s}
              {i < current ? ' (done)' : i === current ? ' (current)' : ''}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
