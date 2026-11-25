import Link from 'next/link';
import type { ReactNode } from 'react';
import { CustomerBottomTabs, CustomerTopNav } from '@/components/customer-nav';

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh pb-20 lg:pb-0">
      <header className="sticky top-0 z-20 border-b border-line bg-surface">
        <div className="mx-auto flex min-h-14 max-w-[1120px] items-center gap-6 px-4">
          <Link
            href="/"
            className="inline-flex min-h-12 items-center gap-2 font-display text-lg font-extrabold"
          >
            <span aria-hidden className="size-5 rounded-full bg-sun" />
            VServe Solar
          </Link>
          <div className="hidden lg:block">
            <CustomerTopNav />
          </div>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-[1120px] px-4 py-4">
        {children}
      </main>
      <CustomerBottomTabs />
    </div>
  );
}
