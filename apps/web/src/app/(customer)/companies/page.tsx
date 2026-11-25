import { EmptyState } from '@vserve/ui';

export const metadata = { title: 'Solar companies' };

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-2xl font-extrabold">Solar companies</h1>
      <EmptyState
        title="Coming soon"
        body="Verified companies and their reviews appear here from phase 3."
      />
    </div>
  );
}
