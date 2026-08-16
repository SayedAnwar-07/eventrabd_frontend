import { Building2, Plus } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export default function SellerBrandNav({
  brand,
  loading = false,
  variant = "dropdown",
}) {
  const hasBrand = Boolean(brand?.id && brand?.slug);

  const brandLabel =
    brand?.display_name?.trim() || brand?.brand_name?.trim() || "My Brand";

  const destination = hasBrand
    ? `/event-planner/brands/${brand.slug}`
    : "/event-planner/brands/create";

  // Desktop / Laptop
  if (variant === "dropdown") {
    if (loading && !hasBrand) {
      return (
        <DropdownMenuItem disabled>
          <Building2 className="mr-2 h-4 w-4" />
          Loading brand...
        </DropdownMenuItem>
      );
    }

    return (
      <DropdownMenuItem asChild>
        <Link
          to={destination}
          className="flex cursor-pointer items-center gap-2"
        >
          {hasBrand ? (
            <Building2 className="h-4 w-4 shrink-0" />
          ) : (
            <Plus className="h-4 w-4 shrink-0" />
          )}

          <span className="truncate">
            {hasBrand ? brandLabel : "Create Brand"}
          </span>
        </Link>
      </DropdownMenuItem>
    );
  }

  // Mobile / Tablet loading
  if (loading && !hasBrand) {
    return (
      <div className="flex min-w-0 flex-col items-center justify-center gap-1 px-1 py-2 text-muted-foreground">
        <Building2 className="h-5 w-5" />

        <span className="text-[10px] font-medium">Brand</span>
      </div>
    );
  }

  // Mobile / Tablet app navigation
  return (
    <NavLink
      to={destination}
      className={({ isActive }) =>
        [
          "flex min-w-0 flex-col items-center justify-center",
          "gap-1 px-1 py-2 transition-colors",
          isActive
            ? "text-primary"
            : "text-muted-foreground active:text-foreground",
        ].join(" ")
      }
    >
      {hasBrand ? (
        <Building2 className="h-5 w-5 shrink-0" />
      ) : (
        <Plus className="h-5 w-5 shrink-0" />
      )}

      <span className="max-w-19.5 truncate text-[10px] font-medium">
        {hasBrand ? brandLabel : "Create Brand"}
      </span>
    </NavLink>
  );
}
