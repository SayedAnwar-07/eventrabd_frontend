import { useState } from "react";

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

  if (!images.length) {
    return (
      <div className="flex h-80 items-center justify-center border border-dashed rounded-md text-sm text-muted-foreground">
        No images available
      </div>
    );
  }

  const nextImage = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const previousImage = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <section className="overflow-hidden rounded-md flex gap-3 flex-col md:flex-row">
      {/* <div className="relative w-full h-140 aspect-4/3 overflow-hidden">
        <img
          src={images[activeIndex]}
          alt={service?.service_name || "Service image"}
          className="h-full w-full object-cover transition-all duration-500 rounded-md"
        /> */}

      <div
        className="relative w-full rounded-md overflow-hidden bg-gray-100"
        style={{ height: "clamp(200px, 40vw, 450px)" }}
      >
        {/* Blurred fill background */}
        <img
          src={images[activeIndex]}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover scale-110 blur-2xl opacity-60"
        />

        {/* Sharp, fully-visible image on top */}
        <img
          src={images[activeIndex]}
          alt={service?.service_name || "Service image"}
          className="relative h-full w-full object-contain transition-all duration-500 rounded-md"
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
                onClick={() => setActiveIndex(index)}
                className={`h-2 w-2 rounded-full ${activeIndex === index ? "bg-primary" : "bg-white/70"}`}
              />
            ))}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex flex-row md:flex-col gap-3 overflow-x-auto border-t md:border-0 p-3">
          {images.map((image, index) => (
            <button
              key={image}
              onClick={() => setActiveIndex(index)}
              className={`shrink-0 overflow-hidden rounded-md border ${
                activeIndex === index ? "border-primary" : "border-transparent"
              }`}
            >
              <img
                src={image}
                alt="thumbnail"
                className="h-16 w-24 object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default ServiceGalleryCarousel;
