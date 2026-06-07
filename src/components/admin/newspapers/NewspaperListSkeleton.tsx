import { Skeleton } from '@/components/ui/skeleton';

export function NewspaperListSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading newspapers">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg bg-card">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-32 ml-auto" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      ))}
    </div>
  );
}
