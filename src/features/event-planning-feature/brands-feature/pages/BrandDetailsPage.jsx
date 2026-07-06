import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  fetchBrandBySlug,
  clearPublicBrandDetails,
} from "@/store/features/eventPlanner/eventPlannerSlice";

import BrandDeleteDialog from "../components/BrandDeleteDialog";
import EventServiceSheet from "../../brand-services-feature/components/EventServiceSheet";

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
      <div className="flex min-h-screen items-center justify-center text-gray-600">
        Loading brand details...
      </div>
    );
  }

  if (publicDetails.errorMessage) {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-600">
        {publicDetails.errorMessage}
      </div>
    );
  }

  if (!publicBrandDetails) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-600">
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
    <div className="min-h-screen bg-gray-50">
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between gap-4">
                <p className="mb-2 text-sm font-medium text-rose-600">
                  Event Planner Brand
                </p>

                {publicBrandDetails.is_owner && (
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/event-planner/brands/${publicBrandDetails.slug}/edit`,
                        )
                      }
                      className="gradient-button"
                    >
                      Edit Brand
                    </button>

                    <BrandDeleteDialog brand={publicBrandDetails} />
                  </div>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
                {publicBrandDetails.brand_name}
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-relaxed text-gray-600 sm:text-lg">
                {publicBrandDetails.short_description ||
                  "No description available."}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700">
                  📍 {publicBrandDetails.service_area}
                </span>

                <span className="rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700">
                  🧾 {services.length} Services
                </span>
              </div>
            </div>

            <div className="rounded-2xl border bg-gray-50 p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Contact Brand
              </h2>

              <p className="mb-4 text-sm text-gray-600">
                Contact this brand directly for booking or package details.
              </p>

              {publicBrandDetails.whatsapp_number && (
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full rounded-xl bg-green-600 py-3 text-center font-semibold text-white transition hover:bg-green-700"
                >
                  WhatsApp: {publicBrandDetails.whatsapp_number}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Available Services
              </h2>

              {publicBrandDetails.is_owner && (
                <EventServiceSheet
                  brandSlug={publicBrandDetails.slug}
                  trigger={
                    <button type="button" className="gradient-button">
                      Create Service
                    </button>
                  }
                  onSuccess={handleServiceSuccess}
                />
              )}
            </div>

            {services.length === 0 ? (
              <div className="rounded-2xl border bg-white p-8 text-center text-gray-500">
                No services added yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md"
                  >
                    <div className="h-56 bg-gray-100">
                      {service.cover_photo_url ? (
                        <img
                          src={service.cover_photo_url}
                          alt={formatServiceName(service.service_name)}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <h3 className="text-xl font-bold text-gray-900">
                          {formatServiceName(service.service_name)}
                        </h3>

                        <span className="shrink-0 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
                          ৳{service.shift_charge}
                        </span>
                      </div>

                      <p className="mb-4 text-sm leading-relaxed text-gray-600">
                        {service.description || "No description available."}
                      </p>

                      <div className="space-y-2 text-sm text-gray-700">
                        {service.shift_hour && (
                          <p>
                            <span className="font-semibold">Shift Hour:</span>{" "}
                            {service.shift_hour} hours
                          </p>
                        )}

                        <p>
                          <span className="font-semibold">Image Limit:</span>{" "}
                          {service.image_limit}
                        </p>
                      </div>

                      <Link
                        to={`/event-planner/brands/${publicBrandDetails.slug}/services/${service.slug}`}
                        className="mt-5 inline-flex w-full justify-center rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                      >
                        Service Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <aside className="space-y-6">
            {seller && (
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-xl font-bold text-gray-900">
                  Seller Info
                </h2>

                <div className="mb-5 flex items-center gap-4">
                  {seller.profile_image_url ? (
                    <img
                      src={seller.profile_image_url}
                      alt={seller.full_name}
                      className="h-20 w-20 rounded-full border object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                      No Image
                    </div>
                  )}

                  <div>
                    <h3 className="font-bold text-gray-900">
                      {seller.full_name}
                    </h3>

                    <p className="text-sm text-gray-500">@{seller.username}</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-gray-700">
                  <p>
                    <span className="font-semibold">Email:</span> {seller.email}
                  </p>

                  <p>
                    <span className="font-semibold">Phone:</span>{" "}
                    {seller.contact_number}
                  </p>

                  {seller.office_address && (
                    <p>
                      <span className="font-semibold">Office:</span>{" "}
                      {seller.office_address}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-gray-900">
                Brand Summary
              </h2>

              <div className="space-y-3 text-sm text-gray-700">
                <p>
                  <span className="font-semibold">Brand:</span>{" "}
                  {publicBrandDetails.brand_name}
                </p>

                <p>
                  <span className="font-semibold">Area:</span>{" "}
                  {publicBrandDetails.service_area}
                </p>

                <p>
                  <span className="font-semibold">Total Services:</span>{" "}
                  {services.length}
                </p>

                <p>
                  <span className="font-semibold">Slug:</span>{" "}
                  {publicBrandDetails.slug}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default BrandDetailsPage;
