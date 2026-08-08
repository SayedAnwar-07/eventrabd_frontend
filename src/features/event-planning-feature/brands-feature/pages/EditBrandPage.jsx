import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import BrandForm from "@/features/event-planning-feature/brands-feature/components/BrandForm";

import {
  fetchBrandBySlug,
  updateBrand,
  clearPublicBrandDetails,
  clearUpdateBrandState,
} from "@/store/features/eventPlanner/eventPlannerSlice";

const EMPTY_FORM_VALUES = {
  brand_name: "",
  whatsapp_number: "",
  division: "",
  district: "",
  short_description: "",
  logo: null,
};

const getBrandFormValues = (brand) => ({
  ...EMPTY_FORM_VALUES,
  brand_name: brand?.brand_name ?? "",
  whatsapp_number: brand?.whatsapp_number ?? "",
  division: brand?.division ?? "",
  district: brand?.district ?? "",
  short_description: brand?.short_description ?? "",
});

/**
 * Converts API errors into a clean, readable message.
 * It prevents full HTML error pages from appearing in the UI.
 */
const getReadableErrorMessage = (
  error,
  fallback = "Something went wrong. Please try again.",
) => {
  if (!error) {
    return fallback;
  }

  if (Array.isArray(error)) {
    return getReadableErrorMessage(error[0], fallback);
  }

  if (typeof error === "object") {
    const preferredKeys = ["detail", "message", "error", "non_field_errors"];

    for (const key of preferredKeys) {
      if (error[key]) {
        return getReadableErrorMessage(error[key], fallback);
      }
    }

    const firstValue = Object.values(error).find(Boolean);

    return firstValue
      ? getReadableErrorMessage(firstValue, fallback)
      : fallback;
  }

  let message = String(error).trim();

  if (!message) {
    return fallback;
  }

  const containsHtml = /<\/?[a-z][\s\S]*>/i.test(message);

  if (containsHtml) {
    try {
      const documentNode = new DOMParser().parseFromString(
        message,
        "text/html",
      );

      documentNode
        .querySelectorAll("script, style, noscript")
        .forEach((element) => element.remove());

      const title = documentNode.querySelector("title")?.textContent?.trim();

      const heading = documentNode.querySelector("h1")?.textContent?.trim();

      const body = documentNode.body?.textContent?.replace(/\s+/g, " ").trim();

      message = title || heading || body || fallback;
    } catch {
      message = message.replace(/<[^>]*>/g, " ");
    }
  }

  message = message
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();

  if (/401|unauthorized|authentication credentials/i.test(message)) {
    return "Your session has expired. Please sign in again.";
  }

  if (/403|forbidden|permission denied/i.test(message)) {
    return "You do not have permission to edit this brand.";
  }

  if (/404|not found/i.test(message)) {
    return "The requested brand could not be found.";
  }

  if (/500|internal server error|server error/i.test(message)) {
    return "The server could not load the brand. Please try again.";
  }

  if (/network error|failed to fetch|connection/i.test(message)) {
    return "Unable to connect to the server. Check your internet connection.";
  }

  const maximumLength = 250;

  if (message.length > maximumLength) {
    return `${message.slice(0, maximumLength - 3)}...`;
  }

  return message || fallback;
};

function EditBrandLoader() {
  return (
    <section className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="border bg-card p-8 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />

          <h2 className="mt-4 text-xl font-semibold">Loading brand data...</h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Please wait while we prepare your edit form.
          </p>
        </div>
      </div>
    </section>
  );
}

function EditBrandError({ message, onRetry }) {
  return (
    <section className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="border border-destructive/30 bg-card p-8 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-destructive" />

          <h2 className="mt-4 text-xl font-semibold">Unable to load brand</h2>

          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            {message}
          </p>

          <button
            type="button"
            onClick={onRetry}
            className="gradient-button mt-6 inline-flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    </section>
  );
}

function EditBrandFormContent({
  initialValues,
  existingLogo,
  updateState,
  onUpdate,
}) {
  const [values, setValues] = useState(() => initialValues);
  const [logoPreview, setLogoPreview] = useState(null);
  const [removeLogo, setRemoveLogo] = useState(false);

  /*
   * This effect is valid because URL.createObjectURL is an
   * external browser API that requires cleanup.
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
    setRemoveLogo(false);

    // Allows selecting the same file again after removing it.
    event.target.value = "";
  };

  const handleRemoveLogo = () => {
    setValues((previousValues) => ({
      ...previousValues,
      logo: null,
    }));

    setLogoPreview(null);
    setRemoveLogo(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (updateState.loading) {
      return;
    }

    const formData = new FormData();

    formData.append("brand_name", values.brand_name.trim());
    formData.append(
      "whatsapp_number",
      values.whatsapp_number.trim(),
    );
    formData.append("division", values.division);
    formData.append("district", values.district);
    formData.append(
      "short_description",
      values.short_description.trim(),
    );

    if (values.logo instanceof File) {
      formData.append("logo", values.logo);
    }

    if (removeLogo) {
      formData.append("remove_logo", "true");
    }

    await onUpdate(formData);
  };

  return (
    <BrandForm
      values={values}
      onChange={handleChange}
      onSubmit={handleSubmit}
      submitLabel="Update Brand"
      loading={updateState.loading}
      errors={updateState.errors || {}}
      errorMessage={updateState.errorMessage || ""}
      successMessage={
        updateState.success ? updateState.message : ""
      }
      logoPreview={logoPreview}
      existingLogo={removeLogo ? null : existingLogo}
      onLogoChange={handleLogoChange}
      onRemoveLogo={handleRemoveLogo}
    />
  );
}

export default function EditBrandPage() {
  const { slug } = useParams();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { publicBrandDetails, publicDetails, update } = useSelector(
    (state) => state.eventPlanner,
  );

  const fetchErrorMessage = useMemo(() => {
    if (!publicDetails.errorMessage) {
      return "";
    }

    return getReadableErrorMessage(
      publicDetails.errorMessage,
      "Unable to load the brand details. Please try again.",
    );
  }, [publicDetails.errorMessage]);

  const initialValues = useMemo(
    () => getBrandFormValues(publicBrandDetails),
    [publicBrandDetails],
  );

  const loadBrand = () => {
    dispatch(clearPublicBrandDetails());
    dispatch(clearUpdateBrandState());

    if (slug) {
      dispatch(fetchBrandBySlug(slug));
    }
  };

  useEffect(() => {
    loadBrand();

    return () => {
      dispatch(clearPublicBrandDetails());
      dispatch(clearUpdateBrandState());
    };
    // loadBrand intentionally depends on the current slug.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, slug]);

  useEffect(() => {
    const redirectedSlug = publicDetails.redirectInfo?.newSlug;

    if (redirectedSlug && redirectedSlug !== slug) {
      navigate(`/event-planner/brands/${redirectedSlug}/edit`, {
        replace: true,
      });
    }
  }, [publicDetails.redirectInfo, slug, navigate]);

  const handleUpdate = async (payload) => {
    if (!slug) {
      return null;
    }

    const result = await dispatch(
      updateBrand({
        slug,
        payload,
      }),
    );

    if (updateBrand.fulfilled.match(result)) {
      const updatedSlug =
        result.payload?.slug ||
        result.payload?.data?.slug ||
        publicBrandDetails?.slug ||
        slug;

      navigate(`/event-planner/brands/${updatedSlug}`, {
        replace: true,
      });
    }

    return result;
  };

  const handleRetry = () => {
    loadBrand();
  };

  if (!slug) {
    return (
      <EditBrandError
        message="The brand address is missing or invalid."
        onRetry={() => navigate("/event-planner/brands")}
      />
    );
  }

  /*
   * Check fetch error before checking isReady.
   * Otherwise a failed request can display the loader forever.
   */
  if (fetchErrorMessage) {
    return <EditBrandError message={fetchErrorMessage} onRetry={handleRetry} />;
  }

  const isCurrentBrand = publicBrandDetails?.slug === slug;

  if (publicDetails.loading || !isCurrentBrand) {
    return <EditBrandLoader />;
  }

  return (
    <section className="min-h-screen bg-background px-4 py-8">
      <div className="">
        <header className="mb-6">
          <p className="text-sm font-medium text-muted-foreground">
            Update your event planner brand
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">Edit Brand</h1>
        </header>

        <EditBrandFormContent
          key={`${publicBrandDetails.id}-${publicBrandDetails.updated_at}`}
          initialValues={initialValues}
          existingLogo={publicBrandDetails.logo_url || null}
          updateState={update}
          onUpdate={handleUpdate}
        />
      </div>
    </section>
  );
}
