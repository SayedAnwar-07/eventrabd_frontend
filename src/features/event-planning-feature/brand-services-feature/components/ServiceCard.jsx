"use client";

import { useState } from "react";
import { Link } from "react-router-dom";

import {
  Camera,
  Building2,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Clock,
  Lightbulb,
  ArrowUpRight,
} from "lucide-react";

import ImageModal from "@/components/common/ImageModal";

const GALLERY_ONLY_SERVICE_TYPES = [
  "photography",
  "stage_designer",
  "event_hall",
];

const COVER_PHOTO_ONLY_SERVICE_TYPES = ["videography", "sound_lighting"];

const SERVICE_ICONS = {
  photography: Camera,
  videography: Clapperboard,
  stage_designer: Building2,
  sound_lighting: Lightbulb,
  event_hall: Building2,
};

const ServiceTypeIcon = ({ serviceName, className = "h-4 w-4" }) => {
  const Icon = SERVICE_ICONS[serviceName] || BriefcaseBusiness;
  return <Icon className={className} />;
};

const formatServiceName = (value = "") =>
  value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());

const getGalleryImages = (service) => {
  if (!service || !GALLERY_ONLY_SERVICE_TYPES.includes(service.service_name)) {
    return [];
  }

  if (!Array.isArray(service.gallery_images)) return [];

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
  if (
    !service ||
    !COVER_PHOTO_ONLY_SERVICE_TYPES.includes(service.service_name)
  ) {
    return [];
  }

  if (!service.cover_photo_url) return [];

  return [
    {
      id: "cover_photo",
      url: service.cover_photo_url,
    },
  ];
};

const ServiceCard = ({ service, brandSlug }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [modalImage, setModalImage] = useState(null);
  const [dragStart, setDragStart] = useState(null);

  const serviceName = service?.service_name || "";
  const resolvedBrandSlug = brandSlug || service?.brand?.slug || "";

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

  const detailPath =
    resolvedBrandSlug && service?.id && serviceName
      ? `/event-planner/brands/${resolvedBrandSlug}/services/${service.id}/${serviceName}`
      : "#";

  const shiftHour = Number(service?.shift_hour);

  const price = Number(service?.shift_charge || 0);

  const goPrevious = () => {
    if (!hasMultipleImages) return;

    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goNext = () => {
    if (!hasMultipleImages) return;

    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleDragStart = (clientX) => {
    if (!hasMultipleImages) return;
    setDragStart(clientX);
  };

  const handleDragEnd = (clientX) => {
    if (!hasMultipleImages || dragStart === null) return;

    const distance = dragStart - clientX;

    if (distance > 50) goNext();
    if (distance < -50) goPrevious();

    setDragStart(null);
  };

  return (
    <>
      <article className="group flex h-full flex-col overflow-hidden rounded-md border border-gray-300 bg-card shadow-sm transition-all duration-300 hover:shadow-md">
        {/* IMAGE */}
        <div
          className="relative w-full cursor-grab select-none overflow-hidden bg-muted active:cursor-grabbing"
          onMouseDown={(e) => handleDragStart(e.clientX)}
          onMouseUp={(e) => handleDragEnd(e.clientX)}
          onMouseLeave={() => setDragStart(null)}
          onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
          onTouchEnd={(e) => handleDragEnd(e.changedTouches[0].clientX)}
        >
          {activeImage ? (
            <img
              src={activeImage.url}
              alt={`${serviceTitle} ${safeIndex + 1}`}
              onClick={() => setModalImage(activeImage.url)}
              draggable="false"
              className="h-60 w-full cursor-pointer object-cover transition-transform duration-500"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <ServiceTypeIcon serviceName={serviceName} className="h-9 w-9" />
              <p className="text-sm">No image yet</p>
            </div>
          )}

          {/* IMAGE COUNTER */}
          {hasImages && (
            <span className="absolute left-3 top-3 rounded-md border border-white/30 bg-black/45 px-2.5 py-1 text-xs font-semibold tabular-nums text-white backdrop-blur-sm">
              {safeIndex + 1} / {images.length}
            </span>
          )}

          {/* PREVIOUS IMAGE */}
          {hasMultipleImages && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goPrevious();
              }}
              className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md border border-border/50 bg-background/90 text-foreground shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-theme-color hover:text-primary-foreground md:opacity-0 md:group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}

          {/* NEXT IMAGE */}
          {hasMultipleImages && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md border border-border/50 bg-background/90 text-foreground shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-theme-color hover:text-primary-foreground md:opacity-0 md:group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}

          {/* IMAGE INDICATORS */}
          {hasMultipleImages && (
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-md bg-black/40 px-2 py-1.5 backdrop-blur-sm">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex(index);
                  }}
                  className={`h-1 rounded-md transition-all duration-300 ${
                    index === safeIndex
                      ? "w-7 bg-white"
                      : "w-5 bg-white/50 hover:bg-white/80"
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="flex flex-1 flex-col p-4">
          {/* SERVICE TITLE AND PRICE */}
          <div className="flex items-start justify-between gap-3">
            {/* SERVICE INFORMATION */}
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-lg font-bold tracking-tight text-foreground">
                {serviceTitle}
              </h3>

              {shiftHour > 0 && (
                <span className="text-xs text-gray-600 font-bold">
                 {shiftHour} {shiftHour > 1 ? "hours" : "hour"} shift
                </span>
              )}
            </div>

            {/* PRICE */}
            <div className="shrink-0 pt-0.5 text-right">
              <p className="text-xs font-medium text-muted-foreground">
                Starting at
              </p>

              <div className="mt-1 flex items-baseline justify-end gap-0.5 text-theme-color">
                <span className="text-base font-semibold">৳</span>
                <span className="text-2xl font-bold leading-none tracking-tight tabular-nums">
                  {price.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* VIEW DETAILS */}
          <Link
            to={detailPath}
            className="mt-4 flex h-11 w-full items-center justify-between rounded-md bg-theme-color pl-4 pr-1.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-300 hover:bg-theme-secondary-color hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.99]"
          >
            <span>View details</span>

            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/15 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:bg-white/25">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </article>

      {/* IMAGE MODAL */}
      <ImageModal
        image={modalImage}
        open={!!modalImage}
        onClose={() => setModalImage(null)}
      />
    </>
  );
};

export default ServiceCard;
