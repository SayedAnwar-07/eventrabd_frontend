import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { MapPin, Phone, UserRound, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageShell from "@/components/shared/page-shell";
import StatusAlert from "@/components/shared/status-alert";
import DeleteBrandDialog from "@/components/eventPlanner/delete-brand-dialog";
import { useBrandActions } from "@/hooks/use-brand-actions";

export default function BrandDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const {
    brandDetails,
    detailsState,
    deleteState,
    fetchBrandBySlug,
    deleteBrand,
  } = useBrandActions();

  useEffect(() => {
    fetchBrandBySlug(slug);
  }, [fetchBrandBySlug, slug]);

  useEffect(() => {
    if (detailsState.redirectInfo?.newSlug) {
      navigate(`/event-planner/brands/${detailsState.redirectInfo.newSlug}`, {
        replace: true,
      });
    }
  }, [detailsState.redirectInfo, navigate]);

  const handleDelete = async () => {
    const result = await deleteBrand(slug);
    if (result?.meta?.requestStatus === "fulfilled") {
      navigate("/event-planner/brands");
      return true;
    }
    return false;
  };

  if (detailsState.loading) {
    return (
      <PageShell>
        <div className="rounded-3xl border bg-white p-8 shadow-sm">
          Loading brand details...
        </div>
      </PageShell>
    );
  }

  if (detailsState.errorMessage && !brandDetails) {
    return (
      <PageShell>
        <StatusAlert
          type="error"
          title="Could not load brand"
          message={detailsState.errorMessage}
        />
      </PageShell>
    );
  }

  if (!brandDetails) return null;

  return (
    <PageShell className="space-y-8">
      <div className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
                Brand Profile
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                {brandDetails.brand_name}
              </h1>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
                <MapPin className="h-4 w-4" />
                {brandDetails.service_area}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
                <Phone className="h-4 w-4" />
                {brandDetails.whatsapp_number}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
                <UserRound className="h-4 w-4" />
                {brandDetails.seller_info?.full_name}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" className="rounded-xl">
              <Link to={`/event-planner/brands/${brandDetails.slug}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Brand
              </Link>
            </Button>
            <DeleteBrandDialog
              loading={deleteState.loading}
              onConfirm={handleDelete}
            />
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_0.8fr]">
          <div className="rounded-3xl bg-slate-50 p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              About this brand
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {brandDetails.short_description || "No description added yet."}
            </p>
          </div>

          <div className="rounded-3xl bg-slate-50 p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Seller info
            </h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>
                <span className="font-medium text-slate-900">Full Name:</span>{" "}
                {brandDetails.seller_info?.full_name}
              </p>
              <p>
                <span className="font-medium text-slate-900">Username:</span>{" "}
                {brandDetails.seller_info?.username}
              </p>
              <p>
                <span className="font-medium text-slate-900">Email:</span>{" "}
                {brandDetails.seller_info?.email}
              </p>
              <p>
                <span className="font-medium text-slate-900">Contact:</span>{" "}
                {brandDetails.seller_info?.contact_number || "N/A"}
              </p>
              <p>
                <span className="font-medium text-slate-900">Office:</span>{" "}
                {brandDetails.seller_info?.office_address || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
