import { useMemo, useState } from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
  fetchBrandBySlug,
  clearPublicBrandDetails,
} from "@/store/features/eventPlanner/eventPlannerSlice";

import BrandDeleteDialog from "../components/BrandDeleteDialog";
import EventServiceSheet from "../../brand-services-feature/components/EventServiceSheet";
import ServiceCard from "../../brand-services-feature/components/ServiceCard";

const GALLERY_ONLY_SERVICE_TYPES = new Set([
  "photography",
  "stage_designer",
  "event_hall",
]);

const COVER_PHOTO_ONLY_SERVICE_TYPES = new Set([
  "videography",
  "sound_lighting",
]);

const formatServiceName = (name) => {
  if (!name) return "";

  return name
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatWhatsAppNumber = (number) => {
  if (!number) return "";

  return number.replace(/\D/g, "");
};

const getGalleryImageUrl = (image) => {
  return (
    image?.image_url ||
    image?.gallery_image_url ||
    image?.url ||
    image?.image ||
    ""
  );
};

const primaryButtonClass =
  "bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50";

const outlineButtonClass =
  "border border-input px-5 py-2.5 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary";

const ServiceImageSlider = ({ service }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const serviceName = service?.service_name || "";

  const isGalleryOnly = GALLERY_ONLY_SERVICE_TYPES.has(serviceName);
  const isCoverPhotoOnly = COVER_PHOTO_ONLY_SERVICE_TYPES.has(serviceName);

  const images = useMemo(() => {
    if (!service) return [];

    if (isGalleryOnly) {
      return Array.isArray(service.gallery_images)
        ? service.gallery_images
            .map((image) => ({
              id: image.id,
              url: getGalleryImageUrl(image),
              alt: formatServiceName(serviceName),
            }))
            .filter((image) => image.url)
        : [];
    }

    if (isCoverPhotoOnly && service.cover_photo_url) {
      return [
        {
          id: "cover-photo",
          url: service.cover_photo_url,
          alt: formatServiceName(serviceName),
        },
      ];
    }

    return [];
  }, [service, serviceName, isGalleryOnly, isCoverPhotoOnly]);

  const hasImages = images.length > 0;
  const hasMultipleImages = images.length > 1;

  const safeIndex = hasImages ? Math.min(activeIndex, images.length - 1) : 0;
  const activeImage = hasImages ? images[safeIndex] : null;

  const goPrev = () => {
    if (!hasMultipleImages) return;

    setActiveIndex((prev) => {
      const current = Math.min(prev, images.length - 1);
      return current === 0 ? images.length - 1 : current - 1;
    });
  };

  const goNext = () => {
    if (!hasMultipleImages) return;

    setActiveIndex((prev) => {
      const current = Math.min(prev, images.length - 1);
      return current === images.length - 1 ? 0 : current + 1;
    });
  };

  return (
    <div className="relative aspect-4/3 overflow-hidden bg-muted">
      {activeImage ? (
        <img
          src={activeImage.url}
          alt={activeImage.alt}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
          No Image
        </div>
      )}

      <div className="absolute left-0 top-0 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
        ৳{service?.shift_charge}
      </div>

      {hasMultipleImages && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            aria-label="Previous image"
          >
            Prev
          </button>

          <button
            type="button"
            onClick={goNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            aria-label="Next image"
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
    </div>
  );
};

const BrandDetailsPage = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { publicBrandDetails, publicDetails } = useSelector(
    (state) => state.eventPlanner,
  );

  useEffect(() => {
    if (slug) {
      dispatch(fetchBrandBySlug(slug));
    }

    return () => {
      dispatch(clearPublicBrandDetails());
    };
  }, [dispatch, slug]);

  useEffect(() => {
    if (publicDetails.redirectInfo?.newSlug) {
      navigate(`/event-planner/brands/${publicDetails.redirectInfo.newSlug}`, {
        replace: true,
      });
    }
  }, [publicDetails.redirectInfo, navigate]);

  const handleServiceSuccess = () => {
    if (publicBrandDetails?.slug) {
      dispatch(fetchBrandBySlug(publicBrandDetails.slug));
    }
  };

  if (publicDetails.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading brand details...
      </div>
    );
  }

  if (publicDetails.errorMessage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-primary">
        {publicDetails.errorMessage}
      </div>
    );
  }

  if (!publicBrandDetails) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Brand not found.
      </div>
    );
  }

  const seller = publicBrandDetails.seller_info;
  const services = publicBrandDetails.services || [];

  const whatsappNumber = formatWhatsAppNumber(
    publicBrandDetails.whatsapp_number,
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid grid-cols-1 gap-8 border-b border-border pb-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="mb-3 inline-block bg-primary px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-primary-foreground">
                  Event Planner Brand
                </p>

                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                  {publicBrandDetails.brand_name}
                </h1>
              </div>

              {publicBrandDetails.is_owner && (
                <div className="flex shrink-0 items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/event-planner/brands/${publicBrandDetails.slug}/edit`,
                      )
                    }
                    className={outlineButtonClass}
                  >
                    Edit Brand
                  </button>

                  <BrandDeleteDialog brand={publicBrandDetails} />
                </div>
              )}
            </div>

            <p className="max-w-3xl text-base leading-7 text-muted-foreground">
              {publicBrandDetails.short_description ||
                "No description available."}
            </p>

            <div className="mt-8 grid max-w-xl grid-cols-2 gap-4">
              <div className="border-l-2 border-primary pl-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Area
                </p>

                <p className="mt-1 text-sm font-medium text-foreground">
                  {publicBrandDetails.service_area}
                </p>
              </div>

              <div className="border-l-2 border-primary pl-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Services
                </p>

                <p className="mt-1 text-sm font-medium text-foreground">
                  {services.length} available
                </p>
              </div>
            </div>
          </div>

          <aside className="bg-primary p-6 text-primary-foreground">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] opacity-80">
              Contact
            </p>

            <h2 className="text-2xl font-semibold">Book this brand</h2>

            <p className="mt-3 text-sm leading-6 opacity-80">
              Contact directly for booking, package details, and availability.
            </p>

            {publicBrandDetails.whatsapp_number && (
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-block bg-background px-5 py-2.5 text-sm font-medium text-foreground transition hover:opacity-90"
              >
                WhatsApp {publicBrandDetails.whatsapp_number}
              </a>
            )}
          </aside>
        </section>

        <section className="grid grid-cols-1 gap-12 py-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Services
                </p>

                <h2 className="mt-1 text-3xl font-semibold text-foreground">
                  Available Services
                </h2>
              </div>

              {publicBrandDetails.is_owner && (
                <EventServiceSheet
                  brandSlug={publicBrandDetails.slug}
                  trigger={
                    <button type="button" className={primaryButtonClass}>
                      Create Service
                    </button>
                  }
                  onSuccess={handleServiceSuccess}
                />
              )}
            </div>
            {services.length === 0 ? (
              <div className="border border-dashed border-border px-6 py-10 text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  No services added yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    brandSlug={publicBrandDetails.slug}
                  />
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-10 lg:border-l lg:border-border lg:pl-8">
            {seller && (
              <section>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Seller
                </p>

                <h2 className="mt-1 text-2xl font-semibold text-foreground">
                  Seller Info
                </h2>

                <div className="mt-6 flex items-center gap-4">
                  {seller.profile_image_url ? (
                    <img
                      src={seller.profile_image_url}
                      alt={seller.full_name}
                      className="h-16 w-16 object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center bg-muted text-xs text-muted-foreground">
                      No Image
                    </div>
                  )}

                  <div>
                    <h3 className="font-medium text-foreground">
                      {seller.full_name}
                    </h3>

                    <p className="text-sm text-muted-foreground">
                      @{seller.username}
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">Email:</span>{" "}
                    {seller.email}
                  </p>

                  <p>
                    <span className="font-medium text-foreground">Phone:</span>{" "}
                    {seller.contact_number}
                  </p>

                  {seller.office_address && (
                    <p>
                      <span className="font-medium text-foreground">
                        Office:
                      </span>{" "}
                      {seller.office_address}
                    </p>
                  )}
                </div>
              </section>
            )}

            <section>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Summary
              </p>

              <h2 className="mt-1 text-2xl font-semibold text-foreground">
                Brand Summary
              </h2>

              <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">Brand:</span>{" "}
                  {publicBrandDetails.brand_name}
                </p>

                <p>
                  <span className="font-medium text-foreground">Area:</span>{" "}
                  {publicBrandDetails.service_area}
                </p>

                <p>
                  <span className="font-medium text-foreground">
                    Total Services:
                  </span>{" "}
                  {services.length}
                </p>

                <p>
                  <span className="font-medium text-foreground">Slug:</span>{" "}
                  {publicBrandDetails.slug}
                </p>
              </div>
            </section>
          </aside>
        </section>
      </main>
    </div>
  );
};

export default BrandDetailsPage;
