import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import BrandForm from "@/features/event-planning-feature/brands-feature/components/BrandForm";
import {
  fetchBrandBySlug,
  updateBrand,
  clearPublicBrandDetails,
  clearUpdateBrandState,
} from "@/store/features/eventPlanner/eventPlannerSlice";

const getBrandFormValues = (brand) => ({
  brand_name: brand?.brand_name || "",
  whatsapp_number: brand?.whatsapp_number || "",
  service_area: brand?.service_area || "",
  short_description: brand?.short_description || "",
});

function EditBrandLoader() {
  return (
    <section className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border bg-card p-8 text-center shadow-sm">
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

function EditBrandFormContent({ initialValues, updateState, onUpdate }) {
  const [values, setValues] = useState(initialValues);

  const handleChange = ({ target: { name, value } }) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(values);
  };

  return (
    <BrandForm
      values={values}
      onChange={handleChange}
      onSubmit={handleSubmit}
      submitLabel="Update Brand"
      loading={updateState.loading}
      errors={updateState.errors}
      errorMessage={updateState.errorMessage}
      successMessage={updateState.success ? updateState.message : ""}
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

  useEffect(() => {
    dispatch(clearPublicBrandDetails());
    dispatch(clearUpdateBrandState());

    if (slug) {
      dispatch(fetchBrandBySlug(slug));
    }

    return () => {
      dispatch(clearPublicBrandDetails());
      dispatch(clearUpdateBrandState());
    };
  }, [dispatch, slug]);

  useEffect(() => {
    const newSlug = publicDetails.redirectInfo?.newSlug;

    if (newSlug) {
      navigate(`/event-planner/brands/${newSlug}/edit`, {
        replace: true,
      });
    }
  }, [publicDetails.redirectInfo, navigate]);

  useEffect(() => {
    if (update.success && publicBrandDetails?.slug) {
      navigate(`/event-planner/brands/${publicBrandDetails.slug}`, {
        replace: true,
      });
    }
  }, [update.success, publicBrandDetails, navigate]);

  const isReady =
    !!publicBrandDetails &&
    publicBrandDetails.slug === slug &&
    !publicDetails.loading;

  const initialValues = useMemo(
    () => getBrandFormValues(publicBrandDetails),
    [publicBrandDetails],
  );

  const handleUpdate = (values) => {
    dispatch(
      updateBrand({
        slug,
        payload: values,
      }),
    );
  };

  if (publicDetails.loading || !isReady) {
    return <EditBrandLoader />;
  }

  if (publicDetails.errorMessage) {
    return (
      <div className="p-6 text-center text-destructive">
        {publicDetails.errorMessage}
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <p className="text-sm font-medium text-muted-foreground">
            Update your event planner brand
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">Edit Brand</h1>
        </div>

        <EditBrandFormContent
          key={`${publicBrandDetails.id}-${publicBrandDetails.updated_at}`}
          initialValues={initialValues}
          updateState={update}
          onUpdate={handleUpdate}
        />
      </div>
    </section>
  );
}
