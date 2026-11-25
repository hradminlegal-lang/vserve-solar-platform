'use client';

import { Button, ErrorState } from '@vserve/ui';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="main" className="mx-auto max-w-xl p-4">
      <ErrorState
        body="This page didn't load. Check your connection and try again."
        action={<Button onClick={reset}>Try again</Button>}
      />
    </main>
  );
}
