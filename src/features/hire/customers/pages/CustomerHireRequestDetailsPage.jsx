import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, PencilLine, Star } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import GlobalErrorMessage from "@/components/common/GlobalErrorMessage";

import { useHireDetails } from "../hooks/useHireDetails";

import BookingSlots from "../components/BookingSlots";
import ErrorState from "../components/ErrorState";
import HireTimeline from "../components/HireTimeline";
import LoadingState from "../components/LoadingState";
import PeopleInformation from "../components/PeopleInformation";

import CustomerInvoiceDetails from "@/features/invoice/components/CustomerInvoiceDetails";

import CreateReviewDialog from "@/features/review/components/CreateReviewDialog";
import EditReviewDialog from "@/features/review/components/EditReviewDialog";

import {
  clearReviewEligibility,
  clearReviewError,
  fetchReviewEligibility,
  selectReviewEligibility,
  selectReviewEligibilityLoading,
  selectReviewError,
} from "@/store/features/review/reviewSlice";

export default function CustomerHireRequestDetailsPage() {
  const { id } = useParams();

  const dispatch = useDispatch();

  const { hire, loading, error, retry } = useHireDetails(id);

  // console.log("My hire detail : ", hire);
  const reviewEligibility = useSelector(selectReviewEligibility);

  const reviewEligibilityLoading = useSelector(selectReviewEligibilityLoading);

  const reviewError = useSelector(selectReviewError);

  // Customer agreement is the final condition
  // for showing the review feature.
  const isReviewReady = hire?.invoice?.customer_agreed === true;

  useEffect(() => {
    if (!id || !isReviewReady) {
      return;
    }

    dispatch(clearReviewError());
    dispatch(clearReviewEligibility());

    const request = dispatch(fetchReviewEligibility(id));

    return () => {
      request.abort();
    };
  }, [dispatch, id, isReviewReady]);

  const refreshReviewEligibility = () => {
    if (!id) {
      return;
    }

    dispatch(fetchReviewEligibility(id));
  };

  const handleInvoiceDecisionSuccess = async () => {
    // Refresh the full hire so customer_agreed,
    // completed status and completed_at are updated.
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
        <Link
          to="/customer/hire-requests"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Bookings
        </Link>

        {error?.message && (
          <GlobalErrorMessage error={error} className="mt-5 rounded-md" />
        )}

        {/* Timeline */}

        <section className="mt-5 flex justify-end">
          <HireTimeline hire={hire} />
        </section>

        {/* Review Action */}
        {isReviewReady && (
          <section className="mt-8">
            <div className="flex flex-col gap-4 rounded-md border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Service Review
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Share your experience with this service.
                </p>
              </div>

              <div className="shrink-0">
                {reviewEligibilityLoading ? (
                  <Button
                    type="button"
                    disabled
                    variant="outline"
                    className="rounded-md"
                  >
                    Checking review...
                  </Button>
                ) : reviewError && !reviewEligibility ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-md"
                    onClick={refreshReviewEligibility}
                  >
                    Try Again
                  </Button>
                ) : reviewEligibility?.review_id ? (
                  <EditReviewDialog
                    reviewId={reviewEligibility.review_id}
                    onSuccess={refreshReviewEligibility}
                    trigger={
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-md"
                      >
                        <PencilLine className="mr-2 h-4 w-4" />
                        Edit Review
                      </Button>
                    }
                  />
                ) : (
                  <CreateReviewDialog
                    hireId={hire.id}
                    onSuccess={refreshReviewEligibility}
                    trigger={
                      <Button type="button" className="rounded-md">
                        <Star className="mr-2 h-4 w-4" />
                        Write a Review
                      </Button>
                    }
                  />
                )}
              </div>
            </div>

            {reviewError && reviewEligibility && (
              <GlobalErrorMessage
                error={reviewError}
                className="mt-3 rounded-md"
              />
            )}
          </section>
        )}

        {/* Booking Slots */}

        <section className="mt-12">
          <BookingSlots hire={hire} />
        </section>

        {/* People + Invoice */}

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
