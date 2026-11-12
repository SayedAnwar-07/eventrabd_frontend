import { MoreVertical, Pencil } from "lucide-react";

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

  const cleanRichText = (html = "") =>
    html.replace(
      /<p\b[^>]*>(?:\s|&nbsp;|&#160;|&#8203;|<br\s*\/?>)*<\/p>/gi,
      "",
    );

  const brandName = brand?.display_name || brand?.brand_name || "Unnamed Brand";

  return (
    <header className="w-full">
      {/* Breadcrumb */}
      <div className="mb-5">
        <BrandBreadcrumb brandName={brandName} />
      </div>

      {/* Brand Identity + Actions */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          {/* Brand Logo */}
          {brand?.logo_url ? (
            <img
              src={brand.logo_url}
              alt={`${brandName} logo`}
              className="h-16 w-16 shrink-0 rounded-md border border-border object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-xl font-semibold text-foreground">
              {brandName.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Brand Information */}
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {brandName}
            </h1>

            {officeAddress && (
              <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
                {officeAddress}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {actionsLoading ? (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center">
            <LoadingSpinner size="sm" text="" fullScreen={false} />
          </div>
        ) : (
          brand?.is_owner && (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Brand actions"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-black transition-all duration-200 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 active:scale-95 cursor-pointer"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-44 rounded-md border border-border p-1.5 shadow-lg"
              >
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                    onEdit();
                  }}
                  className="h-9 cursor-pointer gap-2 rounded-md px-3 text-sm font-medium"
                >
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                  Edit brand
                </DropdownMenuItem>

                <DropdownMenuItem
                  onSelect={(event) => event.preventDefault()}
                  className="h-9 cursor-pointer rounded-md p-0 text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <BrandDeleteDialog brand={brand} />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        )}
      </div>

      {/* Service Areas */}
      {serviceAreas.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-2.5 text-sm font-medium text-foreground">
            Service areas
          </h2>

          <div className="flex flex-wrap gap-1.5">
            {serviceAreas.includes("whole_bangladesh") ? (
              <span className="rounded-sm border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-foreground transition-colors duration-200">
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
                    className="rounded-sm border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-foreground transition-colors duration-200"
                  >
                    {label}
                  </span>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* About */}
      {brand?.short_description ? (
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-semibold text-foreground">About</h2>

          <div
            className="max-w-5xl text-md leading-[1.65] text-black/80 [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:my-3 [&_ul]:ml-5 [&_ul]:list-disc [&_ol]:my-3 [&_ol]:ml-5 [&_ol]:list-decimal [&_li]:my-1"
            dangerouslySetInnerHTML={{
              __html: cleanRichText(brand.short_description),
            }}
          />
        </div>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">
          No description available yet.
        </p>
      )}

      {/* Portfolio */}
      {portfolioLink && (
        <a
          href={portfolioLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex text-sm font-medium text-foreground underline decoration-border underline-offset-4 transition-colors duration-200 hover:text-primary hover:decoration-primary"
        >
          View portfolio
        </a>
      )}
    </header>
  );
};

export default BrandHeader;
