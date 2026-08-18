import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FileWarning, RefreshCw } from "lucide-react";

import GlobalErrorMessage from "@/components/common/GlobalErrorMessage";

import { Button } from "@/components/ui/button";

import { fetchMyReports } from "@/store/features/report/reportSlice";

import ReportEmptyState from "../components/ReportEmptyState";
import ReportItem from "../components/ReportItem";
import ReportListSkeleton from "../components/ReportListSkeleton";

export default function MyReportsPage() {
  const dispatch = useDispatch();

  const { reports, loading, error } = useSelector((state) => state.report);

  useEffect(() => {
    dispatch(fetchMyReports());
  }, [dispatch]);

  const handleRetry = () => {
    dispatch(fetchMyReports());
  };

  return (
    <main className="mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <header className="mb-6">
        <div className="flex items-center gap-2">
          <FileWarning className="h-5 w-5 text-muted-foreground" />

          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            My Reports
          </h1>
        </div>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          View the service reports you have submitted and follow their current
          review status.
        </p>
      </header>

      {loading ? (
        <ReportListSkeleton />
      ) : error ? (
        <div className="space-y-4">
          <GlobalErrorMessage error={error} />

          <Button type="button" variant="outline" onClick={handleRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      ) : reports.length === 0 ? (
        <ReportEmptyState />
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <ReportItem key={report.id} report={report} />
          ))}
        </div>
      )}
    </main>
  );
}
