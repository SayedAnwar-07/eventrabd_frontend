import { useState } from "react";

import ImageModal from "../ImageModal";

const getSafeImageUrl = (url) => {
  if (!url) return "";

  return url.startsWith("http://") ? url.replace("http://", "https://") : url;
};

const ServiceGalleryCarousel = ({ service, galleryImages = [] }) => {
  const images =
    galleryImages.length > 0
      ? galleryImages.map((item) => getSafeImageUrl(item.image_url))
      : service?.cover_photo_url
        ? [getSafeImageUrl(service.cover_photo_url)]
        : [];

  const [activeIndex, setActiveIndex] = useState(0);

  const [modalImage, setModalImage] = useState(null);

  if (!images.length) {
    return (
      <div className="flex h-80 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
        No images available
      </div>
    );
  }

  const nextImage = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const previousImage = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <>
      <section className="flex flex-col gap-3 overflow-hidden rounded-md md:flex-row">
        <div className="relative aspect-4/3 w-full overflow-hidden rounded-md bg-muted sm:aspect-16/7">
          <img
            src={images[activeIndex]}
            alt={service?.service_name || "Service image"}
            onClick={() => setModalImage(images[activeIndex])}
            className="h-full w-full cursor-pointer object-cover transition-transform duration-500 hover:scale-[1.02]"
          />

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={previousImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-md px-3 py-2 text-sm font-semibold shadow bg-white dark:bg-black"
              >
                Prev
              </button>

              <button
                type="button"
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md px-3 py-2 text-sm font-semibold shadow bg-white dark:bg-black"
              >
                Next
              </button>
            </>
          )}

          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    activeIndex === index ? "w-5 bg-white" : "w-2 bg-white/60"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto p-1 md:flex-col">
            {images.map((image, index) => (
              <button
                key={image}
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
                  alt="thumbnail"
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
