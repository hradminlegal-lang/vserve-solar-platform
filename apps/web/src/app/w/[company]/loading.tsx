import { Skeleton } from '@vserve/ui';

export default function Loading() {
  return (
    <div
      className="mx-auto flex max-w-xl flex-col gap-3 p-4"
      role="status"
      aria-busy="true"
      aria-label="Loading"
    >
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}
