import BrandCard from "@/components/eventPlanner/brand-card";
import BrandSkeleton from "@/components/eventPlanner/brand-skeleton";
import EmptyState from "@/components/shared/empty-state";

export default function BrandListGrid({ brands, loading }) {
  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <BrandSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!brands?.length) {
    return (
      <EmptyState
        title="No brands found"
        description="Start by creating your event planning brand and showcase your services professionally."
        buttonLabel="Create Brand"
        buttonTo="/event-planner/brands/create"
      />
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {brands.map((brand) => (
        <BrandCard key={brand.id} brand={brand} />
      ))}
    </div>
  );
}
