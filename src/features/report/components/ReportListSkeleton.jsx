import { Skeleton } from "@/components/ui/skeleton";

function ReportSkeletonItem() {
  return (
    <div className="rounded-xl border border-border p-4 sm:p-5">
      <div className="flex gap-4">
        <Skeleton className="hidden h-20 w-24 shrink-0 rounded-lg sm:block" />

        <div className="min-w-0 flex-1">
          <div className="flex justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-28" />
            </div>

            <Skeleton className="h-7 w-24 rounded-full" />
          </div>

          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          <Skeleton className="mt-4 h-3.5 w-32" />
        </div>
      </div>
    </div>
  );
}

export default function ReportListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <ReportSkeletonItem key={index} />
      ))}
    </div>
  );
}
