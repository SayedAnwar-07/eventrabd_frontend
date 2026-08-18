import { useEffect, useMemo, useState } from "react";
import { ImagePlus, Loader2, Star, X } from "lucide-react";

import GlobalErrorMessage from "@/components/common/GlobalErrorMessage";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialogCancel,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const RATING_OPTIONS = [
  { value: 2, label: "1.0" },
  { value: 3, label: "1.5" },
  { value: 4, label: "2.0" },
  { value: 5, label: "2.5" },
  { value: 6, label: "3.0" },
  { value: 7, label: "3.5" },
  { value: 8, label: "4.0" },
  { value: 9, label: "4.5" },
  { value: 10, label: "5.0" },
];

export default function ReviewForms({
  mode = "create",
  initialValues = null,
  loading = false,
  error = null,
  onSubmit,
}) {
  const [rating, setRating] = useState(initialValues?.rating ?? 0);

  const [comment, setComment] = useState(initialValues?.comment ?? "");

  const [image, setImage] = useState(null);

  const [existingImage, setExistingImage] = useState(
    initialValues?.image_url ?? null,
  );

  const [imageRemoved, setImageRemoved] = useState(false);

  const [localError, setLocalError] = useState(null);

  const imagePreview = useMemo(() => {
    if (!image) {
      return null;
    }

    return URL.createObjectURL(image);
  }, [image]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const visibleImage = imagePreview || (!imageRemoved ? existingImage : null);

  const selectedStars = rating > 0 ? rating / 2 : 0;

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    setLocalError(null);

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setLocalError("Only JPEG, PNG, or WEBP images are allowed.");

      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setLocalError("Review image cannot be larger than 5 MB.");

      return;
    }

    setImage(file);
    setImageRemoved(false);
  };

  const handleRemoveImage = () => {
    setImage(null);
    setExistingImage(null);
    setImageRemoved(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLocalError(null);

    if (!rating) {
      setLocalError("Please select a rating.");
      return;
    }

    const cleanedComment = comment.trim();

    const payload = {
      rating,
    };

    if (mode === "edit") {
      payload.comment = cleanedComment;
    } else if (cleanedComment) {
      payload.comment = cleanedComment;
    }

    if (image) {
      payload.image = image;
    }

    // Clear existing image on edit.
    if (mode === "edit" && imageRemoved) {
      payload.image = null;
    }

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {(localError || error) && (
        <GlobalErrorMessage
          error={localError || error}
          className="rounded-md"
        />
      )}

      {/* Rating */}

      <div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Your rating</p>

            <p className="mt-1 text-xs text-muted-foreground">
              Select your experience from 1 to 5 stars.
            </p>
          </div>

          {selectedStars > 0 && (
            <div className="flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1.5">
              <Star className="h-4 w-4 fill-primary text-primary" />

              <span className="text-sm font-semibold text-primary">
                {selectedStars.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {RATING_OPTIONS.map((option) => {
            const active = rating === option.value;

            return (
              <button
                key={option.value}
                type="button"
                disabled={loading}
                onClick={() => setRating(option.value)}
                className={`flex items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:bg-muted"
                }`}
              >
                <span>{option.label}</span>

                <Star
                  className={`h-4 w-4 ${
                    active
                      ? "fill-amber-400 text-amber-400"
                      : "fill-gray-400 text-gray-400"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Comment */}

      <div>
        <div className="flex items-center gap-2">
          <label
            htmlFor="review-comment"
            className="text-sm font-semibold text-foreground"
          >
            Comment
          </label>

          <span className="text-xs text-muted-foreground">(Optional)</span>
        </div>

        <Textarea
          id="review-comment"
          value={comment}
          disabled={loading}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Share your experience with this service..."
          rows={5}
          className="mt-3 resize-none rounded-md"
        />
      </div>

      {/* Image */}

      <div>
        <p className="text-sm font-semibold text-foreground">Photo</p>

        <p className="mt-1 text-xs text-muted-foreground">
          Optional · JPEG, PNG or WEBP · Maximum 5 MB
        </p>

        {!visibleImage ? (
          <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-border bg-muted/20 px-4 py-4 transition-colors hover:bg-muted/40">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
              <ImagePlus className="h-5 w-5 text-muted-foreground" />
            </div>

            <div>
              <p className="text-sm font-medium text-foreground">
                Upload review photo
              </p>

              <p className="mt-0.5 text-xs text-muted-foreground">
                Click to choose an image
              </p>
            </div>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={loading}
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        ) : (
          <div className="relative mt-3 w-fit overflow-hidden rounded-md border border-border">
            <img
              src={visibleImage}
              alt="Review"
              className="max-h-56 max-w-full object-contain"
            />

            <button
              type="button"
              disabled={loading}
              onClick={handleRemoveImage}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-md bg-background/90 text-foreground shadow-sm backdrop-blur hover:bg-background"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <AlertDialogFooter className="border-t border-border pt-5">
        <AlertDialogCancel
          type="button"
          disabled={loading}
          className="rounded-md"
        >
          Cancel
        </AlertDialogCancel>

        <Button type="submit" disabled={loading} className="rounded-md">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}

          {mode === "edit" ? "Update Review" : "Submit Review"}
        </Button>
      </AlertDialogFooter>
    </form>
  );
}
