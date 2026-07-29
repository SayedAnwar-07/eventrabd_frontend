import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import StatusAlert from "@/components/shared/status-alert";

import {
  DIVISION_DISTRICTS,
  DIVISION_OPTIONS,
} from "@/store/features/eventPlanner/bangladeshLocations";

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
  const selectedDivision = values.division || "";

  const availableDistricts = selectedDivision
    ? DIVISION_DISTRICTS[selectedDivision] || []
    : [];

  const renderErrors = (fieldName) => {
    const fieldErrors = errors[fieldName];

    if (!fieldErrors) {
      return null;
    }

    const normalizedErrors = Array.isArray(fieldErrors)
      ? fieldErrors
      : [fieldErrors];

    return normalizedErrors.map((item, index) => (
      <p key={`${fieldName}-${index}`} className="text-sm text-destructive">
        {item}
      </p>
    ));
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-border bg-card p-6 sm:p-8"
    >
      <div className="grid gap-5">
        {errorMessage && (
          <StatusAlert
            type="error"
            title="Please fix the following issues"
            message={errorMessage}
          />
        )}

        {successMessage && (
          <StatusAlert
            type="success"
            title="Success"
            message={successMessage}
          />
        )}

        {/* Brand name */}
        <div className="grid gap-2">
          <Label htmlFor="brand_name">Brand Name</Label>

          <Input
            id="brand_name"
            name="brand_name"
            type="text"
            value={values.brand_name || ""}
            onChange={onChange}
            placeholder="Dream Weddings"
            maxLength={255}
            required
            disabled={loading}
            aria-invalid={Boolean(errors.brand_name)}
            className="h-11 rounded-xl"
          />

          {renderErrors("brand_name")}
        </div>

        {/* Logo */}
        <div className="grid gap-2">
          <Label htmlFor="logo">Brand Logo</Label>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative w-fit">
              {logoPreview || existingLogo ? (
                <>
                  <img
                    src={logoPreview || existingLogo}
                    alt="Brand logo preview"
                    className="h-24 w-24 rounded-2xl border object-cover"
                  />

                  <button
                    type="button"
                    onClick={onRemoveLogo}
                    disabled={loading}
                    aria-label="Remove brand logo"
                    className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    ×
                  </button>
                </>
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl border bg-muted text-sm text-muted-foreground">
                  No Logo
                </div>
              )}
            </div>

            <div className="flex-1">
              <Input
                id="logo"
                name="logo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={onLogoChange}
                disabled={loading}
              />

              <p className="mt-1 text-xs text-muted-foreground">
                JPEG, PNG or WebP. Maximum size: 1MB.
              </p>
            </div>
          </div>

          {renderErrors("logo")}
        </div>

        {/* WhatsApp */}
        <div className="grid gap-2">
          <Label htmlFor="whatsapp_number">WhatsApp Number</Label>

          <Input
            id="whatsapp_number"
            name="whatsapp_number"
            type="tel"
            value={values.whatsapp_number || ""}
            onChange={onChange}
            placeholder="+8801XXXXXXXXX"
            maxLength={30}
            required
            disabled={loading}
            aria-invalid={Boolean(errors.whatsapp_number)}
            className="h-11 rounded-xl"
          />

          {renderErrors("whatsapp_number")}
        </div>

        {/* Division and district */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="division">Division</Label>

            <select
              id="division"
              name="division"
              value={selectedDivision}
              onChange={onChange}
              required
              disabled={loading}
              aria-invalid={Boolean(errors.division)}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select a division</option>

              {DIVISION_OPTIONS.map((division) => (
                <option key={division.value} value={division.value}>
                  {division.label}
                </option>
              ))}
            </select>

            {renderErrors("division")}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="district">District</Label>

            <select
              id="district"
              name="district"
              value={values.district || ""}
              onChange={onChange}
              required
              disabled={loading || !selectedDivision}
              aria-invalid={Boolean(errors.district)}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">
                {selectedDivision
                  ? "Select a district"
                  : "Select division first"}
              </option>

              {availableDistricts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>

            {renderErrors("district")}
          </div>
        </div>

        {/* Description */}
        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="short_description">Short Description</Label>

            <span className="text-xs text-muted-foreground">
              {(values.short_description || "").length}/500
            </span>
          </div>

          <Textarea
            id="short_description"
            name="short_description"
            value={values.short_description || ""}
            onChange={onChange}
            placeholder="Write a short summary about your brand and what makes it special."
            maxLength={500}
            disabled={loading}
            aria-invalid={Boolean(errors.short_description)}
            className="min-h-30 rounded-2xl"
          />

          {renderErrors("short_description")}
        </div>

        {errors.non_field_errors && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {(Array.isArray(errors.non_field_errors)
              ? errors.non_field_errors
              : [errors.non_field_errors]
            ).map((item, index) => (
              <p key={index}>{item}</p>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={loading}
            className="gradient-button disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Please wait..." : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
