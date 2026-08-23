import { BriefcaseBusiness, Layers, MapPin, Pencil } from "lucide-react";
import { useSelector } from "react-redux";

import { DIVISION_OPTIONS } from "@/store/features/eventPlanner/bangladeshLocations";

import BrandDeleteDialog from "../BrandDeleteDialog";
import BrandSidebarPanel from "./Brandsidebarpanel";
import BrandBreadcrumb from "./BrandBreadcrumb";

const BrandHeader = ({ brand, onEdit }) => {
  const { publicBrandDetails } = useSelector((state) => state.eventPlanner);

  const services = Array.isArray(brand?.services) ? brand.services : [];

  const portfolioLink = brand?.portfolio_link?.trim() || "";

  const officeAddress = brand?.office_address?.trim() || "";

  const serviceAreas = brand?.division || [];

  return (
    <header className="pb-8">
      {/* Breadcrumb + Actions */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <BrandBreadcrumb brandName={brand?.display_name || brand?.brand_name} />

        {brand?.is_owner && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium transition hover:bg-muted"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>

            <BrandDeleteDialog brand={brand} />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          {/* Brand identity */}
          <div className="flex items-center gap-4">
            {brand?.logo_url ? (
              <img
                src={brand.logo_url}
                alt={`${brand?.display_name || brand?.brand_name || "Brand"} logo`}
                className="h-18 w-18 shrink-0 rounded-full border border-border object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-18 w-18 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-2xl font-semibold text-foreground">
                {brand?.display_name?.trim()?.charAt(0)?.toUpperCase() ||
                  brand?.brand_name?.trim()?.charAt(0)?.toUpperCase() ||
                  "B"}
              </div>
            )}

            <div className="min-w-0">
              <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {brand?.display_name || brand?.brand_name || "Unnamed Brand"}
              </h1>

              <dl className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                {/* Office address */}
                <div className="flex max-w-2xl items-start gap-2 text-sm text-muted-foreground">
                  <BriefcaseBusiness className="mt-0.5 h-4 w-4 shrink-0" />

                  <div>
                    <span className="font-medium text-foreground">Office:</span>{" "}
                    {officeAddress || "No office yet"}
                  </div>
                </div>
              </dl>
            </div>
          </div>

          {/* Service areas */}
          {serviceAreas.length > 0 && (
            <div className="mt-5 flex items-start gap-3">
              <MapPin className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  Service Area:
                </span>

                {serviceAreas.includes("whole_bangladesh") ? (
                  <span className="rounded-md border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    Whole Bangladesh
                  </span>
                ) : (
                  serviceAreas.map((division) => {
                    const label =
                      DIVISION_OPTIONS.find((item) => item.value === division)
                        ?.label || division;

                    return (
                      <span
                        key={division}
                        className="rounded-md border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-foreground transition hover:bg-muted"
                      >
                        {label}
                      </span>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Description */}
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            {brand?.short_description || "No description available yet."}
          </p>

          {/* Portfolio */}
          {portfolioLink && (
            <a
              href={portfolioLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex text-sm font-medium text-foreground underline underline-offset-4 hover:opacity-80"
            >
              View Portfolio
            </a>
          )}
        </div>

        <div className="w-full lg:w-85 shrink-0">
          <BrandSidebarPanel
            brand={publicBrandDetails || brand}
            services={services}
          />
        </div>
      </div>
    </header>
  );
};

export default BrandHeader;
