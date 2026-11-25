/** Workspace sections, shared by server pages and the client navigation. */
export const WORKSPACE_SECTIONS = [
  'pipeline',
  'leads',
  'designs',
  'quotes',
  'campaigns',
  'store',
  'reports',
] as const;
export type WorkspaceSection = (typeof WORKSPACE_SECTIONS)[number];

const LABELS: Record<WorkspaceSection, string> = {
  pipeline: 'Pipeline',
  leads: 'Leads',
  designs: 'Designs',
  quotes: 'Quotes',
  campaigns: 'Campaigns',
  store: 'Store',
  reports: 'Reports',
};

export function sectionLabel(s: WorkspaceSection): string {
  return LABELS[s];
}
