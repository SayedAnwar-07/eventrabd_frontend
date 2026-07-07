import { Link } from "react-router-dom";

const getSafeImageUrl = (url) => {
  if (!url) return "";
  return url.startsWith("http://") ? url.replace("http://", "https://") : url;
};

const getInitials = (name = "") => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const formatServiceName = (value = "") => {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const BrandCard = ({ brand }) => {
  const logoUrl = getSafeImageUrl(brand?.logo_url);
  const sellerImage = getSafeImageUrl(brand?.seller_info?.profile_image_url);

  const serviceCount = brand?.total_services ?? brand?.services?.length ?? 0;
  const services = brand?.services?.slice(0, 3) ?? [];

  return (
    <article className="group relative overflow-hidden rounded-4xl border border-gray-200/80 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)] transition-all duration-500 hover:-translate-y-2 hover:border-rose-200 hover:shadow-[0_25px_80px_rgba(244,63,94,0.18)]">
      {/* Soft Background Glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-rose-200/50 blur-3xl transition-all duration-500 group-hover:bg-rose-300/60" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 h-52 w-52 rounded-full bg-violet-200/40 blur-3xl transition-all duration-500 group-hover:bg-violet-300/50" />

      {/* Top Image / Logo Area */}
      <div className="relative p-4 pb-0">
        <div className="relative flex h-48 items-center justify-center overflow-hidden rounded-[1.6rem] bg-linear-to-br from-gray-950 via-gray-900 to-gray-800">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.35),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.28),transparent_35%)]" />

          {logoUrl ? (
            <img
              src={logoUrl}
              alt={brand?.brand_name || "Brand logo"}
              className="relative z-10 h-24 w-24 rounded-3xl border border-white/20 bg-white object-cover p-2 shadow-2xl transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-3xl border border-white/20 bg-white/10 text-3xl font-black text-white shadow-2xl backdrop-blur">
              {getInitials(brand?.brand_name)}
            </div>
          )}

          {/* Service Count Badge */}
          <div className="absolute left-4 top-4 z-20 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
            {serviceCount} {serviceCount === 1 ? "Service" : "Services"}
          </div>

          {/* Owner Badge */}
          {brand?.is_owner ? (
            <div className="absolute right-4 top-4 z-20 rounded-full border border-emerald-300/30 bg-emerald-400/20 px-3 py-1.5 text-xs font-semibold text-emerald-50 backdrop-blur-md">
              Your Brand
            </div>
          ) : null}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-67.5 flex-col p-5">
        <div>
          <h2 className="text-xl font-black tracking-tight text-gray-950">
            {brand?.brand_name}
          </h2>

          <p className="mt-2 min-h-11 text-sm leading-6 text-gray-600">
            {brand?.short_description || "Professional event service provider."}
          </p>
        </div>

        {/* Seller Info */}
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50/80 p-3">
          {sellerImage ? (
            <img
              src={sellerImage}
              alt={brand?.seller_info?.full_name || "Seller"}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
              {getInitials(brand?.seller_info?.full_name || brand?.brand_name)}
            </div>
          )}

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-gray-900">
              {brand?.seller_info?.full_name || "Seller"}
            </p>
            <p className="truncate text-xs text-gray-500">
              {brand?.service_area || "Service area not added"}
            </p>
          </div>
        </div>

        {/* Service Tags */}
        <div className="mt-4 flex flex-wrap gap-2">
          {services.length > 0 ? (
            services.map((service) => (
              <span
                key={service.id}
                className="rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700"
              >
                {formatServiceName(service.service_name)}
              </span>
            ))
          ) : (
            <span className="rounded-full border border-gray-100 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-500">
              No service added
            </span>
          )}

          {serviceCount > 3 ? (
            <span className="rounded-full border border-gray-100 bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
              +{serviceCount - 3} more
            </span>
          ) : null}
        </div>

        {/* Bottom Action */}
        <div className="mt-auto pt-5">
          <Link
            to={`/event-planner/brands/${brand.slug}`}
            className="group/btn flex w-full items-center justify-between rounded-2xl bg-gray-950 px-4 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-rose-600"
          >
            <span>View Details</span>
            <span className="transition-transform duration-300 group-hover/btn:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
};

export default BrandCard;
