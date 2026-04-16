import { Link } from "react-router-dom";
import { MapPin, BriefcaseBusiness, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BrandCard({ brand }) {
  return (
    <div className="group rounded-3xl border bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h3 className="line-clamp-1 text-lg font-semibold text-slate-900">
            {brand.brand_name}
          </h3>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {brand.service_area}
            </span>
            {typeof brand.total_services !== "undefined" ? (
              <span className="inline-flex items-center gap-1">
                <BriefcaseBusiness className="h-4 w-4" />
                {brand.total_services} services
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <p className="mt-4 line-clamp-3 min-h-[72px] text-sm leading-6 text-slate-600">
        {brand.short_description || "No description added yet."}
      </p>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          By {brand.seller_name || brand.seller_info?.full_name || "Seller"}
        </p>
        <Button asChild variant="ghost" className="rounded-xl px-3">
          <Link to={`/event-planner/brands/${brand.slug}`}>
            View Details
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
