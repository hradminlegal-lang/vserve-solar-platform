'use client';

import {
  Chip,
  KanbanBoard,
  MoneyCell,
  useToast,
  type KanbanCard,
  type KanbanColumn,
} from '@vserve/ui';
import { useState } from 'react';

/**
 * Reference screen W1 with sample leads (no database yet). Moving a card only changes local
 * state here; from prompt 07 it calls a server function that validates the stage change.
 */
const COLUMNS: KanbanColumn[] = [
  { id: 'new', title: 'New' },
  { id: 'site_survey', title: 'Site survey' },
  { id: 'design', title: 'Design' },
  { id: 'proposal_sent', title: 'Proposal sent' },
  { id: 'financing', title: 'Financing' },
  { id: 'won', title: 'Won' },
];

interface SampleLead {
  id: string;
  stage: string;
  name: string;
  place: string;
  detail: string;
  tag?: { text: string; tone: 'good' | 'warn' | 'bad' | 'neutral' | 'sun' };
  source?: string;
  overdue?: boolean;
  valueCentavos?: number;
}

const SAMPLE: SampleLead[] = [
  {
    id: 'l1',
    stage: 'new',
    name: 'R. Santos',
    place: 'Bacoor',
    detail: 'Bill ₱9,000',
    tag: { text: 'Hot', tone: 'good' },
    source: 'Meta ad',
  },
  {
    id: 'l2',
    stage: 'new',
    name: 'J. Cruz',
    place: 'Imus',
    detail: 'Bill ₱6,200',
    tag: { text: 'Contact overdue 3 h', tone: 'bad' },
    overdue: true,
  },
  {
    id: 'l3',
    stage: 'new',
    name: 'Sari-sari store',
    place: 'Dasmariñas',
    detail: 'Bill ₱14,000',
    tag: { text: 'Warm', tone: 'sun' },
  },
  {
    id: 'l4',
    stage: 'site_survey',
    name: 'M. Reyes',
    place: 'Bacoor',
    detail: 'Survey Thu 9 AM',
    tag: { text: 'Engineer: Leo', tone: 'neutral' },
  },
  {
    id: 'l5',
    stage: 'site_survey',
    name: 'Clinic',
    place: 'Imus',
    detail: 'Survey done · 14 photos',
  },
  {
    id: 'l6',
    stage: 'design',
    name: 'A. Ramos',
    place: 'Bacoor',
    detail: '5.4 kWp · draft v2',
    tag: { text: '2 warnings', tone: 'warn' },
  },
  {
    id: 'l7',
    stage: 'design',
    name: 'School annex',
    place: 'Laguna',
    detail: '24 kWp · signed off',
  },
  {
    id: 'l8',
    stage: 'proposal_sent',
    name: 'Ana R.',
    place: 'Bacoor',
    detail: 'Opened 3 times',
    tag: { text: 'Viewed savings', tone: 'good' },
    valueCentavos: 31200000,
  },
  {
    id: 'l9',
    stage: 'proposal_sent',
    name: 'P. Lim',
    place: 'Muntinlupa',
    detail: 'Not opened',
    valueCentavos: 52000000,
  },
  {
    id: 'l10',
    stage: 'financing',
    name: 'D. Tan',
    place: 'Imus',
    detail: 'Housing fund · documents sent',
  },
  {
    id: 'l11',
    stage: 'won',
    name: 'G. Aquino',
    place: 'Dasmariñas',
    detail: 'Install Dec 2',
    valueCentavos: 29800000,
  },
];

export function PipelineBoard() {
  const [leads, setLeads] = useState(SAMPLE);
  const toast = useToast();
  const overdue = leads.filter((l) => l.overdue).length;
  const proposalValue = leads
    .filter((l) => l.stage === 'proposal_sent')
    .reduce((a, l) => a + (l.valueCentavos ?? 0), 0);

  const cards: KanbanCard[] = leads.map((l) => ({
    id: l.id,
    columnId: l.stage,
    title: l.name,
    overdue: l.overdue,
    content: (
      <>
        <span>
          {l.place} · {l.detail}
        </span>
        {l.valueCentavos ? (
          <span className="font-bold text-ink">
            <MoneyCell centavos={l.valueCentavos} />
          </span>
        ) : null}
        <span className="flex flex-wrap gap-1">
          {l.tag ? <Chip tone={l.tag.tone}>{l.tag.text}</Chip> : null}
          {l.source ? <Chip>{l.source}</Chip> : null}
        </span>
      </>
    ),
  }));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <h1 className="font-display text-2xl font-extrabold">Pipeline</h1>
        <p className="text-sm">
          Proposals out{' '}
          <strong className="tabular-nums">
            <MoneyCell centavos={proposalValue} />
          </strong>
        </p>
        <p className="text-sm">
          Leads <strong className="tabular-nums">{leads.length}</strong>
        </p>
        {overdue > 0 ? <Chip tone="bad">{overdue} overdue</Chip> : null}
        <Chip>Sample data</Chip>
      </div>
      <KanbanBoard
        label="Sales pipeline"
        columns={COLUMNS}
        cards={cards}
        onMove={(id, to) => {
          setLeads((xs) => xs.map((l) => (l.id === id ? { ...l, stage: to } : l)));
          const lead = leads.find((l) => l.id === id);
          const col = COLUMNS.find((c) => c.id === to);
          if (lead && col) toast(`${lead.name} moved to ${col.title}`, 'good');
        }}
      />
    </div>
  );
}
