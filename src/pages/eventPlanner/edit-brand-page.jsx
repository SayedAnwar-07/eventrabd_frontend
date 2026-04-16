import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import PageShell from "@/components/shared/page-shell";
import SectionHeader from "@/components/shared/section-header";
import StatusAlert from "@/components/shared/status-alert";
import BrandForm from "@/components/eventPlanner/brand-form";
import { useBrandActions } from "@/hooks/use-brand-actions";
import {
  clearBrandDetails,
  clearUpdateBrandState,
} from "@/store/features/eventPlanner/eventPlannerSlice";

export default function EditBrandPage() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    brandDetails,
    detailsState,
    updateState,
    fetchBrandBySlug,
    updateBrand,
  } = useBrandActions();

  const initialValues = useMemo(
    () => ({
      brand_name: brandDetails?.brand_name || "",
      whatsapp_number: brandDetails?.whatsapp_number || "",
      service_area: brandDetails?.service_area || "",
      short_description: brandDetails?.short_description || "",
    }),
    [brandDetails],
  );

  const [values, setValues] = useState(initialValues);

  useEffect(() => {
    fetchBrandBySlug(slug);
    return () => {
      dispatch(clearUpdateBrandState());
      dispatch(clearBrandDetails());
    };
  }, [dispatch, fetchBrandBySlug, slug]);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  useEffect(() => {
    if (detailsState.redirectInfo?.newSlug) {
      navigate(
        `/event-planner/brands/${detailsState.redirectInfo.newSlug}/edit`,
        { replace: true },
      );
    }
  }, [detailsState.redirectInfo, navigate]);

  useEffect(() => {
    if (updateState.success && brandDetails?.slug) {
      navigate(`/event-planner/brands/${brandDetails.slug}`);
    }
  }, [updateState.success, brandDetails, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await updateBrand({ slug, payload: values });

    if (
      result?.meta?.requestStatus === "rejected" &&
      result?.payload?.redirectInfo?.newSlug
    ) {
      navigate(
        `/event-planner/brands/${result.payload.redirectInfo.newSlug}/edit`,
        { replace: true },
      );
    }

    if (result?.meta?.requestStatus === "fulfilled") {
      navigate(`/event-planner/brands/${result.payload.slug}`);
    }
  };

  if (detailsState.loading && !brandDetails) {
    return (
      <PageShell>
        <div className="rounded-3xl border bg-white p-8 shadow-sm">
          Loading brand...
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

  return (
    <PageShell className="space-y-8">
      <SectionHeader
        title="Edit Brand"
        description="Update your public event brand profile. Keep your information current and polished."
      />

      <BrandForm
        values={values}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
        loading={updateState.loading}
        errors={updateState.errors}
        errorMessage={updateState.errorMessage}
        successMessage={updateState.success ? updateState.message : ""}
      />
    </PageShell>
  );
}
