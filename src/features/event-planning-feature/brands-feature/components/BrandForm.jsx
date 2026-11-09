import BrandFormFields from "./BrandFormFields";

export default function BrandForm({
  values,
  onChange,
  onSubmit,
  submitLabel,
  loading,
  errors = {},
  logoPreview,
  onLogoChange,
  onRemoveLogo,
  existingLogo,
}) {
  return (
    <form onSubmit={onSubmit} className="min-w-0">
      <div className="grid min-w-0 gap-6">
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

        <div className="flex flex-col-reverse gap-4 rounded-md border border-[#E5DDD5] bg-white p-4 shadow-[0_1px_2px_rgba(61,53,48,0.04)] sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
          <p className="text-xs leading-relaxed text-[#756A62]">
            Fill in your brand details to create your profile.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-11 items-center justify-center rounded-md border border-[#3D3530] bg-[#3D3530] px-6 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:border-[#51463E] hover:bg-[#51463E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A68C78]/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating Brand..." : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
