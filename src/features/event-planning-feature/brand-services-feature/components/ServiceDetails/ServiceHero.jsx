import {
  Banknote,
  Building2,
  Camera,
  Clock3,
  Lightbulb,
  MessageSquareText,
  Star,
  UsersRound,
  Video,
} from "lucide-react";

const SERVICE_META = {
  photography: {
    label: "Photography",
    icon: Camera,
  },

  videography: {
    label: "Videography",
    icon: Video,
  },

  stage_designer: {
    label: "Stage Designer",
    icon: Lightbulb,
  },

  sound_lighting: {
    label: "Sound System and Lighting",
    icon: Lightbulb,
  },

  event_hall: {
    label: "Event Hall",
    icon: Building2,
  },
};

const ServiceHero = ({ service, formatServiceName }) => {
  const rating = Number(service?.rating || 0);
  const ratingCount = Number(service?.rating_count || 0);
  const reviewCount = Number(service?.review_count || 0);
  const shiftCharge = Number(service?.shift_charge || 0);
  const shiftHour = Number(service?.shift_hour || 0);

  const serviceType = service?.service_name;

  const serviceMeta = SERVICE_META[serviceType] || {
    label: formatServiceName(serviceType),
    icon: Camera,
  };

  const ServiceIcon = serviceMeta.icon;

  const cleanRichText = (html = "") => {
    return html
      .replace(
        /<p[^>]*>(?:\s|&nbsp;|&#160;|&#8203;|\u200B|<br[^>]*>)*<\/p>/gi,
        "",
      )
      .replace(
        /<p([^>]*)>(?:\s|&nbsp;|&#160;|&#8203;|\u200B)*<br[^>]*>/gi,
        "<p$1>",
      );
  };

  return (
    <section className="space-y-6">
      {/* Portfolio */}
      {service?.drive_link && (
        <a
          href={service.drive_link}
          target="_blank"
          rel="noreferrer"
          className="inline-flex text-sm font-medium text-primary hover:underline"
        >
          Check out {service?.brand?.display_name} portfolio →
        </a>
      )}

      {/* HERO */}
      <div className="">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          {/* LEFT */}
          <div className="flex min-w-0 items-start gap-4">
            <div className="min-w-0">
              {/* Service Name */}
              <div className="flex items-center gap-3">
                <div className="p-2 border rounded-md border-gray-300">
                  <ServiceIcon className="h-6 w-6 text-primary sm:h-8 sm:w-8" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                  {serviceMeta.label}
                </h1>
                {/* Rating */}
                <div className="ml-3 flex items-center gap-2">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />

                  <span className="text-lg font-semibold">
                    {rating.toFixed(1)}
                  </span>

                  <span className="text-sm text-muted-foreground">
                    ({ratingCount} rating{ratingCount !== 1 ? "s" : ""})
                  </span>
                </div>
              </div>

              {/* Small description */}
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Professional {serviceMeta.label.toLowerCase()} service for your
                special events and memorable moments.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SERVICE STATS */}
      <div className="grid grid-cols-2 overflow-hidden rounded-md border shadow-sm sm:grid-cols-4">
        {/* Ratings */}
        <div className="hidden sm:flex flex-col items-center justify-center border-b border-r p-5 text-center sm:border-b-0">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-primary/10">
            <UsersRound className="h-5 w-5 text-primary" />
          </div>

          <p className="text-xl font-bold">{ratingCount}</p>

          <p className="mt-1 text-sm text-muted-foreground">Ratings</p>
        </div>

        {/* Reviews */}
        <div className="hidden sm:flex flex-col items-center justify-center border-b p-5 text-center sm:border-b-0 sm:border-r">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-primary/10">
            <MessageSquareText className="h-5 w-5 text-primary" />
          </div>

          <p className="text-xl font-bold">{reviewCount}</p>

          <p className="mt-1 text-sm text-muted-foreground">Reviews</p>
        </div>

        {/* Price */}
        <div className="flex flex-col items-center justify-center border-r p-5 text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-emerald-500/10">
            <Banknote className="h-5 w-5 text-emerald-600" />
          </div>

          <p className="text-lg font-bold sm:text-xl">
            ৳ {shiftCharge.toLocaleString()}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">Shift Charge</p>
        </div>

        {/* Duration */}
        <div className="flex flex-col items-center justify-center p-5 text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-blue-500/10">
            <Clock3 className="h-5 w-5 text-blue-600" />
          </div>

          <p className="text-lg font-bold sm:text-xl">
            {shiftHour} Hour{shiftHour !== 1 ? "s" : ""}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">Duration</p>
        </div>
      </div>

      {/* ABOUT SERVICE */}
      <div className="">
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          About This Service
          <span className="mt-2 block h-1 w-12 rounded-full bg-[#ae0212]" />
        </h2>

        {service?.description ? (
          <div
            className="
        text-base leading-7 text-foreground/80 px-2

        [&_p]:mb-3
        [&_p:last-child]:mb-0

        [&_strong]:font-bold
        [&_strong]:text-foreground

        [&_ul]:my-3
        [&_ul]:ml-6
        [&_ul]:list-disc

        [&_ol]:my-3
        [&_ol]:ml-6
        [&_ol]:list-decimal

        [&_li]:my-1
      "
            dangerouslySetInnerHTML={{
              __html: cleanRichText(service.description),
            }}
          />
        ) : (
          <p className="text-base leading-7 text-foreground/70">
            No description available yet.
          </p>
        )}
      </div>
    </section>
  );
};

export default ServiceHero;
