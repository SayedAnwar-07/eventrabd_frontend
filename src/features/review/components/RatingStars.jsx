import { Star } from "lucide-react";

const clampRating = (value) => {
  const rating = Number(value);

  if (Number.isNaN(rating)) {
    return 0;
  }

  return Math.min(Math.max(rating, 0), 5);
};

export default function RatingStars({
  value = 0,
  size = 16,
  showValue = false,
}) {
  const rating = clampRating(value);

  return (
    <div
      className="flex items-center gap-1"
      aria-label={`${rating.toFixed(1)} out of 5 stars`}
    >
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, index) => {
          const starNumber = index + 1;
          const fillPercentage = Math.min(
            Math.max((rating - index) * 100, 0),
            100,
          );

          return (
            <span
              key={starNumber}
              className="relative inline-flex"
              style={{
                width: size,
                height: size,
              }}
            >
              <Star
                size={size}
                className="absolute inset-0 text-muted-foreground/30"
                strokeWidth={1.8}
              />

              <span
                className="absolute inset-0 overflow-hidden"
                style={{
                  width: `${fillPercentage}%`,
                }}
              >
                <Star
                  size={size}
                  className="fill-primary text-primary"
                  strokeWidth={1.8}
                />
              </span>
            </span>
          );
        })}
      </div>

      {showValue && (
        <span className="ml-1 text-sm font-semibold text-foreground">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
