'use client';

import {
  Badge,
  Button,
  Card,
  Checkbox,
  Chip,
  DataTable,
  EmptyState,
  ErrorState,
  Input,
  KanbanBoard,
  KeyValue,
  KpiGrid,
  MoneyCell,
  NumberInput,
  ProgressBar,
  ResultCard,
  Select,
  Sheet,
  SidePanel,
  Skeleton,
  Stepper,
  Tabs,
  useToast,
  WarningBanner,
  type KanbanCard,
} from '@vserve/ui';
import { useState, type ReactNode } from 'react';

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 border-t border-line pt-4">
      <h2 className="font-display text-xl font-bold">{title}</h2>
      {children}
    </section>
  );
}

const rows = [
  { id: 'a', item: '600 W panel', qty: 9, price: 6685700 },
  { id: 'b', item: '5 kW inverter', qty: 1, price: 7428600 },
  { id: 'c', item: 'Rails and clamps', qty: 9, price: 3085700 },
];

export function Gallery() {
  const toast = useToast();
  const [sheet, setSheet] = useState(false);
  const [panel, setPanel] = useState(false);
  const [cards, setCards] = useState<KanbanCard[]>([
    { id: 'k1', columnId: 'new', title: 'R. Santos' },
    { id: 'k2', columnId: 'won', title: 'G. Aquino', overdue: true },
  ]);

  return (
    <main id="main" className="mx-auto flex max-w-[1120px] flex-col gap-6 p-4">
      <h1 className="font-display text-3xl font-extrabold">Component gallery</h1>

      <Block title="Buttons">
        <div className="flex flex-wrap gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button loading>Saving</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Block>

      <Block title="Chips and badges">
        <div className="flex flex-wrap gap-2">
          <Chip>Neutral</Chip>
          <Chip tone="good">In range</Chip>
          <Chip tone="warn">Above range</Chip>
          <Chip tone="bad">Overdue</Chip>
          <Chip tone="sun">Hot</Chip>
          <Badge kind="verified" />
          <Badge kind="pro" />
          <Badge kind="sold-by-vserve" />
          <Badge kind="sponsored" />
        </div>
      </Block>

      <Block title="Form controls">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Full name" placeholder="Ana Reyes" autoComplete="name" />
          <Input
            label="Mobile number"
            help="Philippine number, e.g. 0917 123 4567"
            inputMode="tel"
          />
          <NumberInput label="Monthly bill" unit="₱" defaultValue={6000} />
          <NumberInput
            label="System size"
            unit="kWp"
            error="Enter a size above 0"
            defaultValue={0}
          />
          <Select
            label="Roof type"
            options={[
              { value: 'metal', label: 'Metal (corrugated)' },
              { value: 'tile', label: 'Tile' },
              { value: 'flat', label: 'Flat concrete' },
            ]}
          />
          <Checkbox label="I agree to the privacy notice" />
        </div>
      </Block>

      <Block title="Results">
        <ResultCard
          highlight
          value="5.4 kWp"
          label="Recommended system size"
          explanation="9 panels of 600 W, about 23 m² of roof."
        />
        <KpiGrid columns={4}>
          <ResultCard value="₱84,670" label="Savings in year 1" />
          <ResultCard value="3.5 yrs" label="Payback" />
          <ResultCard value="29% a year" label="Return" />
          <ResultCard value="₱4.72" label="Cost per kWh" />
        </KpiGrid>
        <ProgressBar value={60} label="Profile 60% complete" />
        <KeyValue
          items={[
            { label: 'Panels', value: '9' },
            { label: 'Inverter', value: '5 kW · ratio 1.08' },
          ]}
        />
        <WarningBanner title="Water tank shades 2 panels">Between 7 and 9 AM.</WarningBanner>
        <WarningBanner tone="bad" title="Current too high">
          Choose a different inverter.
        </WarningBanner>
        <WarningBanner tone="good" title="In the ₱50k–70k per kWp range" />
      </Block>

      <Block title="States">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex flex-col gap-2" role="group" aria-label="Loading example">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-16" />
          </div>
          <EmptyState
            title="No leads yet"
            body="Share your landing page to get your first lead."
            action={<Button variant="secondary">Copy link</Button>}
          />
          <ErrorState
            body="We couldn't load your leads. Check your connection."
            action={<Button>Try again</Button>}
          />
        </div>
      </Block>

      <Block title="Navigation">
        <Stepper steps={['Usage', 'Location', 'Roof', 'Needs']} current={1} />
        <Tabs
          label="Example tabs"
          tabs={[
            { id: 'a', label: 'Roof', content: <p>Roof planes</p> },
            { id: 'b', label: 'Layout', content: <p>Panel layout</p> },
            { id: 'c', label: 'Energy', content: <p>Monthly energy</p> },
          ]}
        />
      </Block>

      <Block title="Overlays">
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setSheet(true)}>
            Open sheet
          </Button>
          <Button variant="secondary" onClick={() => setPanel(true)}>
            Open side panel
          </Button>
          <Button variant="secondary" onClick={() => toast('Saved', 'good')}>
            Show toast
          </Button>
          <Button variant="secondary" onClick={() => toast("Couldn't save. Try again.", 'bad')}>
            Show error toast
          </Button>
        </div>
        <Sheet open={sheet} onClose={() => setSheet(false)} title="Why this order?">
          <p>Companies are ordered by verification level, rating, response time and distance.</p>
        </Sheet>
        <SidePanel open={panel} onClose={() => setPanel(false)} title="Lead details">
          <p>R. Santos · Bacoor</p>
        </SidePanel>
      </Block>

      <Block title="Workspace">
        <DataTable
          caption="Bill of materials"
          rows={rows}
          rowKey={(r) => r.id}
          columns={[
            { key: 'item', header: 'Item', render: (r) => r.item, sortValue: (r) => r.item },
            {
              key: 'qty',
              header: 'Qty',
              render: (r) => r.qty,
              sortValue: (r) => r.qty,
              align: 'right',
            },
            {
              key: 'price',
              header: 'Price',
              render: (r) => <MoneyCell centavos={r.price} />,
              sortValue: (r) => r.price,
              align: 'right',
            },
          ]}
        />
        <Card>
          <KanbanBoard
            label="Example board"
            columns={[
              { id: 'new', title: 'New' },
              { id: 'won', title: 'Won' },
            ]}
            cards={cards}
            onMove={(id, to) =>
              setCards((xs) => xs.map((c) => (c.id === id ? { ...c, columnId: to } : c)))
            }
          />
        </Card>
      </Block>
    </main>
  );
}
