import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import ImageModal from "@/components/common/ImageModal";

const getSafeImageUrl = (url) => {
  if (!url) return "";

  return url.startsWith("http://") ? url.replace("http://", "https://") : url;
};

const ServiceGalleryCarousel = ({ service, galleryImages = [] }) => {
  const images =
    galleryImages.length > 0
      ? galleryImages
          .map((item) => getSafeImageUrl(item.image_url))
          .filter(Boolean)
      : service?.cover_photo_url
        ? [getSafeImageUrl(service.cover_photo_url)]
        : [];

  const [activeIndex, setActiveIndex] = useState(0);

  const [modalImage, setModalImage] = useState(null);

  const [touchStart, setTouchStart] = useState(null);

  const [touchEnd, setTouchEnd] = useState(null);

  if (!images.length) {
    return (
      <div className="flex h-80 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
        No images available
      </div>
    );
  }

  const nextImage = () => {
    if (images.length <= 1) return;

    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const previousImage = () => {
    if (images.length <= 1) return;

    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleTouchStart = (event) => {
    if (images.length <= 1) return;

    setTouchEnd(null);

    setTouchStart(event.targetTouches[0].clientX);
  };

  const handleTouchMove = (event) => {
    if (images.length <= 1) return;

    setTouchEnd(event.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart === null || touchEnd === null) {
      return;
    }

    const distance = touchStart - touchEnd;

    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      nextImage();
    }

    if (distance < -minSwipeDistance) {
      previousImage();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <>
      <section className="flex flex-col gap-3 overflow-hidden rounded-md md:flex-row">
        {/* Main Image */}
        <div
          className="relative aspect-4/3 w-full touch-pan-y select-none overflow-hidden rounded-md bg-muted sm:aspect-16/7"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={images[activeIndex]}
            alt={service?.service_name || "Service image"}
            draggable="false"
            onClick={() => setModalImage(images[activeIndex])}
            className="h-full w-full cursor-pointer select-none object-cover transition-transform duration-500 hover:scale-[1.02]"
          />

          {/* Previous */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                previousImage();
              }}
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md bg-background/90 shadow-md backdrop-blur transition hover:bg-background"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          {/* Next */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                nextImage();
              }}
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md bg-background/90 shadow-md backdrop-blur transition hover:bg-background"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}

          {/* Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
              {images.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();

                    setActiveIndex(index);
                  }}
                  className={`h-1.5 rounded-md transition-all ${
                    activeIndex === index ? "w-5 bg-white" : "w-1.5 bg-white/60"
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto p-1 md:flex-col">
            {images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`shrink-0 overflow-hidden rounded-md border ${
                  activeIndex === index
                    ? "border-primary"
                    : "border-transparent"
                }`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  draggable="false"
                  className="h-20 w-28 object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </section>

      <ImageModal
        image={modalImage}
        open={!!modalImage}
        onClose={() => setModalImage(null)}
      />
    </>
  );
};

export default ServiceGalleryCarousel;
