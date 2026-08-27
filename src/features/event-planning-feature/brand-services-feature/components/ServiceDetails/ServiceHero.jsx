import {
  Banknote,
  Clock3,
  MessageSquareText,
  Star,
  UsersRound,
} from "lucide-react";

const ServiceHero = ({ service, formatServiceName }) => {
  const rating = Number(service?.rating || 0);
  const ratingCount = Number(service?.rating_count || 0);
  const reviewCount = Number(service?.review_count || 0);
  const shiftCharge = Number(service?.shift_charge || 0);
  const shiftHour = Number(service?.shift_hour || 0);

  return (
    <section>
      {/* Portfolio */}
      {service?.drive_link && (
        <div className="mb-4">
          <a
            href={service.drive_link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Check out {service?.brand?.display_name} portfolio →
          </a>
        </div>
      )}

      <div className="flex justify-between items-center">
        {/* Service Name */}
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          {formatServiceName(service?.service_name)}
        </h1>
        {/* Rating */}
        <div className="inline-flex h-9 items-center gap-2 rounded-md border bg-background px-3 text-sm">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />

          <span className="font-semibold">{rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Service Stats */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {/* Rating Count */}
        <div className="inline-flex h-9 items-center gap-2 rounded-md border bg-background px-3 text-sm">
          <UsersRound className="h-4 w-4 text-muted-foreground" />

          <span>
            <span className="font-semibold">{ratingCount}</span> Rating
            {ratingCount !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Review Count */}
        <div className="inline-flex h-9 items-center gap-2 rounded-md border bg-background px-3 text-sm">
          <MessageSquareText className="h-4 w-4 text-muted-foreground" />

          <span>
            <span className="font-semibold">{reviewCount}</span> Review
            {reviewCount !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Shift Charge */}
        <div className="inline-flex h-9 items-center gap-2 rounded-md border bg-background px-3 text-sm">
          <Banknote className="h-4 w-4 text-muted-foreground" />

          <span className="font-semibold">
            ৳ {shiftCharge.toLocaleString()}
          </span>
        </div>

        {/* Shift Hour */}
        <div className="inline-flex h-9 items-center gap-2 rounded-md border bg-background px-3 text-sm">
          <Clock3 className="h-4 w-4 text-muted-foreground" />

          <span>
            <span className="font-semibold">{shiftHour}</span> Hour
            {shiftHour !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">
        {service?.description ||
          "Professional event service designed to create memorable experiences."}
      </p>
    </section>
  );
};

export default ServiceHero;
