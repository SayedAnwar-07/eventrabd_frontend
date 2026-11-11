import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";

import PageShell from "@/components/shared/page-shell";

import BrandForm from "@/features/event-planning-feature/brands-feature/components/BrandForm";
import { useBrandActions } from "@/features/event-planning-feature/brands-feature/hooks/use-brand-actions";

import { clearCreateBrandState } from "@/store/features/eventPlanner/eventPlannerSlice";
import SEO from "@/components/seo/SEO";

const initialValues = {
  display_name: "",
  brand_name: "",
  whatsapp_number: "",
  division: [],
  office_address: "",
  short_description: "",
  portfolio_link: "",
  logo: null,
};

const toastStyle = {
  background: "#FFFFFF",
  color: "#3D3530",
  border: "1px solid #E5DDD5",
  borderRadius: "8px",
  padding: "14px 16px",
  fontSize: "13px",
  boxShadow: "0 8px 24px -12px rgba(61,53,48,0.20)",
};

export default function CreateBrandPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { createState, createBrand } = useBrandActions();

  const [values, setValues] = useState(initialValues);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    dispatch(clearCreateBrandState());

    return () => {
      dispatch(clearCreateBrandState());
    };
  }, [dispatch]);

  useEffect(() => {
    return () => {
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

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

    if (createState.loading) return;

    const formData = new FormData();

    formData.append("display_name", values.display_name.trim());
    formData.append("brand_name", values.brand_name.trim());
    formData.append("whatsapp_number", values.whatsapp_number.trim());

    values.division.forEach((division) => {
      formData.append("division", division);
    });

    const optionalFields = [
      "office_address",
      "short_description",
      "portfolio_link",
    ];

    optionalFields.forEach((field) => {
      const value = values[field]?.trim();

      if (value) {
        formData.append(field, value);
      }
    });

    if (values.logo instanceof File) {
      formData.append("logo", values.logo);
    }

    const toastId = toast.loading("Creating your brand...", {
      id: "create-brand",
      style: toastStyle,
    });

    try {
      const result = await createBrand(formData);

      if (result?.meta?.requestStatus === "fulfilled") {
        const payload = result.payload;

        // Supports both direct and nested API responses.
        const createdBrand =
          payload?.data?.brand ?? payload?.data ?? payload?.brand ?? payload;

        const createdSlug = createdBrand?.slug;

        toast.success(payload?.message || "Brand created successfully!", {
          id: toastId,
          duration: 4000,
          style: toastStyle,
        });

        if (createdSlug) {
          navigate(`/event-planner/brands/${encodeURIComponent(createdSlug)}`, {
            replace: true,
          });
        } else {
          console.warn("Brand created, but no slug was returned:", payload);
        }

        return;
      }

      const errorPayload = result?.payload;

      const errorMessage =
        typeof errorPayload === "string"
          ? errorPayload
          : errorPayload?.message ||
            errorPayload?.detail ||
            result?.error?.message ||
            "Failed to create brand. Please try again.";

      toast.error(errorMessage, {
        id: toastId,
        duration: 5000,
        style: toastStyle,
      });
    } catch (error) {
      toast.error(error?.message || "Something went wrong. Please try again.", {
        id: toastId,
        duration: 5000,
        style: toastStyle,
      });
    }
  };

  return (
    <>
      <SEO
        title="Create Your Event Brand"
        description="Create your event brand on EventraBD. Set up your brand profile, add contact details, service areas, portfolio, and logo to showcase your event business to potential customers in Bangladesh."
        noIndex={true}
      />
      <PageShell className="space-y-8">
        <header className="mb-6">
          <p className="text-sm font-medium text-muted-foreground">
            Build a strong public identity for your event business with a clean,
            professional profile.
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Create Your Event Brand
          </h1>
        </header>

        <BrandForm
          values={values}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitLabel="Create Brand"
          loading={createState.loading}
          errors={createState.errors}
          logoPreview={logoPreview}
          existingLogo={null}
          onLogoChange={handleLogoChange}
          onRemoveLogo={handleRemoveLogo}
        />
      </PageShell>
    </>
  );
}
