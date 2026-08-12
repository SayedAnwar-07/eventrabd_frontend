import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Star } from "lucide-react";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import ReviewForms from "./ReviewForms";

import {
  clearReviewError,
  createReview,
  selectReviewCreateLoading,
  selectReviewError,
} from "@/store/features/review/reviewSlice";

export default function CreateReviewDialog({ hireId, trigger, onSuccess }) {
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);

  const createLoading = useSelector(selectReviewCreateLoading);

  const error = useSelector(selectReviewError);

  const handleOpenChange = (value) => {
    if (createLoading) {
      return;
    }

    setOpen(value);

    if (value) {
      dispatch(clearReviewError());
    }
  };

  const handleSubmit = async (formData) => {
    if (!hireId) {
      return;
    }

    try {
      const review = await dispatch(
        createReview({
          hire: hireId,
          ...formData,
        }),
      ).unwrap();

      setOpen(false);

      onSuccess?.(review);
    } catch {
      // Redux error state handles API errors.
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

      <AlertDialogContent className="max-h-[90vh] overflow-y-auto rounded-md sm:max-w-xl">
        <AlertDialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
            <Star className="h-5 w-5 text-primary" />
          </div>

          <AlertDialogTitle>Write a review</AlertDialogTitle>

          <AlertDialogDescription>
            Share your experience with this service.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <ReviewForms
          mode="create"
          loading={createLoading}
          error={error}
          onSubmit={handleSubmit}
        />
      </AlertDialogContent>
    </AlertDialog>
  );
}
