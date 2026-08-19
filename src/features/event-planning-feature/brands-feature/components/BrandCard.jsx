import { Link } from "react-router-dom";

import { DIVISION_OPTIONS } from "@/store/features/eventPlanner/bangladeshLocations";

const getSafeImageUrl = (url) => {
  if (!url) {
    return "";
  }

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

const getDivisionLabel = (value) => {
  return (
    DIVISION_OPTIONS.find((division) => division.value === value)?.label ||
    formatServiceName(value)
  );
};

const getDivisionLabels = (divisions) => {
  if (!Array.isArray(divisions) || divisions.length === 0) {
    return "Service area not specified";
  }

  if (divisions.includes("whole_bangladesh")) {
    return "Whole Bangladesh";
  }

  return divisions.map((division) => getDivisionLabel(division)).join(", ");
};

const BrandCard = ({ brand }) => {
  const logoUrl = getSafeImageUrl(brand?.logo_url);

  const sellerImage = getSafeImageUrl(brand?.seller_info?.profile_image_url);

  const displayName =
    brand?.display_name?.trim() || brand?.brand_name?.trim() || "Unnamed Brand";

  const sellerName = brand?.seller_info?.full_name?.trim() || "Seller";

  const resolvedBrandSlug = brand?.slug?.trim() || "";

  const officeAddress = brand?.office_address?.trim() || "";

  const divisionText = getDivisionLabels(brand?.division);

  const services = Array.isArray(brand?.services) ? brand.services : [];

  const serviceCount = Number.isFinite(Number(brand?.total_services))
    ? Number(brand.total_services)
    : services.length;

  const visibleServices = services.slice(0, 3);

  const brandDetailPath = resolvedBrandSlug
    ? `/event-planner/brands/${encodeURIComponent(resolvedBrandSlug)}`
    : null;

  return (
    <article className="flex h-full flex-col border border-border bg-background p-5 transition hover:border-primary">
      {/* Brand */}
      <div className="flex items-start gap-4">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={`${displayName} logo`}
            className="h-16 w-16 shrink-0 border border-border object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center border border-border bg-muted text-lg font-semibold text-foreground">
            {getInitials(displayName) || "?"}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h2
            className="truncate text-xl font-semibold text-foreground"
            title={displayName}
          >
            {displayName}
          </h2>

          <p
            className="mt-2 line-clamp-2 text-sm leading-6 font-medium text-muted-foreground"
            title={divisionText}
          >
            {divisionText}
          </p>

          {officeAddress && (
            <p
              className="mt-1 line-clamp-1 text-xs text-muted-foreground"
              title={officeAddress}
            >
              {officeAddress}
            </p>
          )}
        </div>
      </div>

      {/* Seller */}
      <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
        {sellerImage ? (
          <img
            src={sellerImage}
            alt={sellerName}
            className="h-10 w-10 shrink-0 border border-border object-cover object-top"
            loading="lazy"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-border bg-muted text-xs font-semibold text-foreground">
            {getInitials(sellerName) || "?"}
          </div>
        )}

        <div className="min-w-0">
          <p
            className="truncate text-sm font-medium text-foreground"
            title={sellerName}
          >
            {sellerName}
          </p>

          <p className="text-xs text-muted-foreground">
            {serviceCount} {serviceCount === 1 ? "service" : "services"}
          </p>
        </div>
      </div>

      {/* Services */}
      <div className="my-5 flex-1">
        <div className="grid grid-cols-2 gap-2">
          {visibleServices.length > 0 ? (
            visibleServices.map((service) => {
              const serviceName = service?.service_name || "";

              const serviceSlug = service?.slug || serviceName;

              const detailPath =
                resolvedBrandSlug && service?.id && serviceSlug
                  ? `/event-planner/brands/${encodeURIComponent(
                      resolvedBrandSlug,
                    )}/services/${encodeURIComponent(
                      service.id,
                    )}/${encodeURIComponent(serviceSlug)}`
                  : null;

              const label = formatServiceName(serviceName || serviceSlug);

              if (!detailPath) {
                return (
                  <span
                    key={service?.id || serviceSlug}
                    className="border border-border px-3 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {label}
                  </span>
                );
              }

              return (
                <Link
                  key={service.id}
                  to={detailPath}
                  className="border border-border px-3 py-1 text-xs font-medium text-foreground transition hover:border-primary hover:bg-muted"
                >
                  {label}
                </Link>
              );
            })
          ) : (
            <span className="border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
              No service added
            </span>
          )}

          {serviceCount > 3 && (
            <span className="border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
              +{serviceCount - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Brand details */}
      {brandDetailPath ? (
        <Link
          to={brandDetailPath}
          className="mt-auto flex w-full items-center justify-center bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          View Details
        </Link>
      ) : (
        <button
          type="button"
          disabled
          className="mt-auto flex w-full cursor-not-allowed items-center justify-center bg-muted px-4 py-3 text-sm font-semibold text-muted-foreground"
        >
          View Details
        </button>
      )}
    </article>
  );
};

export default BrandCard;
