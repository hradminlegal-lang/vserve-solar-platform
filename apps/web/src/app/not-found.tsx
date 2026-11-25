import Link from 'next/link';
import { EmptyState } from '@vserve/ui';

export default function NotFound() {
  return (
    <main id="main" className="mx-auto max-w-xl p-4">
      <EmptyState
        title="Page not found"
        body="The link may be old or mistyped."
        action={
          <Link
            href="/"
            className="inline-flex min-h-12 items-center font-bold text-sun-text underline"
          >
            Go to the home page
          </Link>
        }
      />
    </main>
  );
}
