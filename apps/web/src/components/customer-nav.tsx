'use client';

import { BottomTabBar, TopNav, type NavItem } from '@vserve/ui';
import { usePathname } from 'next/navigation';
import { NavLink } from './nav-link';

export const CUSTOMER_TABS: NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/calculators', label: 'Calculate' },
  { href: '/shop', label: 'Shop' },
  { href: '/companies', label: 'Companies' },
  { href: '/me', label: 'Me' },
];

function activeTab(path: string): string {
  const match = CUSTOMER_TABS.filter((t) => t.href !== '/' && path.startsWith(t.href));
  return match[0]?.href ?? '/';
}

export function CustomerTopNav() {
  return (
    <TopNav
      items={CUSTOMER_TABS}
      activeHref={activeTab(usePathname())}
      LinkAs={NavLink}
      label="Main"
    />
  );
}

export function CustomerBottomTabs() {
  return (
    <BottomTabBar
      items={CUSTOMER_TABS}
      activeHref={activeTab(usePathname())}
      LinkAs={NavLink}
      label="Main"
    />
  );
}
