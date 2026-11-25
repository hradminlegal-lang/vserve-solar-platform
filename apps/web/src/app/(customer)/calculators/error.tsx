'use client';

import { Button, ErrorState } from '@vserve/ui';

export default function CalculatorError({ reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorState
      title="The calculator could not load"
      body="Your numbers are still in the address bar. Try again in a moment."
      action={<Button onClick={reset}>Try again</Button>}
    />
  );
}
