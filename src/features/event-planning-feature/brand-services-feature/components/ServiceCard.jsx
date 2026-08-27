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
  ExternalLink,
  Lightbulb,
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

const ServiceTypeIcon = ({ serviceName }) => {
  const Icon = SERVICE_ICONS[serviceName] || BriefcaseBusiness;

  return <Icon className="h-3.5 w-3.5 shrink-0" />;
};

const formatServiceName = (value = "") => {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
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
    if (!hasMultipleImages || dragStart === null) {
      return;
    }

    const distance = dragStart - clientX;

    if (distance > 50) {
      goNext();
    }

    if (distance < -50) {
      goPrevious();
    }

    setDragStart(null);
  };

  return (
    <>
      <article className="group overflow-hidden rounded-md border bg-background shadow-sm">
        {/* IMAGE */}
        <div
          className="relative aspect-4/2.75 w-full cursor-grab select-none overflow-hidden bg-muted active:cursor-grabbing"
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
              className="h-full w-full cursor-pointer object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <p className="text-sm text-muted-foreground">No Image</p>
            </div>
          )}

          {/* SAME OVERLAY */}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-black/5" />

          {/* PRICE - SAME UI */}
          <div className="absolute right-3 bottom-3 rounded-md bg-background/95 px-3 py-2 shadow-md backdrop-blur-md">
            <p className="text-base font-bold leading-none text-foreground">
              ৳ {Number(service?.shift_charge || 0).toLocaleString()}
            </p>
          </div>

          {/* SERVICE NAME - SAME UI */}
          <div className="absolute bottom-3 left-3 max-w-[55%] rounded-md border bg-background/90 px-3 py-2 shadow-md backdrop-blur-md">
            <div className="flex items-center gap-1.5">
              <ServiceTypeIcon serviceName={serviceName} />

              <span className="truncate text-xs font-semibold">
                {serviceTitle}
              </span>
            </div>
          </div>

          {/* PREVIOUS - SAME UI */}
          {hasMultipleImages && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goPrevious();
              }}
              className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 shadow-md backdrop-blur hover:bg-background"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}

          {/* NEXT - SAME UI */}
          {hasMultipleImages && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 shadow-md backdrop-blur hover:bg-background"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}

          {/* DOTS - SAME UI */}
          {hasMultipleImages && (
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex(index);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    index === safeIndex ? "w-4 bg-white" : "w-1.5 bg-white/60"
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* CARD CONTENT */}
        <div className="p-5">
          <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
            {service?.description || "No description available."}
          </p>

          {/* SERVICE INFORMATION */}
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {service?.shift_hour ? (
              <p>
                <span className="font-medium text-foreground">Shift:</span>{" "}
                {service.shift_hour} Hour
                {Number(service.shift_hour) > 1 ? "s" : ""}
              </p>
            ) : null}

            {serviceName === "sound_lighting" ? (
              <>
                <p>
                  <span className="font-medium text-foreground">Sound:</span> ৳
                  {service?.sound_system_payment ?? "N/A"}
                </p>

                <p>
                  <span className="font-medium text-foreground">Lighting:</span>{" "}
                  ৳{service?.lighting_payment ?? "N/A"}
                </p>
              </>
            ) : null}
          </div>

          {/* ACTIONS */}
          <div className="mt-5 gap-3 border-t pt-4">
            <Link
              to={detailPath}
              className="inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium text-foreground transition hover:bg-muted w-full"
            >
              View Service Details
            </Link>
          </div>
        </div>
      </article>

      <ImageModal
        image={modalImage}
        open={!!modalImage}
        onClose={() => setModalImage(null)}
      />
    </>
  );
};

export default ServiceCard;
