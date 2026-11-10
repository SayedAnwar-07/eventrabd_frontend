import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import BrandLogoUpload from "./BrandLogoUpload";
import { DIVISION_OPTIONS } from "@/store/features/eventPlanner/bangladeshLocations";
import RichTextEditor from "@/components/common/RichTextEditor";
import { useState } from "react";

const fieldClass =
  "h-11 w-full rounded-md border border-[#E5DDD5] bg-gray-50 px-3 text-sm text-theme-color shadow-none transition-colors placeholder:text-[#A69B91] focus-visible:border-[#A68C78] focus-visible:ring-2 focus-visible:ring-[#A68C78]/20 disabled:cursor-not-allowed disabled:bg-[#F8F5F2] disabled:opacity-70";

function FieldLabel({ htmlFor, children }) {
  return (
    <Label
      htmlFor={htmlFor}
      className="mb-1.5 block text-xs font-medium text-[#51463E]"
    >
      {children}
    </Label>
  );
}

function SectionHeader({ title, description }) {
  return (
    <div className="border-b border-[#F0EAE4] bg-[#FFFCF9] px-4 py-3.5 sm:px-6">
      <h3 className="text-sm font-semibold text-theme-color">{title}</h3>
      <p className="mt-1 text-xs text-[#756A62]">{description}</p>
    </div>
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

  const [whatsappError, setWhatsappError] = useState("");

  // Division selection
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

  // WhatsApp number formatting

  const handleWhatsappChange = (e) => {
    let digits = e.target.value.replace(/\D/g, "");

    // Convert international Bangladesh number to local format
    if (digits.startsWith("880")) {
      digits = `0${digits.slice(3)}`;
    } else if (digits.startsWith("88")) {
      digits = digits.slice(2);
    }

    // Validate exactly 11 digits
    if (digits.length > 0 && digits.length !== 11) {
      setWhatsappError("WhatsApp number must contain exactly 11 digits.");
    } else {
      setWhatsappError("");
    }

    onChange({
      target: {
        name: "whatsapp_number",
        value: digits ? `+88${digits}` : "",
      },
    });
  };

  // Display cleaned local number
  const whatsappLocal = (values.whatsapp_number || "").replace(/^\+?88/, "");

  // Validation errors
  const renderErrors = (fieldName) => {
    const fieldErrors = errors[fieldName];

    if (!fieldErrors) return null;

    const normalizedErrors = Array.isArray(fieldErrors)
      ? fieldErrors
      : [fieldErrors];

    return (
      <div className="mt-1.5 space-y-1">
        {normalizedErrors.map((item, index) => (
          <p
            key={`${fieldName}-${index}`}
            className="text-xs font-medium leading-relaxed text-red-600"
          >
            {item}
          </p>
        ))}
      </div>
    );
  };

  // Reusable input wrapper
  const renderInput = ({
    id,
    name,
    label,
    placeholder,
    type = "text",
    required = false,
    maxLength,
    className = "",
  }) => (
    <div className="min-w-0">
      <FieldLabel htmlFor={id}>
        {label}
        {required && <span className="ml-1 text-red-600">*</span>}
        {!required && (
          <span className="ml-1 text-[11px] font-normal text-[#9B9087]">
            (Optional)
          </span>
        )}
      </FieldLabel>

      <Input
        id={id}
        name={name}
        type={type}
        value={values[name] || ""}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        required={required}
        disabled={loading}
        aria-invalid={Boolean(errors[name])}
        className={`${fieldClass} ${className} ${
          errors[name] ? "border-red-500" : ""
        }`}
      />

      {renderErrors(name)}
    </div>
  );

  return (
    <div className="grid min-w-0 gap-5">
      {/* =================================================
          SECTION 1 - BRAND IMAGES
      ================================================= */}
      <section className="overflow-hidden rounded-md border border-[#E5DDD5] bg-white shadow-[0_1px_2px_rgba(61,53,48,0.04),0_8px_24px_-12px_rgba(61,53,48,0.10)]">
        <SectionHeader
          title="Brand Images"
          description="Upload your brand logo and visual identity."
        />

        <div className="p-4 sm:p-6">
          <BrandLogoUpload
            logoPreview={logoPreview}
            existingLogo={existingLogo}
            onLogoChange={onLogoChange}
            onRemoveLogo={onRemoveLogo}
            loading={loading}
            error={renderErrors("logo")}
          />
        </div>
      </section>

      {/* =================================================
          SECTION 2 - BRAND & CONTACT INFORMATION
      ================================================= */}
      <section className="overflow-hidden rounded-md border border-[#E5DDD5] bg-white shadow-[0_1px_2px_rgba(61,53,48,0.04),0_8px_24px_-12px_rgba(61,53,48,0.10)]">
        <SectionHeader
          title="Brand & Contact Information"
          description="Provide your brand identity and business contact details."
        />

        <div className="grid grid-cols-1 gap-x-5 gap-y-5 p-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-6 sm:p-6">
          {/* Display Name */}
          {renderInput({
            id: "display_name",
            name: "display_name",
            label: "Display Name (Bangla or English)",
            placeholder: "Enter your brand name here",
            required: true,
            maxLength: 255,
            className: "text-base font-medium",
          })}

          {/* Brand Username */}
          {renderInput({
            id: "brand_name",
            name: "brand_name",
            label: "Brand Username (English Only)",
            placeholder: "Enter your brand's username here",
            required: true,
            maxLength: 255,
            className: "text-base font-medium",
          })}

          {/* WhatsApp Number */}
          <div className="min-w-0">
            <FieldLabel htmlFor="whatsapp_number">
              WhatsApp Number
              <span className="ml-1 text-red-600">*</span>
            </FieldLabel>

            <div
              className={`flex h-11 items-center gap-2 rounded-md border border-[#E5DDD5] bg-gray-50 px-3 transition-colors focus-within:border-[#A68C78] focus-within:ring-2 focus-within:ring-[#A68C78]/20 ${
                errors.whatsapp_number ? "border-red-500" : ""
              } ${loading ? "opacity-70" : ""}`}
            >
              <span className="shrink-0 select-none border-r border-[#E5DDD5] pr-3 font-mono text-sm font-medium text-[#756A62]">
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
                required
                disabled={loading}
                aria-invalid={Boolean(errors.whatsapp_number)}
                className="h-full w-full min-w-0 border-0 bg-transparent p-0 font-mono text-sm tracking-wide text-theme-color outline-none placeholder:text-[#A69B91] focus-visible:ring-0 disabled:cursor-not-allowed"
              />
            </div>

            {whatsappError && (
              <p className="mt-1.5 text-xs font-medium text-red-600">
                {whatsappError}
              </p>
            )}

            {renderErrors("whatsapp_number")}
          </div>

          {/* Portfolio Link */}
          {renderInput({
            id: "portfolio_link",
            name: "portfolio_link",
            label: "Portfolio Link",
            placeholder: "Google Drive or YouTube portfolio link",
            type: "url",
          })}

          {/* Office Address - Full Width */}
          <div className="min-w-0 sm:col-span-2">
            <FieldLabel htmlFor="office_address">
              Office Address
              <span className="ml-1 text-[11px] font-normal text-[#9B9087]">
                (Optional)
              </span>
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
              className={`min-h-24 w-full resize-none rounded-md border border-[#E5DDD5] bg-gray-50 px-3 py-3 text-sm leading-relaxed text-theme-color shadow-none transition-colors placeholder:text-[#A69B91] focus-visible:border-[#A68C78] focus-visible:ring-2 focus-visible:ring-[#A68C78]/20 disabled:bg-[#F8F5F2] ${
                errors.office_address ? "border-red-500" : ""
              }`}
            />

            {renderErrors("office_address")}
          </div>
        </div>
      </section>

      {/* =================================================
          SECTION 3 - SERVICE AREAS
      ================================================= */}
      <section className="overflow-hidden rounded-md border border-[#E5DDD5] bg-white shadow-[0_1px_2px_rgba(61,53,48,0.04),0_8px_24px_-12px_rgba(61,53,48,0.10)]">
        <SectionHeader
          title="Service Areas"
          description="Choose the divisions where your brand provides services."
        />

        <div className="p-4 sm:p-6">
          <div
            className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
            aria-invalid={Boolean(errors.division)}
          >
            {DIVISION_OPTIONS.map((division) => {
              const checked = selectedDivisions.includes(division.value);

              return (
                <label
                  key={division.value}
                  className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-md border px-4 py-3 transition-all duration-200 ${
                    checked
                      ? "border-[#A68C78] bg-[#F8F5F2] shadow-[0_1px_3px_rgba(61,53,48,0.05)]"
                      : "border-[#E5DDD5] bg-white hover:border-[#CFC2B6] hover:bg-[#FFFCF9]"
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
                    className="h-4 w-4 shrink-0 cursor-pointer accent-[#A68C78]"
                  />

                  <span
                    className={`text-sm ${
                      checked
                        ? "font-semibold text-theme-color"
                        : "font-medium text-[#51463E]"
                    }`}
                  >
                    {division.label}
                  </span>
                </label>
              );
            })}
          </div>

          {renderErrors("division")}
        </div>
      </section>

      {/* =================================================
          SECTION 4 - ABOUT YOUR BRAND
      ================================================= */}
      <section className="overflow-hidden rounded-md border border-[#E5DDD5] bg-white shadow-[0_1px_2px_rgba(61,53,48,0.04),0_8px_24px_-12px_rgba(61,53,48,0.10)]">
        <SectionHeader
          title="About Your Brand"
          description="Introduce your brand, services and what makes your business unique."
        />

        <div className="">
          <div className="grid gap-1.5">
            <div
              className={`overflow-hidden ${
                errors.short_description ? "border-red-500" : ""
              }`}
            >
              <RichTextEditor
                name="short_description"
                value={values.short_description || ""}
                onChange={onChange}
                disabled={loading}
              />
            </div>

            {renderErrors("short_description")}
          </div>
        </div>
      </section>

      {/* =================================================
          GENERAL FORM ERRORS
      ================================================= */}
      {errors.non_field_errors && (
        <div className="rounded-md border border-red-200 bg-red-50/70 px-4 py-3.5 text-sm text-red-700">
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
