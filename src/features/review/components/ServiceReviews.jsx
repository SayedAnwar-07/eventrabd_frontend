import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MessageSquareText, Star } from "lucide-react";

import GlobalErrorMessage from "@/components/common/GlobalErrorMessage";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import {
  fetchServiceReviews,
  selectReviews,
  selectReviewLoading,
  selectReviewError,
  selectReviewPagination,
} from "@/store/features/review/reviewSlice";

import RatingStars from "./RatingStars";
import ReviewCard from "./ReviewCard";

const PAGE_SIZE = 10;

const ReviewSkeleton = () => {
  return (
    <div className="flex gap-4 border-b border-border py-7">
      <Skeleton className="h-11 w-11 shrink-0 rounded-full" />

      <div className="flex-1 space-y-3">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-4 w-32" />

        <div className="space-y-2 pt-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      </div>
    </div>
  );
};

export default function ServiceReviews({ service }) {
  const dispatch = useDispatch();

  const reviews = useSelector(selectReviews);
  const loading = useSelector(selectReviewLoading);
  const error = useSelector(selectReviewError);
  const pagination = useSelector(selectReviewPagination);

  const serviceId = service?.id;

  const [paginationState, setPaginationState] = useState({
    serviceId: null,
    page: 1,
  });

  /*
   * If the service changes, the effective page automatically
   * becomes 1 without calling setState inside an effect.
   */
  const page =
    paginationState.serviceId === serviceId ? paginationState.page : 1;

  const averageRating = Number(service?.rating ?? service?.average_rating ?? 0);

  const reviewCount = Number(
    service?.review_count ?? service?.rating_count ?? pagination?.count ?? 0,
  );

  useEffect(() => {
    if (!serviceId) {
      return;
    }

    const request = dispatch(
      fetchServiceReviews({
        serviceId,
        page,
        pageSize: PAGE_SIZE,
      }),
    );

    return () => {
      request.abort();
    };
  }, [dispatch, serviceId, page]);

  const scrollToReviews = () => {
    window.requestAnimationFrame(() => {
      document.getElementById("service-reviews")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const handlePrevious = () => {
    if (!pagination.previous || loading) {
      return;
    }

    setPaginationState({
      serviceId,
      page: Math.max(page - 1, 1),
    });

    scrollToReviews();
  };

  const handleNext = () => {
    if (!pagination.next || loading) {
      return;
    }

    setPaginationState({
      serviceId,
      page: page + 1,
    });

    scrollToReviews();
  };

  return (
    <section
      id="service-reviews"
      className="scroll-mt-24 border-t border-border py-10 sm:py-12"
    >
      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12">
        {/* Rating Summary */}

        <div className="h-fit lg:sticky lg:top-24">
          <p className="text-sm font-medium text-muted-foreground">
            Customer feedback
          </p>

          <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            Reviews
          </h2>

          <div className="mt-6 rounded-md border border-border bg-card p-5">
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold tracking-tight text-foreground">
                {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
              </span>

              <span className="pb-1 text-sm text-muted-foreground">/ 5</span>
            </div>

            <div className="mt-3">
              <RatingStars value={averageRating} size={18} />
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <MessageSquareText className="h-4 w-4" />

              <span>
                {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
              </span>
            </div>
          </div>
        </div>

        {/* Review List */}

        <div className="min-w-0">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Customer reviews
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Experiences shared by customers who completed this service.
              </p>
            </div>
          </div>

          {error && (
            <GlobalErrorMessage error={error} className="mt-5 rounded-md" />
          )}

          {loading && reviews.length === 0 ? (
            <div>
              {Array.from({
                length: 3,
              }).map((_, index) => (
                <ReviewSkeleton key={index} />
              ))}
            </div>
          ) : null}

          {!loading && !error && reviews.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-4 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-muted/40">
                <Star className="h-5 w-5 text-muted-foreground" />
              </div>

              <h3 className="mt-4 text-base font-semibold text-foreground">
                No reviews yet
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                Customers who complete this service can share their experience
                here.
              </p>
            </div>
          ) : null}

          {reviews.length > 0 && (
            <>
              <div>
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>

              {(pagination.previous || pagination.next) && (
                <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!pagination.previous || loading}
                    onClick={handlePrevious}
                    className="rounded-md"
                  >
                    Previous
                  </Button>

                  <span className="text-sm font-medium text-muted-foreground">
                    Page {page}
                  </span>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!pagination.next || loading}
                    onClick={handleNext}
                    className="rounded-md"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}

          {loading && reviews.length > 0 && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Loading reviews...
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
