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
  division: "",
  district: "",
  short_description: "",
  logo: null,
};

export default function CreateBrandPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { createState, createBrand } = useBrandActions();

  const [values, setValues] = useState(initialValues);
  const [logoPreview, setLogoPreview] = useState(null);

  /*
   * Clear any stale create-brand result when entering the page
   * and again when leaving the page.
   */
  useEffect(() => {
    dispatch(clearCreateBrandState());

    return () => {
      dispatch(clearCreateBrandState());
    };
  }, [dispatch]);

  /*
   * Revoke the current browser-generated preview URL whenever
   * it changes or when the component unmounts.
   */
  useEffect(() => {
    return () => {
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setValues((previousValues) => ({
      ...previousValues,
      [name]: value,

      /*
       * A district belongs to one division only.
       * Clear the previous district whenever division changes.
       */
      ...(name === "division" ? { district: "" } : {}),
    }));
  };

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setValues((previousValues) => ({
      ...previousValues,
      logo: file,
    }));

    setLogoPreview(URL.createObjectURL(file));
  };

  const handleRemoveLogo = () => {
    setValues((previousValues) => ({
      ...previousValues,
      logo: null,
    }));

    setLogoPreview(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (createState.loading) {
      return;
    }

    const formData = new FormData();

    /*
     * Build the payload explicitly instead of sending every
     * property from the React state.
     */
    formData.append("brand_name", values.brand_name.trim());
    formData.append("whatsapp_number", values.whatsapp_number.trim());
    formData.append("division", values.division);
    formData.append("district", values.district);
    formData.append("short_description", values.short_description.trim());

    if (values.logo instanceof File) {
      formData.append("logo", values.logo);
    }

    const result = await createBrand(formData);

    if (result?.meta?.requestStatus === "fulfilled") {
      const createdSlug = result.payload?.slug;

      if (createdSlug) {
        navigate(`/event-planner/brands/${createdSlug}`, {
          replace: true,
        });
      }
    }
  };

  return (
    <PageShell className="space-y-8">
      <header className="mb-6">
        <p className="text-sm font-medium text-muted-foreground">
          Build a strong public identity for your event business with a clean,
          professional profile.
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight">Create Your Event Brand</h1>
      </header>

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
        existingLogo={null}
        onLogoChange={handleLogoChange}
        onRemoveLogo={handleRemoveLogo}
      />
    </PageShell>
  );
}
