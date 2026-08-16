import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationListSkeleton({
  rows = 4,
  compact = false,
}) {
  return (
    <div>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className={`flex gap-3 border-b border-border/60 ${
            compact ? "px-4 py-4" : "px-5 py-5"
          }`}
        >
          <Skeleton className="size-10 shrink-0 rounded-full" />

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-14" />
            </div>

            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-3/4" />

            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}
