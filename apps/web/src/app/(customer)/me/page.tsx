import { EmptyState } from '@vserve/ui';

export const metadata = { title: 'Me' };

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-2xl font-extrabold">Me</h1>
      <EmptyState
        title="Coming soon"
        body="Your energy profile, saved results and proposals will live here once sign-in is built."
      />
    </div>
  );
}
