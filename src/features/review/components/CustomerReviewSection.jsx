import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PencilLine, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import GlobalErrorMessage from "@/components/common/GlobalErrorMessage";

import CreateReviewDialog from "./CreateReviewDialog";
import EditReviewDialog from "./EditReviewDialog";
import ReviewCard from "./ReviewCard";

import {
  clearReviewEligibility,
  clearReviewError,
  fetchReviewDetails,
  fetchReviewEligibility,
  selectReviewDetailsLoading,
  selectReviewEligibility,
  selectReviewEligibilityLoading,
  selectReviewError,
  selectSelectedReview,
} from "@/store/features/review/reviewSlice";

export default function CustomerReviewSection({ hire }) {
  const dispatch = useDispatch();

  const reviewEligibility = useSelector(selectReviewEligibility);

  const reviewEligibilityLoading = useSelector(selectReviewEligibilityLoading);

  const reviewDetailsLoading = useSelector(selectReviewDetailsLoading);

  const selectedReview = useSelector(selectSelectedReview);

  const reviewError = useSelector(selectReviewError);

  const isReviewReady = hire?.invoice?.customer_agreed === true;

  const reviewId = reviewEligibility?.review_id;

  // -----------------------------------------------------
  // Fetch review eligibility
  // -----------------------------------------------------

  useEffect(() => {
    if (!hire?.id || !isReviewReady) {
      return;
    }

    dispatch(clearReviewError());
    dispatch(clearReviewEligibility());

    const request = dispatch(fetchReviewEligibility(hire.id));

    return () => {
      request.abort();
    };
  }, [dispatch, hire?.id, isReviewReady]);

  // -----------------------------------------------------
  // Existing review ? detail fetch
  // -----------------------------------------------------

  useEffect(() => {
    if (!reviewId) {
      return;
    }

    const request = dispatch(fetchReviewDetails(reviewId));

    return () => {
      request.abort();
    };
  }, [dispatch, reviewId]);

  // -----------------------------------------------------
  // Refresh eligibility
  // -----------------------------------------------------

  const refreshReviewEligibility = () => {
    if (!hire?.id) {
      return;
    }

    dispatch(clearReviewError());

    dispatch(fetchReviewEligibility(hire.id));
  };

  // -----------------------------------------------------
  // After create
  // -----------------------------------------------------

  const handleCreateSuccess = (review) => {
    if (review?.id) {
      dispatch(fetchReviewDetails(review.id));
    }

    refreshReviewEligibility();
  };

  // -----------------------------------------------------
  // After edit
  // -----------------------------------------------------

  const handleEditSuccess = (review) => {
    if (review?.id) {
      dispatch(fetchReviewDetails(review.id));
    } else if (reviewId) {
      dispatch(fetchReviewDetails(reviewId));
    }

    refreshReviewEligibility();
  };

  // -----------------------------------------------------
  // Review feature not ready
  // -----------------------------------------------------

  if (!isReviewReady) {
    return null;
  }

  const hasCurrentReview =
    reviewId &&
    selectedReview &&
    String(selectedReview.id) === String(reviewId);

  return (
    <section className="mt-8">
      {reviewEligibilityLoading ? (
        // Checking review eligibility
        <div className="flex justify-end">
          <Button
            type="button"
            disabled
            variant="outline"
            className="rounded-md"
          >
            Checking review...
          </Button>
        </div>
      ) : reviewError && !reviewEligibility ? (
        // Eligibility error
        <div className="rounded-md border border-border bg-card p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Service Review
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Unable to check your review.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              className="rounded-md"
              onClick={refreshReviewEligibility}
            >
              Try Again
            </Button>
          </div>
        </div>
      ) : reviewId ? (
        // Existing review
        <div className="mt-10 bg-card">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            {/* Left: Review */}
            <div className="min-w-0 flex-1">
              {reviewDetailsLoading && !hasCurrentReview ? (
                <div className="py-5 text-sm text-muted-foreground">
                  Loading your review...
                </div>
              ) : hasCurrentReview ? (
                <ReviewCard review={selectedReview} />
              ) : null}
            </div>

            {/* Right: Edit button */}
            <div className="shrink-0 lg:pt-2">
              <EditReviewDialog
                reviewId={reviewId}
                onSuccess={handleEditSuccess}
                trigger={
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-md lg:w-auto"
                  >
                    <PencilLine className="mr-2 h-4 w-4" />
                    Edit Review
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      ) : (
        // No review yet
        <div className="flex flex-col gap-4 rounded-md border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Service Review
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Share your experience with this service.
            </p>
          </div>

          <CreateReviewDialog
            hireId={hire.id}
            onSuccess={handleCreateSuccess}
            trigger={
              <Button type="button" className="rounded-md">
                <Star className="mr-2 h-4 w-4" />
                Write a Review
              </Button>
            }
          />
        </div>
      )}

      {/* Review error */}
      {reviewError && reviewEligibility && (
        <GlobalErrorMessage error={reviewError} className="mt-3 rounded-md" />
      )}
    </section>
  );
}
