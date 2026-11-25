'use client';

import { useId, useState, type ReactNode } from 'react';
import { cn } from './cn';
import { formatCentavos } from './format';

/** Money in a table cell: right-aligned, tabular figures, from integer centavos. */
export function MoneyCell({ centavos }: { centavos: number | bigint }) {
  return <span className="tabular-nums">{formatCentavos(centavos)}</span>;
}

export interface Column<Row> {
  key: string;
  header: string;
  render: (row: Row) => ReactNode;
  sortValue?: (row: Row) => number | string;
  align?: 'left' | 'right';
}

/** Sortable table with a sticky header. Scrolls inside its own box on narrow screens. */
export function DataTable<Row>({
  rows,
  columns,
  rowKey,
  caption,
}: {
  rows: Row[];
  columns: Column<Row>[];
  rowKey: (r: Row) => string;
  caption: string;
}) {
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);
  const col = sort ? columns.find((c) => c.key === sort.key) : undefined;
  const sorted =
    col?.sortValue && sort
      ? [...rows].sort((a, b) => {
          const x = col.sortValue!(a);
          const y = col.sortValue!(b);
          return (x < y ? -1 : x > y ? 1 : 0) * sort.dir;
        })
      : rows;
  return (
    <div className="max-h-[70vh] overflow-auto rounded-[10px] border border-line bg-surface">
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="sticky top-0 bg-sunken">
          <tr>
            {columns.map((c) => {
              const active = sort?.key === c.key;
              return (
                <th
                  key={c.key}
                  scope="col"
                  aria-sort={active ? (sort!.dir === 1 ? 'ascending' : 'descending') : undefined}
                  className={cn(
                    'px-3 py-2 text-xs font-bold uppercase text-muted',
                    c.align === 'right' ? 'text-right' : 'text-left',
                  )}
                >
                  {c.sortValue ? (
                    <button
                      type="button"
                      className="min-h-11 uppercase"
                      onClick={() =>
                        setSort(
                          active
                            ? { key: c.key, dir: sort!.dir === 1 ? -1 : 1 }
                            : { key: c.key, dir: 1 },
                        )
                      }
                    >
                      {c.header}
                      <span aria-hidden> {active ? (sort!.dir === 1 ? '▲' : '▼') : '↕'}</span>
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={rowKey(r)} className="border-t border-line">
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={cn('px-3 py-2.5', c.align === 'right' && 'text-right tabular-nums')}
                >
                  {c.render(r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export interface KanbanColumn {
  id: string;
  title: string;
}

export interface KanbanCard {
  id: string;
  columnId: string;
  title: string;
  content?: ReactNode;
  overdue?: boolean;
}

/**
 * Board with drag and drop, plus a "Move to" menu on every card so it works by keyboard
 * and screen reader. `onMove` should call the server; stage rules are checked there.
 */
export function KanbanBoard({
  columns,
  cards,
  onMove,
  label,
}: {
  columns: KanbanColumn[];
  cards: KanbanCard[];
  onMove: (cardId: string, toColumnId: string) => void;
  label: string;
}) {
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  return (
    <div role="region" aria-label={label} className="overflow-x-auto pb-2">
      <div className="grid auto-cols-[minmax(176px,1fr)] grid-flow-col gap-3">
        {columns.map((col) => {
          const colCards = cards.filter((c) => c.columnId === col.id);
          return (
            <section
              key={col.id}
              aria-labelledby={`col-${col.id}`}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(col.id);
              }}
              onDragLeave={() => setOver(null)}
              onDrop={() => {
                if (dragging) onMove(dragging, col.id);
                setDragging(null);
                setOver(null);
              }}
              className={cn(
                'flex flex-col gap-2 rounded-[10px] bg-sunken p-2',
                over === col.id && 'outline-2 outline-sun',
              )}
            >
              <h3 id={`col-${col.id}`} className="flex justify-between px-1 text-sm font-bold">
                {col.title}
                <span className="font-normal text-muted">{colCards.length}</span>
              </h3>
              <ul className="flex flex-col gap-2">
                {colCards.map((card) => (
                  <KanbanCardView
                    key={card.id}
                    card={card}
                    columns={columns}
                    onMove={onMove}
                    onDragStart={() => setDragging(card.id)}
                  />
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function KanbanCardView({
  card,
  columns,
  onMove,
  onDragStart,
}: {
  card: KanbanCard;
  columns: KanbanColumn[];
  onMove: (id: string, to: string) => void;
  onDragStart: () => void;
}) {
  const id = useId();
  return (
    <li
      draggable
      onDragStart={onDragStart}
      className={cn(
        'rounded-lg border bg-surface p-2.5',
        card.overdue ? 'border-bad' : 'border-line',
      )}
    >
      <p className="font-bold">{card.title}</p>
      {card.content ? (
        <div className="mt-1 flex flex-col gap-1 text-xs text-muted">{card.content}</div>
      ) : null}
      <label htmlFor={id} className="sr-only">
        Move {card.title} to
      </label>
      <select
        id={id}
        value={card.columnId}
        onChange={(e) => onMove(card.id, e.target.value)}
        className="mt-2 min-h-11 w-full rounded-md border border-line bg-bg px-2 text-xs text-ink"
      >
        {columns.map((c) => (
          <option key={c.id} value={c.id}>
            {c.id === card.columnId ? `Stage: ${c.title}` : `Move to ${c.title}`}
          </option>
        ))}
      </select>
    </li>
  );
}

/** Tabs with arrow-key navigation (WAI-ARIA tabs pattern). */
export function Tabs({
  tabs,
  label,
}: {
  tabs: { id: string; label: string; content: ReactNode }[];
  label: string;
}) {
  const [active, setActive] = useState(tabs[0]?.id ?? '');
  const base = useId();
  return (
    <div>
      <div role="tablist" aria-label={label} className="flex gap-1 border-b border-line">
        {tabs.map((t, i) => (
          <button
            key={t.id}
            id={`${base}-tab-${t.id}`}
            role="tab"
            type="button"
            aria-selected={active === t.id}
            aria-controls={`${base}-panel-${t.id}`}
            tabIndex={active === t.id ? 0 : -1}
            onClick={() => setActive(t.id)}
            onKeyDown={(e) => {
              if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
              const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
              if (next) {
                setActive(next.id);
                document.getElementById(`${base}-tab-${next.id}`)?.focus();
              }
            }}
            className={cn(
              'min-h-12 border-b-2 px-3 text-sm',
              active === t.id ? 'border-sun font-bold' : 'border-transparent text-muted',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <div
          key={t.id}
          id={`${base}-panel-${t.id}`}
          role="tabpanel"
          aria-labelledby={`${base}-tab-${t.id}`}
          hidden={active !== t.id}
          className="pt-3"
        >
          {t.content}
        </div>
      ))}
    </div>
  );
}

/** Panel that slides in from the right on desktop and covers the screen on phones. */
export function SidePanel({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <aside
      aria-label={title}
      className="fixed inset-y-0 right-0 z-30 flex w-full flex-col border-l border-line bg-surface shadow-xl sm:w-[420px]"
    >
      <div className="flex items-center justify-between border-b border-line px-4 py-2">
        <h2 className="font-display text-lg font-bold">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="min-h-12 min-w-12 font-bold"
          aria-label="Close panel"
        >
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4">{children}</div>
    </aside>
  );
}
