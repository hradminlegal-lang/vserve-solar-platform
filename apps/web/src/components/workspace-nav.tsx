'use client';

import { TopNav, type NavItem } from '@vserve/ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavLink } from './nav-link';
import { WORKSPACE_SECTIONS, sectionLabel } from '@/lib/workspace';

function items(company: string): NavItem[] {
  return WORKSPACE_SECTIONS.map((s) => ({ href: `/w/${company}/${s}`, label: sectionLabel(s) }));
}

/** Tabs on desktop; a "Menu" disclosure on phones. */
export function WorkspaceNav({ company }: { company: string }) {
  const path = usePathname();
  const list = items(company);
  const active = list.find((i) => path.startsWith(i.href))?.href ?? '';
  return (
    <>
      <div className="hidden lg:block">
        <TopNav items={list} activeHref={active} LinkAs={NavLink} label="Workspace" tone="navy" />
      </div>
      <details className="relative ml-auto lg:hidden">
        <summary className="flex min-h-12 cursor-pointer list-none items-center rounded-lg px-3 font-bold text-navy-ink">
          Menu
        </summary>
        <nav
          aria-label="Workspace"
          className="absolute right-0 z-30 mt-1 w-56 rounded-lg border border-line bg-surface p-1 text-ink shadow-lg"
        >
          <ul>
            {list.map((i) => (
              <li key={i.href}>
                <Link
                  href={i.href}
                  aria-current={i.href === active ? 'page' : undefined}
                  className="flex min-h-12 items-center rounded-md px-3 aria-[current=page]:bg-sun-soft aria-[current=page]:font-bold"
                >
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </details>
    </>
  );
}
