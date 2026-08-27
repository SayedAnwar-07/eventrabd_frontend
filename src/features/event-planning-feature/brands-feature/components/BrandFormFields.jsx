import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import BrandLogoUpload from "./BrandLogoUpload";

import { DIVISION_OPTIONS } from "@/store/features/eventPlanner/bangladeshLocations";
import RichTextEditor from "@/components/common/RichTextEditor";

const fieldClass =
  "h-auto w-full rounded-none border-0 border-b-2 border-input bg-transparent px-0 pb-2 text-base shadow-none transition-colors focus-visible:border-foreground focus-visible:ring-0";

function FieldLabel({ htmlFor, children }) {
  return (
    <Label
      htmlFor={htmlFor}
      className="text-[13px] font-normal text-muted-foreground transition-colors peer-focus:text-foreground"
    >
      {children}
    </Label>
  );
}

export default function BrandFormFields({
  values,
  onChange,
  errors = {},
  loading,
  logoPreview,
  existingLogo,
  onLogoChange,
  onRemoveLogo,
}) {
  const selectedDivisions = Array.isArray(values.division)
    ? values.division
    : [];

  const handleDivisionToggle = (division) => {
    let nextDivisions;

    if (division === "whole_bangladesh") {
      nextDivisions = selectedDivisions.includes("whole_bangladesh")
        ? []
        : ["whole_bangladesh"];
    } else {
      const individualDivisions = selectedDivisions.filter(
        (item) => item !== "whole_bangladesh",
      );

      nextDivisions = individualDivisions.includes(division)
        ? individualDivisions.filter((item) => item !== division)
        : [...individualDivisions, division];
    }

    onChange({
      target: {
        name: "division",
        value: nextDivisions,
      },
    });
  };

  function handleWhatsappChange(e) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 11);

    onChange({
      target: {
        name: "whatsapp_number",
        value: `+88${digits}`,
      },
    });
  }

  const whatsappLocal = (values.whatsapp_number || "")
    .replace(/^\+?88/, "")
    .slice(0, 11);

  const renderErrors = (fieldName) => {
    const fieldErrors = errors[fieldName];

    if (!fieldErrors) {
      return null;
    }

    const normalizedErrors = Array.isArray(fieldErrors)
      ? fieldErrors
      : [fieldErrors];

    return (
      <div className="space-y-0.5">
        {normalizedErrors.map((item, index) => (
          <p
            key={`${fieldName}-${index}`}
            className="text-xs font-medium text-destructive"
          >
            {item}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="grid gap-10">
      {/* Identity */}
      <div className="grid gap-6">
        <div className="grid gap-2">
          <FieldLabel htmlFor="display_name">
            Display Name (Bangla or English)
          </FieldLabel>

          <Input
            id="display_name"
            name="display_name"
            type="text"
            value={values.display_name || ""}
            onChange={onChange}
            placeholder="Enter your brand name here"
            maxLength={255}
            required
            disabled={loading}
            aria-invalid={Boolean(errors.display_name)}
            className={`peer ${fieldClass} text-lg font-medium`}
          />

          {renderErrors("display_name")}
        </div>

        <div className="grid gap-2">
          <FieldLabel htmlFor="brand_name">
            Brand Username (English Only)
          </FieldLabel>

          <Input
            id="brand_name"
            name="brand_name"
            type="text"
            value={values.brand_name || ""}
            onChange={onChange}
            placeholder="Enter your brand's username here"
            maxLength={255}
            required
            disabled={loading}
            aria-invalid={Boolean(errors.brand_name)}
            className={`peer ${fieldClass} text-lg font-medium`}
          />

          {renderErrors("brand_name")}
        </div>

        <BrandLogoUpload
          logoPreview={logoPreview}
          existingLogo={existingLogo}
          onLogoChange={onLogoChange}
          onRemoveLogo={onRemoveLogo}
          loading={loading}
          error={renderErrors("logo")}
        />
      </div>

      {/* Contact */}
      <div className="grid gap-6">
        <div className="grid gap-2">
          <FieldLabel htmlFor="whatsapp_number">WhatsApp number</FieldLabel>

          <div
            className={`peer flex items-baseline gap-1 border-0 border-b-2 border-input pb-2 transition-colors focus-within:border-foreground ${
              errors.whatsapp_number ? "border-destructive" : ""
            }`}
          >
            <span className="select-none font-mono text-base tracking-wide">
              +88
            </span>

            <input
              id="whatsapp_number"
              name="whatsapp_number_local"
              type="tel"
              inputMode="numeric"
              value={whatsappLocal}
              onChange={handleWhatsappChange}
              placeholder="01XXXXXXXXX"
              maxLength={11}
              required
              disabled={loading}
              aria-invalid={Boolean(errors.whatsapp_number)}
              className="h-auto w-full border-0 bg-transparent p-0 font-mono text-base tracking-wide shadow-none outline-none focus-visible:ring-0"
            />
          </div>

          {renderErrors("whatsapp_number")}
        </div>

        <div className="grid gap-2">
          <FieldLabel htmlFor="office_address">
            Office Address (Optional)
          </FieldLabel>

          <Textarea
            id="office_address"
            name="office_address"
            value={values.office_address || ""}
            onChange={onChange}
            placeholder="Enter your office or business address"
            maxLength={500}
            disabled={loading}
            aria-invalid={Boolean(errors.office_address)}
            className="peer min-h-24 resize-none rounded-none border-0 border-b-2 border-input bg-transparent px-0 pb-2 text-base leading-relaxed shadow-none transition-colors focus-visible:border-foreground focus-visible:ring-0"
          />

          {renderErrors("office_address")}
        </div>
      </div>

      {/* Service Areas */}
      <div className="grid gap-3">
        <div>
          <p className="text-[13px] font-normal text-muted-foreground">
            Service Areas (Divisions)
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Select all divisions where your brand provides services.
          </p>
        </div>

        <div
          className="grid gap-3 sm:grid-cols-2"
          aria-invalid={Boolean(errors.division)}
        >
          {DIVISION_OPTIONS.map((division) => {
            const checked = selectedDivisions.includes(division.value);

            return (
              <label
                key={division.value}
                className={`flex cursor-pointer items-center gap-3 border px-4 py-3 transition-colors ${
                  checked
                    ? "border-foreground bg-muted"
                    : "border-border hover:bg-muted/50"
                } ${
                  loading
                    ? "pointer-events-none cursor-not-allowed opacity-50"
                    : ""
                }`}
              >
                <input
                  type="checkbox"
                  name="division"
                  value={division.value}
                  checked={checked}
                  onChange={() => handleDivisionToggle(division.value)}
                  disabled={loading}
                  className="h-4 w-4 accent-foreground"
                />

                <span className="text-sm font-medium">{division.label}</span>
              </label>
            );
          })}
        </div>

        {renderErrors("division")}
      </div>

      {/* Portfolio */}
      <div className="grid gap-6">
        <div className="grid gap-2">
          <FieldLabel htmlFor="portfolio_link">Portfolio Link</FieldLabel>

          <Input
            id="portfolio_link"
            name="portfolio_link"
            type="url"
            value={values.portfolio_link || ""}
            onChange={onChange}
            placeholder="Google Drive or YouTube portfolio link"
            disabled={loading}
            aria-invalid={Boolean(errors.portfolio_link)}
            className={`peer ${fieldClass}`}
          />

          {renderErrors("portfolio_link")}
        </div>
      </div>

      {/* About */}
      <div className="grid gap-6">
        <div className="grid gap-2">
          <FieldLabel htmlFor="short_description">Short description</FieldLabel>

          <RichTextEditor
            name="short_description"
            value={values.short_description || ""}
            onChange={onChange}
            disabled={loading}
          />

          {renderErrors("short_description")}
        </div>
      </div>

      {errors.non_field_errors && (
        <div className="rounded-2xl border border-destructive/30 px-4 py-3 text-sm text-destructive">
          {(Array.isArray(errors.non_field_errors)
            ? errors.non_field_errors
            : [errors.non_field_errors]
          ).map((item, index) => (
            <p key={index} className="leading-relaxed">
              {item}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
