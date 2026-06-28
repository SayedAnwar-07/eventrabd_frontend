import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageShell from "@/components/shared/page-shell";
import SectionHeader from "@/components/shared/section-header";

import BrandForm from "@/features/event-planning-feature/brands-feature/components/BrandForm";
import { useBrandActions } from "@/features/event-planning-feature/brands-feature/hooks/use-brand-actions";

import { useDispatch } from "react-redux";
import { clearCreateBrandState } from "@/store/features/eventPlanner/eventPlannerSlice";

const initialValues = {
  brand_name: "",
  whatsapp_number: "",
  service_area: "",
  short_description: "",
};

export default function CreateBrandPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { createState, createBrand } = useBrandActions();
  const [values, setValues] = useState(initialValues);

  useEffect(() => {
    return () => {
      dispatch(clearCreateBrandState());
    };
  }, [dispatch]);

  useEffect(() => {
    if (createState.success) {
      navigate(
        `/event-planner/brands/${createState.redirectInfo?.newSlug || ""}`,
      );
    }
  }, [createState.success, createState.redirectInfo, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await createBrand(values);
    if (result?.meta?.requestStatus === "fulfilled") {
      navigate(`/event-planner/brands/${result.payload.slug}`);
    }
  };

  return (
    <PageShell className="space-y-8">
      <SectionHeader
        title="Create Your Brand"
        description="Build a strong public identity for your event business with a clean, professional profile."
      />

      <BrandForm
        values={values}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel="Create Brand"
        loading={createState.loading}
        errors={createState.errors}
        errorMessage={createState.errorMessage}
        successMessage={createState.success ? createState.message : ""}
      />
    </PageShell>
  );
}
