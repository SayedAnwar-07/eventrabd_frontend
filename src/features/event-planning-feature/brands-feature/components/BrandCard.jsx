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
  const sellerImage = getSafeImageUrl(brand?.seller_info.profile_image_url);
  const resolvedBrandSlug = brand?.slug || "";

  const services = Array.isArray(brand?.services) ? brand.services : [];
  const serviceCount = brand?.total_services ?? services.length;
  const visibleServices = services.slice(0, 3);

  return (
    <article className="flex h-full flex-col border border-border bg-background p-5 transition hover:border-primary">
      <div className="flex items-start gap-4">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={brand?.brand_name || "Brand logo"}
            className="h-16 w-16 shrink-0 border border-border object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center border border-border bg-muted text-lg font-semibold text-foreground">
            {getInitials(brand?.brand_name)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h2
            className="truncate text-xl font-semibold text-foreground"
            title={brand?.brand_name}
          >
            {brand?.brand_name || "Unnamed Brand"}
          </h2>

          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
            <strong>Division : </strong>
            {brand.division}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
        {sellerImage ? (
          <img
            src={sellerImage}
            alt={brand?.seller_name || "Seller"}
            className="h-10 w-10 shrink-0 border border-border object-cover object-top"
            loading="lazy"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-border bg-muted text-xs font-semibold text-foreground">
            {getInitials(brand?.seller_name || brand?.brand_name)}
          </div>
        )}

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {brand?.seller_info.full_name || "Seller"}
          </p>

          <p className="text-xs text-muted-foreground">
            {serviceCount} {serviceCount === 1 ? "service" : "services"}
          </p>
        </div>
      </div>

      <div className="my-5 flex-1">
        <div className="grid grid-cols-2 gap-2">
          {visibleServices.length > 0 ? (
            visibleServices.map((service) => {
              const serviceName = service?.slug || service?.service_name || "";

              const detailPath =
                resolvedBrandSlug && service?.id && serviceName
                  ? `/event-planner/brands/${encodeURIComponent(
                      resolvedBrandSlug,
                    )}/services/${encodeURIComponent(
                      service.id,
                    )}/${encodeURIComponent(serviceName)}`
                  : null;

              if (!detailPath) {
                return (
                  <span
                    key={service?.id || serviceName}
                    className="border border-border px-3 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {formatServiceName(serviceName)}
                  </span>
                );
              }

              return (
                <Link
                  key={service.id}
                  to={detailPath}
                  className="border border-border px-3 py-1 text-xs font-medium text-foreground transition hover:border-primary hover:bg-muted"
                >
                  {formatServiceName(service.service_name)}
                </Link>
              );
            })
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
        className="mt-auto flex w-full items-center justify-center bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
      >
        View Details
      </Link>
    </article>
  );
};

export default BrandCard;
