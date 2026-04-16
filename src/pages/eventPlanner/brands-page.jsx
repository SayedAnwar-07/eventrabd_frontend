import { useEffect } from "react";
import PageShell from "@/components/shared/page-shell";
import SectionHeader from "@/components/shared/section-header";
import StatusAlert from "@/components/shared/status-alert";
import BrandListGrid from "@/components/eventPlanner/brand-list-grid";
import { useBrandActions } from "@/hooks/use-brand-actions";

export default function BrandsPage() {
  const { brands, listState, fetchBrands } = useBrandActions();

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  return (
    <PageShell className="space-y-8">
      <SectionHeader
        title="Event Planning Brands"
        description="Explore event brands, compare service areas, and manage your public brand profile."
        ctaLabel="Create Brand"
        ctaTo="/event-planner/brands/create"
      />

      {listState.errorMessage ? (
        <StatusAlert
          type="error"
          title="Could not load brands"
          message={listState.errorMessage}
        />
      ) : null}

      <BrandListGrid brands={brands} loading={listState.loading} />
    </PageShell>
  );
}
