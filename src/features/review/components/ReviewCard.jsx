import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import RatingStars from "./RatingStars";

const getInitials = (name = "") => {
  const words = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  if (!words.length) {
    return "U";
  }

  return words.map((word) => word.charAt(0).toUpperCase()).join("");
};

const formatReviewDate = (date) => {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
};

const getStarValue = (review) => {
  if (review?.stars !== undefined && review?.stars !== null) {
    return Number(review.stars);
  }

  if (review?.rating) {
    return Number(review.rating) / 2;
  }

  return 0;
};

export default function ReviewCard({ review }) {
  const customerName = review?.customer?.full_name?.trim() || "Customer";

  const profileImage = review?.customer?.profile_image_url || "";

  const stars = getStarValue(review);

  return (
    <article className="border-b border-border py-7 last:border-b-0">
      <div className="flex items-start gap-4">
        <Avatar className="h-11 w-11 shrink-0 border border-border">
          <AvatarImage
            src={profileImage}
            alt={customerName}
            className="object-cover"
          />

          <AvatarFallback className="bg-muted text-sm font-semibold text-muted-foreground">
            {getInitials(customerName)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1">
            <h3 className="truncate text-sm font-semibold text-foreground sm:text-base">
              {customerName}
            </h3>

            <time
              className="text-xs text-muted-foreground sm:text-sm"
              dateTime={review?.created_at}
            >
              {formatReviewDate(review?.created_at)}
            </time>

            <div className="mt-1">
              <RatingStars value={stars} size={16} showValue />
            </div>
          </div>

          {review?.comment && (
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted-foreground sm:text-[15px]">
              {review.comment}
            </p>
          )}

          {review?.image_url && (
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="mt-5 block max-w-xl overflow-hidden rounded-md border border-border bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label={`Open review image by ${customerName}`}
                >
                  <img
                    src={review.image_url}
                    alt={`Review by ${customerName}`}
                    loading="lazy"
                    className="max-h-105 w-full cursor-zoom-in object-cover transition-transform duration-300 hover:scale-[1.02]"
                  />
                </button>
              </DialogTrigger>

              <DialogContent className="flex max-h-[95dvh] w-[calc(100%-16px)] max-w-6xl items-center justify-center overflow-hidden rounded-md border-0 bg-black/95 p-2 sm:w-[calc(100%-48px)] sm:p-4">
                <img
                  src={review.image_url}
                  alt={`Review by ${customerName}`}
                  decoding="async"
                  className="max-h-[88dvh] max-w-full object-contain"
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </article>
  );
}
