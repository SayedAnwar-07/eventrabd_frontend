"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BadgeCheck,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  MapPin,
  Phone,
  Send,
  Star,
} from "lucide-react";

const GALLERY_ONLY_SERVICE_TYPES = [
  "photography",
  "stage_designer",
  "event_hall",
];

const COVER_PHOTO_ONLY_SERVICE_TYPES = ["videography", "sound_lighting"];

const formatServiceName = (value = "") => {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatLocation = (division) => {
  if (!Array.isArray(division) || division.length === 0) {
    return [];
  }

  return division.filter(Boolean).map((value) =>
    String(value)
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase()),
  );
};

const getGalleryImages = (service) => {
  if (!service) return [];

  if (!GALLERY_ONLY_SERVICE_TYPES.includes(service.service_name)) {
    return [];
  }

  if (!Array.isArray(service.gallery_images)) {
    return [];
  }

  return [...service.gallery_images]
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((image) => ({
      id: image.id,
      url:
        image.image_url || image.gallery_image_url || image.url || image.image,
    }))
    .filter((image) => image.url);
};

const getCoverPhotoImage = (service) => {
  if (!service) return [];

  if (!COVER_PHOTO_ONLY_SERVICE_TYPES.includes(service.service_name)) {
    return [];
  }

  if (!service.cover_photo_url) {
    return [];
  }

  return [
    {
      id: "cover_photo",
      url: service.cover_photo_url,
    },
  ];
};

const Rating = ({ value, count, size = "default" }) => {
  const numericRating = Number(value || 0);

  return (
    <div className="flex items-center gap-1">
      <Star
        className={
          size === "small"
            ? "h-3.5 w-3.5 fill-amber-400 text-amber-400"
            : "h-4 w-4 fill-amber-400 text-amber-400"
        }
      />

      <span
        className={
          size === "small"
            ? "text-xs font-semibold text-foreground"
            : "text-sm font-semibold text-foreground"
        }
      >
        {numericRating.toFixed(1)}
      </span>

      {count !== undefined && count !== null && (
        <span className="text-[11px] text-muted-foreground">({count})</span>
      )}
    </div>
  );
};

const PublicServiceCard = ({ service }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const serviceName = service?.service_name || "";

  const brand = service?.brand || {};
  const seller = service?.seller || {};

  const isOwner = brand?.is_owner === true;

  const brandSlug = brand?.slug || "";

  const isGalleryOnlyService = GALLERY_ONLY_SERVICE_TYPES.includes(serviceName);

  const galleryImages = getGalleryImages(service);
  const coverPhotoImages = getCoverPhotoImage(service);

  const images = isGalleryOnlyService ? galleryImages : coverPhotoImages;

  const hasImages = images.length > 0;
  const hasMultipleImages = images.length > 1;

  const safeIndex = hasImages
    ? Math.min(activeImageIndex, images.length - 1)
    : 0;

  const activeImage = hasImages ? images[safeIndex] : null;

  const serviceTitle =
    service?.service_display_name || formatServiceName(serviceName);

  const brandName = brand?.display_name || brand?.brand_name || "Unknown Brand";

  const officeAddress = brand?.office_address || "No office yet";

  const location = formatLocation(brand?.division);

  const detailPath =
    brandSlug && service?.id && serviceName
      ? `/event-planner/brands/${brandSlug}/services/${service.id}/${serviceName}`
      : "#";

  const goPrevious = () => {
    if (!hasMultipleImages) return;

    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goNext = () => {
    if (!hasMultipleImages) return;

    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <article className="group overflow-hidden rounded-md border border-border/60 bg-card shadow-sm transition-all duration-300 hover:shadow-md">
      {/* ================= IMAGE ================= */}
      <div className="relative aspect-4/2.75 w-full overflow-hidden bg-muted">
        {activeImage ? (
          <img
            src={activeImage.url}
            alt={`${serviceTitle} ${safeIndex + 1}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <p className="text-sm text-muted-foreground">No Image</p>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-black/5" />

        {/* ================= PRICE ================= */}
        <div className="absolute left-3 top-3 rounded-md bg-background/95 px-3 py-2 shadow-md backdrop-blur-md">
          <p className="mb-1 text-[11px] font-semibold text-muted-foreground">
            Starting Price
          </p>
          <p className="text-base font-bold leading-none text-foreground">
            ৳ {service?.shift_charge ?? "0.00"}
          </p>
        </div>

        {/* ================= RATING ================= */}
        <div className="absolute right-3 top-3 rounded-md border bg-background/90  px-3 py-2 text-black shadow-md backdrop-blur-md">
          <div className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />

            <span className="text-xs font-semibold">
              {Number(service?.rating || 0).toFixed(1)}
            </span>

            <span className="text-[10px]">
              ({service?.review_count ?? 0})
            </span>
          </div>
        </div>

        {/* ================= SERVICE NAME ================= */}
        <div className="absolute bottom-3 right-3 rounded-md border bg-background/90  px-3 py-2 text-black shadow-md backdrop-blur-md">
          <p className="mb-1 text-[11px] font-semibold text-muted-foreground">
            Service Name
          </p>
          <div className="flex items-center gap-1.5">
            <BriefcaseBusiness className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate text-xs font-semibold">
              {serviceTitle}
            </span>
          </div>
        </div>

        {/* ================= SHIFT ================= */}
        {service?.shift_hour ? (
          <div className="absolute bottom-3 left-3 rounded-md bg-background/95 px-3 py-2 shadow-md backdrop-blur-md">
            <p className="mb-1 text-[11px] font-semibold text-muted-foreground">
              Shift Duration
            </p>
            <div className="flex items-center gap-1.5">
              <Clock3 className="h-4 w-4" />

              <span className="text-sm font-semibold">
                {service.shift_hour} Hour
                {Number(service.shift_hour) > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        ) : null}

        {/* ================= PREVIOUS ================= */}
        {hasMultipleImages && (
          <button
            type="button"
            onClick={goPrevious}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 shadow-md backdrop-blur transition-all hover:bg-background group-hover:opacity-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        {/* ================= NEXT ================= */}
        {hasMultipleImages && (
          <button
            type="button"
            onClick={goNext}
            aria-label="Next image"
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 shadow-md backdrop-blur transition-all hover:bg-background group-hover:opacity-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        {/* ================= SLIDER DOTS ================= */}
        {hasMultipleImages && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setActiveImageIndex(index)}
                aria-label={`Go to image ${index + 1}`}
                className={`h-1.5 rounded-full shadow-sm transition-all ${
                  index === safeIndex ? "w-4 bg-white" : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ================= CONTENT ================= */}
      <div className="p-4">
        {/* ================= SERVICE HEADER ================= */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-border bg-muted shadow-sm">
            {brand?.logo_url ? (
              <img
                src={brand.logo_url}
                alt={brandName}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary text-lg font-bold text-primary-foreground">
                {brandName?.charAt(0)?.toUpperCase()}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-xl font-bold tracking-tight text-foreground">
              {service?.description || brandName}
            </h3>

            {/* Office */}
            <div className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />

              <span className="line-clamp-1">Office : {officeAddress}</span>
            </div>
          </div>
        </div>

        {/* ================= DIVIDER ================= */}
        <div className="my-3.5 border-t border-border" />

        {/* ================= SELLER ================= */}
        <div className="mt-3.5 flex items-center justify-between gap-3 rounded-md bg-muted/50 p-3">
          <div className="flex min-w-0 gap-2.5">
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-background bg-muted shadow-sm">
              {seller?.profile_image_url ? (
                <img
                  src={seller.profile_image_url}
                  alt={seller?.full_name || "Seller"}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                  {seller?.full_name?.charAt(0)?.toUpperCase() || "S"}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {seller?.full_name || "Unknown Seller"}
              </p>
              {location.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Service Providing : </span>

                  <span className="mt-1 flex flex-wrap gap-1.5">
                    {location.map((item) => (
                      <span
                        key={item}
                        className="rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium text-foreground"
                      >
                        {item}
                      </span>
                    ))}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= ACTIONS ================= */}
        <div className="mt-3.5 flex items-center gap-2.5">
          <Link
            to={detailPath}
            className="flex flex-1 items-center justify-center gap-2 rounded-md border border-primary bg-background px-3 py-2.5 text-xs font-semibold text-primary transition-all hover:bg-primary/5"
          >
            <FileText className="h-4 w-4" />
            View Details
          </Link>

          {!isOwner && (
            <Link
              to={detailPath}
              state={{ openHireForm: true }}
              className="flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
            >
              <Send className="h-4 w-4" />
              Hire Now
            </Link>
          )}
        </div>
      </div>
    </article>
  );
};

export default PublicServiceCard;
