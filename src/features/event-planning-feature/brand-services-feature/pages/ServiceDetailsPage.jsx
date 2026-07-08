import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { fetchEventServiceDetail } from "@/store/features/eventService/eventServiceSlice";

import {
  selectCurrentService,
  selectCurrentServiceLoading,
  selectCurrentServiceError,
  selectCurrentServiceGallery,
} from "@/store/features/eventService/eventServiceSelector";

import EventServiceSheet from "../components/EventServiceSheet";
import ServiceDelete from "../components/ServiceDelete";

const formatServiceName = (name = "") => {
  return name
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getSafeImageUrl = (url) => {
  if (!url) return "";
  return url.startsWith("http://") ? url.replace("http://", "https://") : url;
};

const COVER_PHOTO_ONLY_SERVICE_TYPES = ["videography", "sound_lighting"];

const ServiceDetailsPage = () => {
  const { brandSlug, serviceId, serviceName } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const service = useSelector(selectCurrentService);
  const loading = useSelector(selectCurrentServiceLoading);
  const error = useSelector(selectCurrentServiceError);
  const galleryImages = useSelector(selectCurrentServiceGallery);

  const isOwner = service?.brand?.is_owner === true;
  const isCoverPhotoOnly = COVER_PHOTO_ONLY_SERVICE_TYPES.includes(
    service?.service_name,
  );

  const safeCoverPhotoUrl = getSafeImageUrl(service?.cover_photo_url);

  const refreshServiceDetail = () => {
    dispatch(
      fetchEventServiceDetail({
        brandSlug,
        serviceId: service?.id || serviceId,
        serviceName: service?.slug || service?.service_name || serviceName,
      }),
    );
  };

  const handleDeleteSuccess = () => {
    navigate(`/event-planner/brands/${brandSlug}`);
  };

  useEffect(() => {
    if (brandSlug && serviceId && serviceName) {
      dispatch(
        fetchEventServiceDetail({
          brandSlug,
          serviceId,
          serviceName,
        }),
      );
    }
  }, [dispatch, brandSlug, serviceId, serviceName]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-sm text-gray-600">
        Loading service details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-sm text-red-600">
        Something went wrong while loading service details.
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-sm text-gray-600">
        Service not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-950">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="border-b border-gray-200 pb-10">
          <Link
            to={`/event-planner/brands/${service.brand?.slug || brandSlug}`}
            className="mb-6 inline-block text-sm font-medium text-gray-950 underline underline-offset-4 hover:text-gray-600"
          >
            ← Back to Brand
          </Link>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="mb-3 inline-block bg-gray-950 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-white">
                    Event Service
                  </p>

                  <h1 className="text-4xl font-semibold tracking-tight text-gray-950 sm:text-5xl">
                    {formatServiceName(service.service_name)}
                  </h1>
                </div>

                {isOwner ? (
                  <div className="flex shrink-0 items-center gap-3">
                    <EventServiceSheet
                      brandSlug={brandSlug}
                      service={service}
                      serviceId={service?.id}
                      serviceName={service?.slug || service?.service_name}
                      onSuccess={refreshServiceDetail}
                      trigger={
                        <button
                          type="button"
                          className="bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                        >
                          Edit Service
                        </button>
                      }
                    />

                    <ServiceDelete
                      brandSlug={brandSlug}
                      serviceId={service.id}
                      serviceName={service.slug || service.service_name}
                      serviceTitle={formatServiceName(service.service_name)}
                      onSuccess={handleDeleteSuccess}
                      trigger={
                        <button
                          type="button"
                          className="bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                        >
                          Delete Service
                        </button>
                      }
                    />
                  </div>
                ) : null}
              </div>

              <p className="max-w-3xl text-base leading-7 text-gray-600">
                {service.description || "No description available."}
              </p>

              <div className="mt-8 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-3">
                <div className="border-l-2 border-gray-950 pl-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Brand
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-950">
                    {service.brand?.brand_name || "N/A"}
                  </p>
                </div>

                <div className="border-l-2 border-gray-950 pl-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Charge
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-950">
                    ৳{service.shift_charge}
                  </p>
                </div>

                <div className="border-l-2 border-gray-950 pl-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Shift
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-950">
                    {service.shift_hour ? `${service.shift_hour} hours` : "N/A"}
                  </p>
                </div>
              </div>

              {service.drive_link ? (
                <a
                  href={service.drive_link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-8 inline-block bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                  View Portfolio
                </a>
              ) : null}
            </div>

            <aside className="bg-gray-950 p-6 text-white">
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-gray-300">
                Summary
              </p>

              <h2 className="text-2xl font-semibold">Service Info</h2>

              <div className="mt-6 space-y-3 text-sm text-gray-300">
                <p>
                  <span className="font-medium text-white">Service:</span>{" "}
                  {formatServiceName(service.service_name)}
                </p>

                <p>
                  <span className="font-medium text-white">Area:</span>{" "}
                  {service.brand?.service_area || "N/A"}
                </p>

                <p>
                  <span className="font-medium text-white">Image Limit:</span>{" "}
                  {service.image_limit ?? 0}
                </p>

                <p>
                  <span className="font-medium text-white">Slug:</span>{" "}
                  {service.slug}
                </p>
              </div>
            </aside>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-12 py-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
              Media
            </p>

            <h2 className="mt-1 text-3xl font-semibold text-gray-950">
              {isCoverPhotoOnly ? "Cover Photo" : "Gallery Images"}
            </h2>

            <div className="mt-8">
              {isCoverPhotoOnly ? (
                safeCoverPhotoUrl ? (
                  <div className="border border-gray-200 bg-white">
                    <img
                      src={safeCoverPhotoUrl}
                      alt={formatServiceName(service.service_name)}
                      className="h-96 w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="border border-dashed border-gray-300 px-6 py-12 text-center text-sm text-gray-500">
                    No cover photo added yet.
                  </div>
                )
              ) : galleryImages.length === 0 ? (
                <div className="border border-dashed border-gray-300 px-6 py-12 text-center text-sm text-gray-500">
                  No gallery images added yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {galleryImages.map((image) => (
                    <div key={image.id} className="border border-gray-200">
                      <img
                        src={getSafeImageUrl(image.image_url)}
                        alt={`Gallery ${image.sort_order}`}
                        className="h-72 w-full object-cover"
                      />

                      <div className="border-t border-gray-200 px-4 py-3 text-sm text-gray-600">
                        Sort Order: {image.sort_order}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-10 lg:border-l lg:border-gray-200 lg:pl-8">
            <section>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
                Details
              </p>

              <h2 className="mt-1 text-2xl font-semibold text-gray-950">
                Pricing Details
              </h2>

              <div className="mt-6 space-y-4 text-sm text-gray-700">
                <p>
                  <span className="font-medium text-gray-950">
                    Shift Charge:
                  </span>{" "}
                  ৳{service.shift_charge}
                </p>

                <p>
                  <span className="font-medium text-gray-950">Shift Hour:</span>{" "}
                  {service.shift_hour ? `${service.shift_hour} hours` : "N/A"}
                </p>

                {service.service_name === "sound_lighting" ? (
                  <>
                    <p>
                      <span className="font-medium text-gray-950">
                        Sound System:
                      </span>{" "}
                      {service.sound_system_payment
                        ? `৳${service.sound_system_payment}`
                        : "Not included"}
                    </p>

                    <p>
                      <span className="font-medium text-gray-950">
                        Lighting:
                      </span>{" "}
                      {service.lighting_payment
                        ? `৳${service.lighting_payment}`
                        : "Not included"}
                    </p>
                  </>
                ) : null}
              </div>
            </section>

            <section>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
                Brand
              </p>

              <h2 className="mt-1 text-2xl font-semibold text-gray-950">
                Brand Info
              </h2>

              <div className="mt-6 space-y-4 text-sm text-gray-700">
                <p>
                  <span className="font-medium text-gray-950">Brand:</span>{" "}
                  {service.brand?.brand_name || "N/A"}
                </p>

                <p>
                  <span className="font-medium text-gray-950">Area:</span>{" "}
                  {service.brand?.service_area || "N/A"}
                </p>

                <p>
                  <span className="font-medium text-gray-950">Brand Slug:</span>{" "}
                  {service.brand?.slug || brandSlug}
                </p>

                <p>
                  <span className="font-medium text-gray-950">
                    Service Slug:
                  </span>{" "}
                  {service.slug}
                </p>
              </div>
            </section>
          </aside>
        </section>
      </main>
    </div>
  );
};

export default ServiceDetailsPage;
