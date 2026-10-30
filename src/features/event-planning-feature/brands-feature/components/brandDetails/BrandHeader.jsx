import {
  BriefcaseBusiness,
  Loader2,
  MapPin,
  MoreVertical,
  Pencil,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { DIVISION_OPTIONS } from "@/store/features/eventPlanner/bangladeshLocations";

import BrandDeleteDialog from "../BrandDeleteDialog";
import BrandBreadcrumb from "./BrandBreadcrumb";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const BrandHeader = ({ brand, onEdit, actionsLoading = false }) => {
  const portfolioLink = brand?.portfolio_link?.trim() || "";
  const officeAddress = brand?.office_address?.trim() || "";
  const serviceAreas = brand?.division || [];

  const cleanRichText = (html = "") => {
    return html
      .replace(
        /<p[^>]*>(?:\s|&nbsp;|&#160;|&#8203;|\u200B|<br[^>]*>)*<\/p>/gi,
        "",
      )
      .replace(
        /<p([^>]*)>(?:\s|&nbsp;|&#160;|&#8203;|\u200B)*<br[^>]*>/gi,
        "<p$1>",
      );
  };

  return (
    <header>
      {/* Breadcrumb + Actions */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <BrandBreadcrumb brandName={brand?.display_name || brand?.brand_name} />

        {/* ACTION AREA */}
        {actionsLoading ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background">
            <LoadingSpinner size="sm" text="" fullScreen={false} />
          </div>
        ) : (
          brand?.is_owner && (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-foreground shadow-sm transition hover:bg-muted focus:outline-none"
                  aria-label="Brand actions"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-44 rounded-xl border border-border bg-background p-1.5 shadow-lg"
              >
                {/* EDIT */}
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                    onEdit();
                  }}
                  className="h-10 cursor-pointer gap-3 rounded-lg px-3 text-sm font-medium focus:bg-muted"
                >
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                  <span>Edit Brand</span>
                </DropdownMenuItem>

                {/* DELETE */}
                <DropdownMenuItem
                  onSelect={(event) => event.preventDefault()}
                  className="h-10 cursor-pointer rounded-lg p-0 text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <BrandDeleteDialog brand={brand} />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
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
      {brand?.short_description ? (
        <div className="mt-10 max-w-6xl">
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            About This Brand
            <span className="mt-2 block h-1 w-12 rounded-full bg-[#ae0212]" />
          </h2>

          <div
            className="
              text-base leading-7 text-foreground/80
              [&_p]:mb-3
              [&_p:last-child]:mb-0
              [&_strong]:font-bold
              [&_strong]:text-foreground
              [&_ul]:my-3
              [&_ul]:ml-6
              [&_ul]:list-disc
              [&_ol]:my-3
              [&_ol]:ml-6
              [&_ol]:list-decimal
              [&_li]:my-1
            "
            dangerouslySetInnerHTML={{
              __html: cleanRichText(brand.short_description),
            }}
          />
        </div>
      ) : (
        <p className="mt-4 text-base text-foreground/70">
          No description available yet.
        </p>
      )}

      {/* Portfolio */}
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
