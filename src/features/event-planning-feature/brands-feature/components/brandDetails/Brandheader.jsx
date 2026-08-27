import { BriefcaseBusiness, MapPin, Pencil } from "lucide-react";

import { DIVISION_OPTIONS } from "@/store/features/eventPlanner/bangladeshLocations";

import BrandDeleteDialog from "../BrandDeleteDialog";
import BrandBreadcrumb from "./BrandBreadcrumb";

const BrandHeader = ({ brand, onEdit }) => {
  const portfolioLink = brand?.portfolio_link?.trim() || "";
  const officeAddress = brand?.office_address?.trim() || "";
  const serviceAreas = brand?.division || [];

  return (
    <header>
      {/* Breadcrumb + Actions */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <BrandBreadcrumb brandName={brand?.display_name || brand?.brand_name} />

        {brand?.is_owner && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-medium transition hover:bg-muted"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>

            <BrandDeleteDialog brand={brand} />
          </div>
        )}
      </div>

      {/* Brand Identity */}
      <div className="flex items-start gap-4">
        {brand?.logo_url ? (
          <img
            src={brand.logo_url}
            alt={`${brand?.display_name || brand?.brand_name || "Brand"} logo`}
            className="h-18 w-18 shrink-0 rounded-md border border-border object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-18 w-18 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-2xl font-semibold">
            {brand?.display_name?.trim()?.charAt(0)?.toUpperCase() ||
              brand?.brand_name?.trim()?.charAt(0)?.toUpperCase() ||
              "B"}
          </div>
        )}

        <div className="min-w-0">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {brand?.display_name || brand?.brand_name || "Unnamed Brand"}
          </h1>

          <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
            <BriefcaseBusiness className="mt-0.5 h-4 w-4 shrink-0" />

            <p>
              <span className="font-medium text-foreground">Office:</span>{" "}
              {officeAddress || "No office yet"}
            </p>
          </div>
        </div>
      </div>

      {/* Service Area */}
      {serviceAreas.length > 0 && (
        <div className="mt-5 flex items-start gap-3">
          <MapPin className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">Service Area:</span>

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
                    className="rounded-md border border-border bg-muted/50 px-3 py-1 text-xs font-medium"
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
      <p className="mt-4 max-w-4xl text-base leading-7 text-muted-foreground">
        {brand?.short_description || "No description available yet."}
      </p>

      {portfolioLink && (
        <a
          href={portfolioLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex text-sm font-medium underline underline-offset-4 hover:opacity-80"
        >
          View Portfolio
        </a>
      )}
    </header>
  );
};

export default BrandHeader;
