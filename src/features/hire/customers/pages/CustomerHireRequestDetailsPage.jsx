import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import GlobalErrorMessage from "@/components/common/GlobalErrorMessage";

import CustomerInvoiceDetails from "@/features/invoice/components/CustomerInvoiceDetails";
import CustomerReviewSection from "@/features/review/components/CustomerReviewSection";

import CreateReportModal from "@/features/report/components/CreateReportModal";
import { findReportByHireId } from "@/features/report/utils/reportUtils";
import { fetchMyReports } from "@/store/features/report/reportSlice";

import BookingSlots from "../components/BookingSlots";
import ErrorState from "../components/ErrorState";
import HireTimeline from "../components/HireTimeline";
import LoadingState from "../components/LoadingState";
import PeopleInformation from "../components/PeopleInformation";

import { useHireDetails } from "../hooks/useHireDetails";

export default function CustomerHireRequestDetailsPage() {
  const { id } = useParams();

  const dispatch = useDispatch();

  const { hire, loading, error, retry } = useHireDetails(id);

  const { reports } = useSelector((state) => state.report);

  useEffect(() => {
    if (hire?.status === "completed") {
      dispatch(fetchMyReports());
    }
  }, [dispatch, hire?.status]);

  const existingReport = findReportByHireId(reports, hire?.id);

  // Refresh hire after invoice decision.
  const handleInvoiceDecisionSuccess = async () => {
    await retry();
  };

  if (loading && !hire) {
    return <LoadingState />;
  }

  if (error && !hire) {
    return <ErrorState error={error} loading={loading} onRetry={retry} />;
  }

  if (!hire) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-3xl px-4 py-16">
          <section className="rounded-md border border-border bg-card px-6 py-12 text-center">
            <h1 className="text-xl font-semibold text-foreground">
              Hire request not found
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              This booking may have been removed or you may not have permission
              to view it.
            </p>

            <Link
              to="/customer/hire-requests"
              className="mt-6 inline-flex rounded-md border border-primary px-5 py-2.5 text-sm font-semibold text-primary"
            >
              Back to Bookings
            </Link>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-6xl px-4 py-8 lg:py-10">
        {/* Back navigation */}
        <Link
          to="/customer/hire-requests"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Bookings
        </Link>

        {/* Background refresh error */}
        {error?.message && (
          <GlobalErrorMessage error={error} className="mt-5 rounded-md" />
        )}

        {/* Hire timeline */}
        <section className="mt-5 flex justify-end">
          <HireTimeline hire={hire} />
        </section>

        {/* Customer review */}
        <CustomerReviewSection hire={hire} />

        {/* Customer report */}
        {hire.status === "completed" && (
          <section className="mt-6 flex justify-end">
            <CreateReportModal
              hire={hire}
              invoice={hire?.invoice}
              existingReport={existingReport}
              serviceName={
                hire?.service?.service_display_name ||
                hire?.service_display_name ||
                hire?.service?.service_name ||
                "this service"
              }
            />
          </section>
        )}

        {/* Booking slots */}
        <section className="mt-12">
          <BookingSlots hire={hire} />
        </section>

        {/* Customer, seller and invoice information */}
        <section className="mt-10 grid grid-cols-1 items-start gap-6 xl:grid-cols-[360px_210mm] xl:justify-center">
          <div className="min-w-0">
            <PeopleInformation hire={hire} />
          </div>

          <div className="min-w-0">
            <CustomerInvoiceDetails
              hire={hire}
              onDecisionSuccess={handleInvoiceDecisionSuccess}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
