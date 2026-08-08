import BrandAlerts from "./BrandAlerts";
import BrandFormFields from "./BrandFormFields";
import BrandPreviewCard from "./BrandPreviewCard";

export default function BrandForm({
  values,
  onChange,
  onSubmit,
  submitLabel,
  loading,
  errors = {},
  errorMessage = "",
  successMessage = "",
  logoPreview,
  onLogoChange,
  onRemoveLogo,
  existingLogo,
}) {
  return (
    <form onSubmit={onSubmit} className="grid gap-10 lg:grid-cols-[1fr_320px]">
      <div className="grid gap-8">
        <BrandAlerts
          errorMessage={errorMessage}
          successMessage={successMessage}
        />

        <BrandFormFields
          values={values}
          onChange={onChange}
          errors={errors}
          loading={loading}
          logoPreview={logoPreview}
          existingLogo={existingLogo}
          onLogoChange={onLogoChange}
          onRemoveLogo={onRemoveLogo}
        />

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Changes appear in the preview as you type.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="gradient-button transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Please wait..." : submitLabel}
          </button>
        </div>
      </div>

      <div className="hidden lg:block">
        <div className="sticky top-6">
          <BrandPreviewCard
            values={values}
            logoPreview={logoPreview}
            existingLogo={existingLogo}
          />
        </div>
      </div>
    </form>
  );
}
