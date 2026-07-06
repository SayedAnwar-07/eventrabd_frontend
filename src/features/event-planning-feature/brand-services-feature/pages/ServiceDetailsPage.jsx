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

const formatServiceName = (name) => {
  if (!name) return "";
  return name
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const ServiceDetailsPage = () => {
  const { brandSlug, serviceName } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const service = useSelector(selectCurrentService);
  const loading = useSelector(selectCurrentServiceLoading);
  const error = useSelector(selectCurrentServiceError);
  const galleryImages = useSelector(selectCurrentServiceGallery);
  const isOwner = service?.brand?.is_owner === true;

  const refreshServiceDetail = () => {
    dispatch(
      fetchEventServiceDetail({
        brandSlug,
        serviceName: service?.slug || serviceName,
      }),
    );
  };

  const handleDeleteSuccess = () => {
    navigate(`/event-planner/brands/${brandSlug}`);
  };

  useEffect(() => {
    if (brandSlug && serviceName) {
      dispatch(fetchEventServiceDetail({ brandSlug, serviceName }));
    }
  }, [dispatch, brandSlug, serviceName]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading service details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Something went wrong while loading service details.
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Service not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link
            to={`/event-planner/brands/${service.brand?.slug}`}
            className="inline-block mb-6 text-sm font-semibold text-rose-600 hover:text-rose-700"
          >
            ← Back to Brand
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              <p className="text-sm font-medium text-rose-600 mb-2">
                {service.brand?.brand_name}
              </p>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
                  {formatServiceName(service.service_name)}
                </h1>

                {isOwner ? (
                  <div className="flex flex-wrap gap-3">
                    <EventServiceSheet
                      brandSlug={brandSlug}
                      service={service}
                      onSuccess={refreshServiceDetail}
                      trigger={
                        <button
                          type="button"
                          className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
                        >
                          Edit Service
                        </button>
                      }
                    />

                    <ServiceDelete
                      brandSlug={brandSlug}
                      serviceName={service.slug}
                      serviceTitle={formatServiceName(service.service_name)}
                      onSuccess={handleDeleteSuccess}
                      trigger={
                        <button
                          type="button"
                          className="rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                        >
                          Delete Service
                        </button>
                      }
                    />
                  </div>
                ) : null}
              </div>

              <p className="mt-4 text-gray-600 text-base sm:text-lg leading-relaxed max-w-3xl">
                {service.description || "No description available."}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm">
                  📍 {service.brand?.service_area}
                </span>

                <span className="px-4 py-2 rounded-full bg-rose-50 text-rose-600 text-sm font-semibold">
                  ৳{service.shift_charge}
                </span>

                {service.shift_hour && (
                  <span className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm">
                    ⏱ {service.shift_hour} Hours
                  </span>
                )}
              </div>
            </div>

            <div className="bg-white border rounded-2xl p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Service Summary
              </h2>

              <div className="space-y-3 text-sm text-gray-700">
                <p>
                  <span className="font-semibold">Brand:</span>{" "}
                  {service.brand?.brand_name}
                </p>

                <p>
                  <span className="font-semibold">Service:</span>{" "}
                  {formatServiceName(service.service_name)}
                </p>

                <p>
                  <span className="font-semibold">Charge:</span> ৳
                  {service.shift_charge}
                </p>

                <p>
                  <span className="font-semibold">Image Limit:</span>{" "}
                  {service.image_limit}
                </p>
              </div>

              {service.drive_link && (
                <a
                  href={service.drive_link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex w-full justify-center rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-700 transition"
                >
                  View Portfolio
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {service.cover_photo_url && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
            <img
              src={service.cover_photo_url}
              alt={service.service_name}
              className="w-full h-70 sm:h-105 object-cover"
            />
          </div>
        </section>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 bg-white border rounded-2xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-5">
              Service Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="border rounded-xl p-4">
                <p className="font-semibold text-gray-900">Shift Charge</p>
                <p className="mt-1">৳{service.shift_charge}</p>
              </div>

              <div className="border rounded-xl p-4">
                <p className="font-semibold text-gray-900">Shift Hour</p>
                <p className="mt-1">
                  {service.shift_hour ? `${service.shift_hour} hours` : "N/A"}
                </p>
              </div>

              <div className="border rounded-xl p-4">
                <p className="font-semibold text-gray-900">Sound System</p>
                <p className="mt-1">
                  {service.sound_system_payment
                    ? `৳${service.sound_system_payment}`
                    : "Not included"}
                </p>
              </div>

              <div className="border rounded-xl p-4">
                <p className="font-semibold text-gray-900">Lighting</p>
                <p className="mt-1">
                  {service.lighting_payment
                    ? `৳${service.lighting_payment}`
                    : "Not included"}
                </p>
              </div>
            </div>
          </section>

          <aside className="bg-white border rounded-2xl p-6 shadow-sm h-fit">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Brand Info</h2>

            <div className="space-y-3 text-sm text-gray-700">
              <p>
                <span className="font-semibold">Brand:</span>{" "}
                {service.brand?.brand_name}
              </p>

              <p>
                <span className="font-semibold">Area:</span>{" "}
                {service.brand?.service_area}
              </p>

              <p>
                <span className="font-semibold">Brand Slug:</span>{" "}
                {service.brand?.slug}
              </p>

              <p>
                <span className="font-semibold">Service Slug:</span>{" "}
                {service.slug}
              </p>
            </div>
          </aside>
        </div>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-5">
            Gallery Images
          </h2>

          {galleryImages.length === 0 ? (
            <div className="bg-white border rounded-2xl p-8 text-center text-gray-500">
              No gallery images added yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryImages.map((image) => (
                <div
                  key={image.id}
                  className="bg-white border rounded-2xl overflow-hidden shadow-sm"
                >
                  <img
                    src={image.image_url}
                    alt={`Gallery ${image.sort_order}`}
                    className="w-full h-64 object-cover"
                  />

                  <div className="p-4 text-sm text-gray-600">
                    Sort Order: {image.sort_order}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ServiceDetailsPage;
