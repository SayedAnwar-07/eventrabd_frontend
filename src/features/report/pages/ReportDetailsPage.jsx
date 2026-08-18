import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";

import GlobalErrorMessage from "@/components/common/GlobalErrorMessage";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import {
  clearCurrentReport,
  fetchReportDetail,
} from "@/store/features/report/reportSlice";

import ReportDetails from "../components/ReportDetails";

function ReportDetailSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="space-y-3 border-b border-border p-6">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-7 w-52" />
      </div>

      <div className="grid gap-6 p-6 sm:grid-cols-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>

      <div className="border-t border-border p-6">
        <Skeleton className="h-5 w-32" />

        <div className="mt-4 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}

export default function ReportDetailsPage() {
  const { reportId } = useParams();

  const dispatch = useDispatch();

  const { currentReport, detailLoading, error } = useSelector(
    (state) => state.report,
  );

  useEffect(() => {
    if (reportId) {
      dispatch(fetchReportDetail(reportId));
    }

    return () => {
      dispatch(clearCurrentReport());
    };
  }, [dispatch, reportId]);

  const handleRetry = () => {
    if (reportId) {
      dispatch(fetchReportDetail(reportId));
    }
  };

  return (
    <main className="mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <Button variant="ghost" size="sm" asChild className="mb-5 -ml-2">
        <Link to="/customer/reports">
          <ArrowLeft className="mr-2 h-4 w-4" />
          My Reports
        </Link>
      </Button>

      {detailLoading ? (
        <ReportDetailSkeleton />
      ) : error ? (
        <div className="space-y-4">
          <GlobalErrorMessage error={error} />

          <Button type="button" variant="outline" onClick={handleRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      ) : (
        <ReportDetails report={currentReport} />
      )}
    </main>
  );
}
