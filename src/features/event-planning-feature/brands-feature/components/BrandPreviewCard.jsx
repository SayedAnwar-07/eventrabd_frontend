import { DIVISION_OPTIONS } from "@/store/features/eventPlanner/bangladeshLocations";

export default function BrandPreviewCard({
  values,
  logoPreview,
  existingLogo,
}) {
  const brandName = values.brand_name?.trim();
  const description = values.short_description?.trim();
  const whatsapp = values.whatsapp_number?.trim();
  const district = values.district;
  const divisionLabel = DIVISION_OPTIONS.find(
    (d) => d.value === values.division,
  )?.label;

  const locationLine = [district, divisionLabel].filter(Boolean).join(", ");
  const initial = brandName ? brandName.charAt(0).toUpperCase() : "?";
  const logoSrc = logoPreview || existingLogo;
  const isComplete = Boolean(brandName && whatsapp && district);

  return (
    <div className="grid gap-3">
      <div className="flex items-baseline justify-between px-1">
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Vendor pass — preview
        </span>
      </div>

      {/* Outer frame */}
      <div
        className="relative border p-075"
        style={{
          clipPath:
            "polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)",
        }}
      >
        {/* Inner rule — passport-style double border */}
        <div className="border p-6">
          {/* Header row */}
          <div className="flex items-start justify-between gap-4">
            <div className="relative shrink-0">
              <div className="" aria-hidden="true" />
              {logoSrc ? (
                <img
                  src={logoSrc}
                  alt="Brand logo"
                  className="h-16 w-16 rounded-full border object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full border text-lg font-medium text-muted-foreground">
                  {initial}
                </div>
              )}
            </div>

            <div className="pt-1 text-right">
              <span
                className={`inline-block rotate-3 border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                  isComplete ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {isComplete ? "Ready" : "Draft"}
              </span>
            </div>
          </div>

          {/* Name */}
          <h3
            className={`mt-5 font-serif text-[28px] italic leading-[1.1] tracking-tight ${
              brandName ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {brandName || "Your brand name"}
          </h3>

          {/* Data rows with leader dots, passport-style */}
          <div className="mt-5 grid gap-2.5 border-t pt-4">
            <div className="flex items-baseline gap-2">
              <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Location
              </span>
              <span className="h-0 flex-1 border-b border-dotted border-muted-foreground/50" />
              <span className="text-sm text-foreground">
                {locationLine || "—"}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Contact
              </span>
              <span className="h-0 flex-1 border-b border-dotted border-muted-foreground/50" />
              <span className="font-mono text-sm text-foreground">
                {whatsapp || "—"}
              </span>
            </div>
          </div>

          {/* Description as a stamped note */}
          <div className="relative mt-5 border-t pt-4">
            <p
              className={`text-sm leading-relaxed ${
                description ? "text-foreground" : "italic text-muted-foreground"
              }`}
            >
              {description ||
                "Your short description will appear here once you start writing."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
