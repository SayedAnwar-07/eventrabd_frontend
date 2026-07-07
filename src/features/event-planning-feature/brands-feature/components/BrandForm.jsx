import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import StatusAlert from "@/components/shared/status-alert";

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

        <div className="grid gap-2">
          <Label htmlFor="brand_name">Brand Name</Label>
          <Input
            id="brand_name"
            name="brand_name"
            value={values.brand_name}
            onChange={onChange}
            placeholder="Dream Weddings"
            className="h-11 rounded-xl"
          />
          {errors.brand_name?.map((item, index) => (
            <p key={index} className="text-sm text-destructive">
              {item}
            </p>
          ))}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="logo">Brand Logo</Label>

          <div className="flex items-center gap-4">
            <div className="relative">
              {logoPreview || existingLogo ? (
                <>
                  <img
                    src={logoPreview || existingLogo}
                    alt="Brand Logo"
                    className={`h-24 w-24 rounded-2xl border object-cover ${
                      !logoPreview && existingLogo ? "" : ""
                    }`}
                  />

                  {(logoPreview || existingLogo) && (
                    <button
                      type="button"
                      onClick={onRemoveLogo}
                      className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black text-white"
                    >
                      X
                    </button>
                  )}
                </>
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl border bg-muted text-sm text-muted-foreground">
                  No Logo
                </div>
              )}
            </div>

            <div>
              <Input
                id="logo"
                name="logo"
                type="file"
                accept="image/*"
                onChange={onLogoChange}
              />

              <p className="mt-1 text-xs text-muted-foreground">
                Maximum size: 1MB
              </p>
            </div>
          </div>

          {errors.logo?.map((item, index) => (
            <p key={index} className="text-sm text-destructive">
              {item}
            </p>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
            <Input
              id="whatsapp_number"
              name="whatsapp_number"
              value={values.whatsapp_number}
              onChange={onChange}
              placeholder="+8801XXXXXXXXX"
              className="h-11 rounded-xl"
            />
            {errors.whatsapp_number?.map((item, index) => (
              <p key={index} className="text-sm text-destructive">
                {item}
              </p>
            ))}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="service_area">Service Area</Label>
            <Input
              id="service_area"
              name="service_area"
              value={values.service_area}
              onChange={onChange}
              placeholder="Dhaka"
              className="h-11 rounded-xl"
            />
            {errors.service_area?.map((item, index) => (
              <p key={index} className="text-sm text-destructive">
                {item}
              </p>
            ))}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="short_description">Short Description</Label>
          <Textarea
            id="short_description"
            name="short_description"
            value={values.short_description}
            onChange={onChange}
            placeholder="Write a short summary about your brand and what makes it special."
            className="min-h-30 rounded-2xl"
          />
          {errors.short_description?.map((item, index) => (
            <p key={index} className="text-sm text-destructive">
              {item}
            </p>
          ))}
        </div>

        {errors.non_field_errors?.length > 0 && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {errors.non_field_errors.map((item, index) => (
              <p key={index}>{item}</p>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={loading}
            className="gradient-button disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Please wait..." : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
