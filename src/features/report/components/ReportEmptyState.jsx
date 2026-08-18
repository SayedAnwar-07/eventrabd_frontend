import { FileCheck2 } from "lucide-react";

export default function ReportEmptyState() {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <FileCheck2 className="h-6 w-6 text-muted-foreground" />
      </div>

      <h2 className="mt-4 text-base font-semibold">No reports submitted</h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        Reports you submit for completed services will appear here along with
        their current review status.
      </p>
    </div>
  );
}
