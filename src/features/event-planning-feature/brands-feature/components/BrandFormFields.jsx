import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import BrandLogoUpload from "./BrandLogoUpload";

import {
  DIVISION_DISTRICTS,
  DIVISION_OPTIONS,
} from "@/store/features/eventPlanner/bangladeshLocations";

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

function Chevron() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
  const selectedDivision = values.division || "";

  const availableDistricts = selectedDivision
    ? DIVISION_DISTRICTS[selectedDivision] || []
    : [];

  const handleSelectChange = (name) => (value) => {
    onChange({ target: { name, value } });
  };

  function handleWhatsappChange(e) {
    // keep only digits the user actually typed in the "01..." part
    const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
    onChange({ target: { name: "whatsapp_number", value: `+88${digits}` } });
  }

  // value shown in the input — strip the +88 (or 88) prefix back off for display
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
          <FieldLabel htmlFor="brand_name">Brand name</FieldLabel>

          <Input
            id="brand_name"
            name="brand_name"
            type="text"
            value={values.brand_name || ""}
            onChange={onChange}
            placeholder="Enter your brand name here"
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
      </div>

      {/* Location */}
      <div className="grid gap-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="grid gap-2">
            <FieldLabel htmlFor="division">Division</FieldLabel>

            <Select
              value={selectedDivision}
              onValueChange={handleSelectChange("division")}
              disabled={loading}
            >
              <SelectTrigger
                id="division"
                aria-invalid={Boolean(errors.division)}
                className="h-auto w-full justify-between rounded-none border-0 border-b-2 border-input bg-transparent px-0 pb-2 text-base shadow-none transition-colors focus:ring-0 focus-visible:border-foreground focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 [&>svg]:text-muted-foreground"
              >
                <SelectValue placeholder="Select a division" />
              </SelectTrigger>

              <SelectContent>
                {DIVISION_OPTIONS.map((division) => (
                  <SelectItem key={division.value} value={division.value}>
                    {division.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {renderErrors("division")}
          </div>

          <div className="grid gap-2">
            <FieldLabel htmlFor="district">District</FieldLabel>

            <Select
              value={values.district || ""}
              onValueChange={handleSelectChange("district")}
              disabled={loading || !selectedDivision}
            >
              <SelectTrigger
                id="district"
                aria-invalid={Boolean(errors.district)}
                className="h-auto w-full justify-between rounded-none border-0 border-b-2 border-input bg-transparent px-0 pb-2 text-base shadow-none transition-colors focus:ring-0 focus-visible:border-foreground focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 [&>svg]:text-muted-foreground"
              >
                <SelectValue
                  placeholder={
                    selectedDivision
                      ? "Select a district"
                      : "Select division first"
                  }
                />
              </SelectTrigger>

              <SelectContent>
                {availableDistricts.map((district) => (
                  <SelectItem key={district} value={district}>
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {renderErrors("district")}
          </div>
        </div>
      </div>

      {/* About */}
      <div className="grid gap-6">
        <div className="grid gap-2">
          <FieldLabel htmlFor="short_description">Short description</FieldLabel>

          <Textarea
            id="short_description"
            name="short_description"
            value={values.short_description || ""}
            onChange={onChange}
            placeholder="Write a short summary about your brand and what makes it special."
            maxLength={500}
            disabled={loading}
            aria-invalid={Boolean(errors.short_description)}
            className="peer min-h-28 resize-none rounded-none border-0 border-b-2 border-input bg-transparent px-0 pb-2 text-base leading-relaxed shadow-none transition-colors focus-visible:border-foreground focus-visible:ring-0"
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
