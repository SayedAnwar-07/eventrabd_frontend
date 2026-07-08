"use client";

import { useState } from "react";
import { Link } from "react-router-dom";

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

  const detailPath =
    resolvedBrandSlug && service?.id && serviceName
      ? `/event-planner/brands/${resolvedBrandSlug}/services/${service.id}/${serviceName}`
      : "#";

  const goPrevious = () => {
    if (!hasMultipleImages) return;

    setActiveImageIndex((prev) => {
      return prev === 0 ? images.length - 1 : prev - 1;
    });
  };

  const goNext = () => {
    if (!hasMultipleImages) return;

    setActiveImageIndex((prev) => {
      return prev === images.length - 1 ? 0 : prev + 1;
    });
  };

  return (
    <article className="group overflow-hidden border-b border-border bg-background pb-6">
      <div className="relative h-64 w-full overflow-hidden bg-muted">
        {activeImage ? (
          <img
            src={activeImage.url}
            alt={`${formatServiceName(serviceName)} ${safeIndex + 1}`}
            className="h-full w-full object-cover transition duration-300"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <p className="text-sm text-muted-foreground">No Image</p>
          </div>
        )}

        <div className="absolute left-0 top-0 bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          ৳{service?.shift_charge ?? "0.00"}
        </div>

        {hasMultipleImages && (
          <>
            <button
              type="button"
              onClick={goPrevious}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Prev
            </button>

            <button
              type="button"
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Next
            </button>
          </>
        )}

        {hasMultipleImages && (
          <div className="absolute bottom-3 left-3 bg-background px-3 py-1 text-xs font-semibold text-foreground">
            {safeIndex + 1} / {images.length}
          </div>
        )}

        {hasMultipleImages && (
          <div className="absolute bottom-3 right-3 flex gap-1.5">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setActiveImageIndex(index)}
                className={`h-2 w-4 transition ${
                  index === safeIndex ? "bg-primary" : "bg-background/70"
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="py-5">
        <h3 className="text-xl font-semibold text-foreground">
          {formatServiceName(serviceName)}
        </h3>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {service?.description || "No description available."}
        </p>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {service?.shift_hour ? (
            <p>
              <span className="font-medium text-foreground">Shift:</span>{" "}
              {service.shift_hour} hours
            </p>
          ) : null}

          {isGalleryOnlyService ? (
            <p>
              <span className="font-medium text-foreground">Image Limit:</span>{" "}
              {service?.image_limit ?? 0}
            </p>
          ) : null}

          {serviceName === "sound_lighting" ? (
            <>
              <p>
                <span className="font-medium text-foreground">Sound:</span> ৳
                {service?.sound_system_payment ?? "N/A"}
              </p>

              <p>
                <span className="font-medium text-foreground">Lighting:</span> ৳
                {service?.lighting_payment ?? "N/A"}
              </p>
            </>
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap gap-4">
          <Link
            to={detailPath}
            className="text-sm font-medium text-foreground underline underline-offset-4 hover:text-primary"
          >
            View Service Details
          </Link>

          {service?.drive_link ? (
            <a
              href={service.drive_link}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              View Portfolio
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
};

export default ServiceCard;
