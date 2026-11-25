'use client';

import { Button } from '@vserve/ui';
import Link from 'next/link';
import { useActionState } from 'react';
import { saveCalculation } from '@/app/(customer)/calculators/actions';
import type { SaveState } from '@/lib/save-calculation';

/** Posts the values the results were computed with; the server recomputes before saving. */
export function SaveForm({ kind, values }: { kind: string; values: Record<string, string> }) {
  const [state, action, pending] = useActionState<SaveState, FormData>(saveCalculation, {
    status: 'idle',
  });
  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="kind" value={kind} />
      {Object.entries(values).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <Button type="submit" variant="secondary" loading={pending} fullWidth>
        Save to my profile
      </Button>
      <p role="status" className="min-h-5 text-sm">
        {state.status === 'idle' ? null : state.message}{' '}
        {state.status === 'signin' ? (
          <Link href="/me" className="font-bold underline underline-offset-4">
            Go to sign in
          </Link>
        ) : null}
      </p>
    </form>
  );
}
