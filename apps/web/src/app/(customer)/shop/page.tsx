import { EmptyState } from '@vserve/ui';

export const metadata = { title: 'Shop' };

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-2xl font-extrabold">Shop</h1>
      <EmptyState
        title="Coming soon"
        body="The marketplace opens in phase 4. You'll compare panels, inverters and batteries from verified sellers here."
      />
    </div>
  );
}
