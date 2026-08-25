import { Link } from "react-router-dom";
import { FileText, MapPin, Send, Star } from "lucide-react";
import { useSelector } from "react-redux";

const formatLocation = (division) => {
  if (!Array.isArray(division) || division.length === 0) {
    return [];
  }

  return division.filter(Boolean).map((value) =>
    String(value)
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase()),
  );
};

const PublicServiceInfo = ({ service }) => {
  const brand = service?.brand || {};
  const seller = service?.seller || {};
  const { user } = useSelector((state) => state.auth);

  const isOwner = brand?.is_owner === true || brand?.slug === user?.brand_slug;

  const brandSlug = brand?.slug || "";

  const brandName = brand?.display_name || brand?.brand_name || "Unknown Brand";

  const officeAddress = brand?.office_address || "No office yet";

  const location = formatLocation(brand?.division);

  const detailPath =
    brandSlug && service?.id && service?.service_name
      ? `/event-planner/brands/${brandSlug}/services/${service.id}/${service.service_name}`
      : "#";

  return (
    <div className="p-4">
      {/* ================= BRAND ================= */}

      <div className="flex items-center gap-3">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-border bg-muted shadow-sm">
          {brand?.logo_url ? (
            <img
              src={brand.logo_url}
              alt={brandName}
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary text-lg font-bold text-primary-foreground">
              {brandName?.charAt(0)?.toUpperCase()}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 overflow-hidden">
          <h3 className="truncate text-xl font-bold tracking-tight text-foreground">
            {service?.description || brandName}
          </h3>

          <div className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />

            <span className="line-clamp-1">Office : {officeAddress}</span>
          </div>
        </div>
      </div>

      {/* ================= DIVIDER ================= */}

      <div className="my-3.5 border-t border-border" />

      {/* ================= SELLER ================= */}

      <div className="flex items-center justify-between gap-3 rounded-md bg-muted/50 p-3">
        <div className="flex min-w-0 flex-1 gap-2.5">
          {/* Seller Image */}

          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-background bg-muted shadow-sm">
            {seller?.profile_image_url ? (
              <img
                src={seller.profile_image_url}
                alt={seller?.full_name || "Seller"}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                {seller?.full_name?.charAt(0)?.toUpperCase() || "S"}
              </div>
            )}
          </div>

          {/* Seller Info */}

          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="flex justify-between">
              <p className="truncate text-sm font-semibold text-foreground">
                {seller?.full_name || "Unknown Seller"}
              </p>
              <div className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />

                <span className="text-xs font-bold">
                  {Number(service?.rating || 0).toFixed(1)}
                </span>

                <span className="text-[10px]">
                  ({service?.review_count ?? 0})
                </span>
              </div>
            </div>

            {location.length > 0 && (
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Service Providing :</span>

                <div className="mt-1 flex items-center gap-1.5">
                  {location.slice(0, 2).map((item) => (
                    <span
                      key={item}
                      className="inline-block whitespace-nowrap rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium text-foreground"
                    >
                      {item}
                    </span>
                  ))}

                  {location.length > 2 && (
                    <span className="inline-block whitespace-nowrap rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium text-foreground">
                      +{location.length - 2}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= ACTIONS ================= */}

      <div className="mt-3.5 flex items-center gap-2.5">
        <Link
          to={detailPath}
          className="flex flex-1 items-center justify-center gap-2 rounded-md border border-primary bg-background px-3 py-2.5 text-xs font-semibold text-primary transition-all hover:bg-primary/5"
        >
          View Details
        </Link>

        {!isOwner && (
          <Link
            to={detailPath}
            state={{
              openHireForm: true,
            }}
            className="flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
          >
            Hire Now
          </Link>
        )}
      </div>
    </div>
  );
};

export default PublicServiceInfo;
