import type { ReactNode } from 'react';
import { WorkspaceNav } from '@/components/workspace-nav';

/** Company workspace shell (desktop-first). Membership checks arrive with sign-in in prompt 04. */
export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ company: string }>;
}) {
  const { company } = await params;
  const name = company.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 bg-navy text-navy-ink">
        <div className="flex min-h-14 items-center gap-4 px-4">
          <span className="font-display text-base font-extrabold">{name}</span>
          <WorkspaceNav company={company} />
        </div>
      </header>
      <main id="main" className="px-4 py-4">
        {children}
      </main>
    </div>
  );
}
