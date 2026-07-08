import { Link } from "react-router-dom";

const getSafeImageUrl = (url) => {
  if (!url) return "";
  return url.startsWith("http://") ? url.replace("http://", "https://") : url;
};

const getInitials = (name = "") => {
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
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
  const sellerImage = getSafeImageUrl(brand?.seller_profile);

  const services = Array.isArray(brand?.services) ? brand.services : [];
  const serviceCount = brand?.total_services ?? services.length;
  const visibleServices = services.slice(0, 3);

  return (
    <article className="border border-border bg-background p-5 transition hover:border-primary">
      <div className="flex items-start gap-4">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={brand?.brand_name || "Brand logo"}
            className="h-16 w-16 border border-border object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center border border-border bg-muted text-lg font-semibold text-foreground">
            {getInitials(brand?.brand_name)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xl font-semibold text-foreground">
            {brand?.brand_name || "Unnamed Brand"}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {brand?.service_area || "Service area not added"}
          </p>
        </div>
      </div>

      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
        {brand?.short_description || "No description available."}
      </p>

      <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
        {sellerImage ? (
          <img
            src={sellerImage}
            alt={brand?.seller_name || "Seller"}
            className="h-10 w-10 border border-border object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center border border-border bg-muted text-xs font-semibold text-foreground">
            {getInitials(brand?.seller_name || brand?.brand_name)}
          </div>
        )}

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {brand?.seller_name || "Seller"}
          </p>

          <p className="text-xs text-muted-foreground">
            {serviceCount} {serviceCount === 1 ? "service" : "services"}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <div className="grid grid-cols-2 gap-2">
          {visibleServices.length > 0 ? (
            visibleServices.map((service) => (
              <span
                key={service.id}
                className="border border-border px-3 py-1 text-xs font-medium text-foreground"
              >
                {formatServiceName(service.service_name)}
              </span>
            ))
          ) : (
            <span className="border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
              No service added
            </span>
          )}

          {serviceCount > 3 ? (
            <span className="border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
              +{serviceCount - 3} more
            </span>
          ) : null}
        </div>
      </div>

      <Link
        to={`/event-planner/brands/${brand?.slug}`}
        className="mt-6 flex w-full items-center justify-center bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
      >
        View Details
      </Link>
    </article>
  );
};

export default BrandCard;
