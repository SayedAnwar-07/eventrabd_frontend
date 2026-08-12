import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PencilLine } from "lucide-react";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Skeleton } from "@/components/ui/skeleton";

import GlobalErrorMessage from "@/components/common/GlobalErrorMessage";

import ReviewForms from "./ReviewForms";

import {
  clearReviewError,
  fetchReviewDetails,
  selectReviewDetailsLoading,
  selectReviewError,
  selectReviewUpdateLoading,
  selectSelectedReview,
  updateReview,
} from "@/store/features/review/reviewSlice";

export default function EditReviewDialog({ reviewId, trigger, onSuccess }) {
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);

  const review = useSelector(selectSelectedReview);

  const detailsLoading = useSelector(selectReviewDetailsLoading);

  const updateLoading = useSelector(selectReviewUpdateLoading);

  const error = useSelector(selectReviewError);

  useEffect(() => {
    if (!open || !reviewId) {
      return;
    }

    dispatch(clearReviewError());

    const request = dispatch(fetchReviewDetails(reviewId));

    return () => {
      request.abort();
    };
  }, [dispatch, open, reviewId]);

  const handleSubmit = async (formData) => {
    try {
      const updatedReview = await dispatch(
        updateReview({
          reviewId,
          data: formData,
        }),
      ).unwrap();

      setOpen(false);

      onSuccess?.(updatedReview);
    } catch {
      // Redux handles API error.
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

      <AlertDialogContent className="max-h-[90vh] overflow-y-auto rounded-md sm:max-w-xl">
        <AlertDialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
            <PencilLine className="h-5 w-5 text-primary" />
          </div>

          <AlertDialogTitle>Edit review</AlertDialogTitle>

          <AlertDialogDescription>
            Update your rating, comment, or review image.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {detailsLoading ? (
          <div className="space-y-4 py-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : error && !review ? (
          <GlobalErrorMessage error={error} className="rounded-md" />
        ) : review && String(review.id) === String(reviewId) ? (
          <ReviewForms
            key={review.id}
            mode="edit"
            initialValues={review}
            loading={updateLoading}
            error={error}
            onSubmit={handleSubmit}
          />
        ) : null}
      </AlertDialogContent>
    </AlertDialog>
  );
}
