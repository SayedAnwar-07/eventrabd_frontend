import { useState } from "react";
import {
  Camera,
  Building2,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Lightbulb,
  Star,
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

const PublicServiceImage = ({ service }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [modalImage, setModalImage] = useState(null);
  const [dragStart, setDragStart] = useState(null);

  const serviceName = service?.service_name || "";

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
    <div
      className="relative aspect-4/2.75 w-full cursor-grab select-none overflow-hidden bg-muted active:cursor-grabbing"
      onMouseDown={(e) => handleDragStart(e.clientX)}
      onMouseUp={(e) => handleDragEnd(e.clientX)}
      onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
      onTouchEnd={(e) => handleDragEnd(e.changedTouches[0].clientX)}
    >
      {activeImage ? (
        <img
          src={activeImage.url}
          alt={`${serviceTitle} ${safeIndex + 1}`}
          onClick={() => setModalImage(activeImage.url)}
          className="h-full w-full cursor-pointer object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <p className="text-sm text-muted-foreground">No Image</p>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-black/5" />

      {/* Price */}
      <div className="absolute right-3 bottom-3 rounded-md bg-background/95 px-3 py-2 shadow-md backdrop-blur-md">
        <p className="text-base font-bold leading-none text-foreground">
          ৳ {Number(service?.shift_charge || 0).toLocaleString()}
        </p>

        {/* <span className="text-sm">
          {service?.shift_hour} Hour
          {Number(service?.shift_hour) > 1 ? "s" : ""}
        </span> */}
      </div>

      {/* Rating */}
      {/* <div className="absolute right-3 top-3 rounded-md border bg-background/90 px-3 py-2 shadow-md backdrop-blur-md">
        <div className="flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />

          <span className="text-xs font-semibold">
            {Number(service?.rating || 0).toFixed(1)}
          </span>

          <span className="text-[10px]">({service?.review_count ?? 0})</span>
        </div>
      </div> */}

      {/* Service Name */}
      <div className="absolute bottom-3 left-3 rounded-md border bg-background/90 px-3 py-2 shadow-md backdrop-blur-md">
        <div className="flex items-center gap-1.5">
          <ServiceTypeIcon serviceName={serviceName} />

          <span className="truncate text-xs font-semibold">{serviceTitle}</span>
        </div>
      </div>

      {/* Previous */}
      {hasMultipleImages && (
        <button
          type="button"
          onClick={goPrevious}
          className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 shadow-md backdrop-blur hover:bg-background"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      {/* Next */}
      {hasMultipleImages && (
        <button
          type="button"
          onClick={goNext}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 shadow-md backdrop-blur hover:bg-background"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* Dots */}
      {hasMultipleImages && (
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveImageIndex(index)}
              className={`h-1.5 rounded-full transition-all ${
                index === safeIndex ? "w-4 bg-white" : "w-1.5 bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
      <ImageModal
        image={modalImage}
        open={!!modalImage}
        onClose={() => setModalImage(null)}
      />
    </div>
  );
};

export default PublicServiceImage;
