import { Building2, Layers, MapPin, Pencil } from "lucide-react";
import { Link } from "react-router-dom";

import BrandDeleteDialog from "../BrandDeleteDialog";
import BrandSidebarPanel from "./Brandsidebarpanel";
import { useSelector } from "react-redux";

const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

const BrandHeader = ({ brand, onEdit }) => {
  const { publicBrandDetails } = useSelector((state) => state.eventPlanner);
  const servicesCount = brand.services?.length || 0;
  const portfolioLink = brand.portfolio_link?.trim();
  const location = [capitalize(brand.district), capitalize(brand.division)]
    .filter(Boolean)
    .join(", ");

  return (
    <header className="pb-8">
      {/* Breadcrumb + actions row */}
      <div className="mb-6 flex items-center justify-between">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link to="/" className="transition hover:text-foreground">
            Home
          </Link>
          <span className="text-muted-foreground/50">/</span>
          <span className="text-foreground">{brand.display_name}</span>
        </nav>

        {brand.is_owner && (
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex rounded-md items-center gap-2 border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:border-foreground"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit Brand
            </button>

            <BrandDeleteDialog brand={brand} />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-4">
            {brand?.logo_url ? (
              <img
                src={brand.logo_url}
                alt={brand.brand_name || "Brand logo"}
                className="h-18 w-18 shrink-0 rounded-full border border-border object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-18 w-18 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-2xl font-semibold text-foreground">
                {brand?.display_name?.trim()?.charAt(0) || "B"}
              </div>
            )}

            <div>
              <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {brand.display_name}
              </h1>
              <dl className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span>{location || "Location not set"}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Layers className="h-4 w-4" />
                  <span>
                    {servicesCount}{" "}
                    {servicesCount === 1 ? "service" : "services"}
                  </span>
                </div>
              </dl>
            </div>
          </div>

          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            {brand.short_description || "No description available yet."}
          </p>

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

        <div>
          <BrandSidebarPanel brand={publicBrandDetails} />
        </div>
      </div>
    </header>
  );
};

export default BrandHeader;
