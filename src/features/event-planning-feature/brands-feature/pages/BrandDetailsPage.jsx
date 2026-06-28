import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchBrandBySlug,
  clearPublicBrandDetails,
} from "@/store/features/eventPlanner/eventPlannerSlice";
import BrandDeleteDialog from "../components/BrandDeleteDialog";

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

  if (publicDetails.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading brand publicDetails...
      </div>
    );
  }

  if (publicDetails.errorMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {publicDetails.errorMessage}
      </div>
    );
  }

  if (!publicBrandDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
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
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-rose-600 mb-2">
                  Event Planner Brand
                </p>

                {publicBrandDetails?.is_owner && (
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
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

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
                {publicBrandDetails.brand_name}
              </h1>

              <p className="mt-4 text-gray-600 text-base sm:text-lg leading-relaxed max-w-3xl">
                {publicBrandDetails.short_description ||
                  "No description available."}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm">
                  📍 {publicBrandDetails.service_area}
                </span>

                <span className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm">
                  🧾 {services.length} Services
                </span>
              </div>
            </div>

            <div className="bg-gray-50 border rounded-2xl p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Contact Brand
              </h2>

              <p className="text-sm text-gray-600 mb-4">
                Contact this brand directly for booking or package
                publicDetails.
              </p>

              {publicBrandDetails.whatsapp_number && (
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition"
                >
                  WhatsApp: {publicBrandDetails.whatsapp_number}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold text-gray-900">
                Available Services
              </h2>
            </div>

            {services.length === 0 ? (
              <div className="bg-white border rounded-2xl p-8 text-center text-gray-500">
                No services added yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition"
                  >
                    <div className="h-56 bg-gray-100">
                      {service.cover_photo_url ? (
                        <img
                          src={service.cover_photo_url}
                          alt={service.service_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className="text-xl font-bold text-gray-900">
                          {formatServiceName(service.service_name)}
                        </h3>

                        <span className="shrink-0 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-semibold">
                          ৳{service.shift_charge}
                        </span>
                      </div>

                      <p className="text-gray-600 text-sm leading-relaxed mb-4">
                        {service.description || "No description available."}
                      </p>

                      <div className="space-y-2 text-sm text-gray-700">
                        {service.shift_hour && (
                          <p>
                            <span className="font-semibold">Shift Hour:</span>{" "}
                            {service.shift_hour} hours
                          </p>
                        )}

                        {service.sound_system_payment && (
                          <p>
                            <span className="font-semibold">Sound System:</span>{" "}
                            ৳{service.sound_system_payment}
                          </p>
                        )}

                        {service.lighting_payment && (
                          <p>
                            <span className="font-semibold">Lighting:</span> ৳
                            {service.lighting_payment}
                          </p>
                        )}

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
                          className="mt-5 inline-flex w-full justify-center rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                        >
                          View Portfolio
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <aside className="space-y-6">
            {seller && (
              <div className="bg-white border rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-5">
                  Seller Info
                </h2>

                <div className="flex items-center gap-4 mb-5">
                  {seller.profile_image_url ? (
                    <img
                      src={seller.profile_image_url}
                      alt={seller.full_name}
                      className="w-20 h-20 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
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

            <div className="bg-white border rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
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
