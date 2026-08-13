"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  MessageCircle,
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

const formatLocation = (division, district) => {
  return [district, division]
    .filter(Boolean)
    .map((value) =>
      String(value)
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) => char.toUpperCase()),
    )
    .join(", ");
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

const getWhatsAppUrl = (number) => {
  if (!number) return null;

  const normalizedNumber = String(number).replace(/\D/g, "");

  if (!normalizedNumber) return null;

  return `https://wa.me/${normalizedNumber}`;
};

const Rating = ({ value, count, size = "default" }) => {
  const numericRating = Number(value || 0);

  return (
    <div className="flex items-center gap-1.5">
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
        <span className="text-xs text-muted-foreground">({count})</span>
      )}
    </div>
  );
};

const PublicServiceCard = ({ service }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const serviceName = service?.service_name || "";

  const brand = service?.brand || {};
  const seller = service?.seller || {};

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

  const location = formatLocation(brand?.division, brand?.district);

  const whatsappUrl = getWhatsAppUrl(seller?.whatsapp_number);

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
    <article className="group overflow-hidden rounded-md border border-border bg-card shadow-sm transition-shadow duration-300 hover:shadow-md">
      {/* Image */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
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

        {/* Price */}
        <div className="absolute left-3 top-3 rounded-md bg-background/95 px-3 py-1.5 shadow-sm backdrop-blur">
          <p className="text-sm font-bold text-foreground">
            ৳{service?.shift_charge ?? "0.00"}
          </p>
        </div>

        {/* Service Rating */}
        <div className="absolute right-3 top-3 rounded-md bg-background/95 px-2.5 py-1.5 shadow-sm backdrop-blur">
          <Rating
            value={service?.rating}
            count={service?.review_count}
            size="small"
          />
        </div>

        {/* Previous */}
        {hasMultipleImages && (
          <button
            type="button"
            onClick={goPrevious}
            aria-label="Previous image"
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur transition hover:bg-background"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {/* Next */}
        {hasMultipleImages && (
          <button
            type="button"
            onClick={goNext}
            aria-label="Next image"
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur transition hover:bg-background"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        {/* Image Counter */}
        {hasMultipleImages && (
          <div className="absolute bottom-3 left-3 rounded-md bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur">
            {safeIndex + 1} / {images.length}
          </div>
        )}

        {/* Slider Indicator */}
        {hasMultipleImages && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setActiveImageIndex(index)}
                aria-label={`Go to image ${index + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  index === safeIndex
                    ? "w-5 bg-primary"
                    : "w-1.5 bg-background/80"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Service */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-foreground">
              {serviceTitle}
            </h3>

            {service?.shift_hour ? (
              <div className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock3 className="h-4 w-4 shrink-0" />

                <span>
                  {service.shift_hour} hour
                  {Number(service.shift_hour) > 1 ? "s" : ""} shift
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Description */}
        {service?.description ? (
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {service.description}
          </p>
        ) : null}

        {/* Brand */}
        <div className="mt-4 border-t border-border pt-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
              {brand?.logo_url ? (
                <img
                  src={brand.logo_url}
                  alt={brandName}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                  {brandName?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold text-foreground">
                  {brandName}
                </p>

                <Rating
                  value={brand?.rating}
                  count={brand?.review_count}
                  size="small"
                />
              </div>

              {location ? (
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />

                  <span className="truncate">{location}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Seller */}
        <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-muted/40 p-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-muted">
              {seller?.profile_image_url ? (
                <img
                  src={seller.profile_image_url}
                  alt={seller?.full_name || "Seller"}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted-foreground">
                  {seller?.full_name?.charAt(0)?.toUpperCase() || "S"}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Seller</p>

              <p className="truncate text-sm font-medium text-foreground">
                {seller?.full_name || "Unknown Seller"}
              </p>
            </div>
          </div>

          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`Contact ${seller?.full_name || "seller"} on WhatsApp`}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground transition hover:border-primary hover:text-primary"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          ) : null}
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between gap-4">
          <Link
            to={detailPath}
            className="text-sm font-semibold text-primary hover:underline hover:underline-offset-4"
          >
            View Service Details
          </Link>

          {service?.drive_link ? (
            <a
              href={service.drive_link}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              Portfolio
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
};

export default PublicServiceCard;
