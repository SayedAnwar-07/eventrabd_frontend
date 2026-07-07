import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import PageShell from "@/components/shared/page-shell";
import SectionHeader from "@/components/shared/section-header";

import BrandForm from "@/features/event-planning-feature/brands-feature/components/BrandForm";
import { useBrandActions } from "@/features/event-planning-feature/brands-feature/hooks/use-brand-actions";

import { clearCreateBrandState } from "@/store/features/eventPlanner/eventPlannerSlice";

const initialValues = {
  brand_name: "",
  whatsapp_number: "",
  service_area: "",
  short_description: "",
  logo: null,
};

export default function CreateBrandPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { createState, createBrand } = useBrandActions();

  const [values, setValues] = useState(initialValues);

  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    return () => {
      dispatch(clearCreateBrandState());
    };
  }, [dispatch]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setValues((prev) => ({
      ...prev,
      logo: file,
    }));

    setLogoPreview(URL.createObjectURL(file));
  };

  const handleRemoveLogo = () => {
    setValues((prev) => ({
      ...prev,
      logo: null,
    }));

    setLogoPreview(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();

    Object.entries(values).forEach(([key, value]) => {
      if (value) {
        formData.append(key, value);
      }
    });

    const result = await createBrand(formData);

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
        logoPreview={logoPreview}
        onLogoChange={handleLogoChange}
        onRemoveLogo={handleRemoveLogo}
      />
    </PageShell>
  );
}
