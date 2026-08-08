import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function BrandLogoUpload({
  logoPreview,
  existingLogo,
  onLogoChange,
  onRemoveLogo,
  loading,
  error,
}) {
  return (
    <div className="grid gap-2">
      <Label
        htmlFor="logo"
        className="text-[13px] font-normal text-muted-foreground"
      >
        Brand logo
      </Label>

      <div className="flex items-center gap-5">
        <div className="relative shrink-0">
          {logoPreview || existingLogo ? (
            <>
              <img
                src={logoPreview || existingLogo}
                alt="Brand logo preview"
                className="h-20 w-20 rounded-full border object-cover"
              />

              <button
                type="button"
                onClick={onRemoveLogo}
                disabled={loading}
                aria-label="Remove logo"
                className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border bg-background text-xs leading-none transition-transform hover:scale-110 disabled:pointer-events-none disabled:opacity-50"
              >
                ×
              </button>
            </>
          ) : (
            <label
              htmlFor="logo"
              className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-full border border-dashed text-[11px] leading-tight text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
            >
              Upload
            </label>
          )}
        </div>

        <div className="flex-1 space-y-1">
          <Input
            id="logo"
            name="logo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onLogoChange}
            disabled={loading}
            className="h-auto cursor-pointer rounded-none border-0 border-b-2 border-input bg-transparent px-0 pb-2 text-sm shadow-none file:mr-3 file:cursor-pointer file:rounded-full file:border file:bg-transparent file:px-3 file:py-1 file:text-xs file:font-medium focus-visible:border-foreground focus-visible:ring-0"
          />

          <p className="text-xs text-muted-foreground">
            JPEG, PNG or WebP · Max 1MB
          </p>
        </div>
      </div>

      {error && <div className="text-sm text-destructive">{error}</div>}
    </div>
  );
}
