import { EmptyState } from '@vserve/ui';
import { notFound } from 'next/navigation';
import { sectionLabel, WORKSPACE_SECTIONS, type WorkspaceSection } from '@/lib/workspace';

const PROMPT: Record<Exclude<WorkspaceSection, 'pipeline'>, string> = {
  leads: 'Lead details and client onboarding are built in prompt 07.',
  designs: 'The design studio is built in prompts 10 to 12.',
  quotes: 'The quote maker and proposals are built in prompt 13.',
  campaigns: 'Landing pages and ad lead sync are built in prompt 08.',
  store: 'Storefronts and listings are built in prompt 17.',
  reports: 'Reports arrive with the CRM in prompt 07.',
};

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!WORKSPACE_SECTIONS.includes(section as WorkspaceSection) || section === 'pipeline')
    notFound();
  const s = section as Exclude<WorkspaceSection, 'pipeline'>;
  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <h1 className="font-display text-2xl font-extrabold">{sectionLabel(s)}</h1>
      <EmptyState title="Not built yet" body={PROMPT[s]} />
    </div>
  );
}
