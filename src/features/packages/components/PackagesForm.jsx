import { useState } from "react";
import { Plus, X } from "lucide-react";

import GlobalErrorMessage from "@/components/common/GlobalErrorMessage";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  MAX_SHORT_INFO_ITEMS,
  MAX_SHORT_INFO_LENGTH,
} from "../utils/packageUtils";

const normalizeShortInfo = (shortInfo) => {
  if (!Array.isArray(shortInfo)) {
    return [];
  }

  return shortInfo
    .slice(0, MAX_SHORT_INFO_ITEMS)
    .map((item) => String(item ?? ""));
};

const PackagesForm = ({
  initialValues = {
    package_title: "",
    package_price: "",
    short_info: [],
  },
  loading = false,
  error = null,
  submitLabel = "Save Package",
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    package_title: initialValues.package_title ?? "",

    package_price: initialValues.package_price ?? "",

    short_info: normalizeShortInfo(initialValues.short_info),
  });

  const [validationError, setValidationError] = useState("");

  const clearValidationError = () => {
    if (validationError) {
      setValidationError("");
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    clearValidationError();
  };

  const handleAddShortInfo = () => {
    if (formData.short_info.length >= MAX_SHORT_INFO_ITEMS) {
      return;
    }

    setFormData((previous) => ({
      ...previous,

      short_info: [...previous.short_info, ""],
    }));

    clearValidationError();
  };

  const handleShortInfoChange = (index, value) => {
    setFormData((previous) => ({
      ...previous,

      short_info: previous.short_info.map((item, itemIndex) =>
        itemIndex === index ? value : item,
      ),
    }));

    clearValidationError();
  };

  const handleRemoveShortInfo = (index) => {
    setFormData((previous) => ({
      ...previous,

      short_info: previous.short_info.filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    }));

    clearValidationError();
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const packageTitle = formData.package_title.trim();

    const packagePrice = Number(formData.package_price);

    if (!packageTitle) {
      setValidationError("Package title is required.");

      return;
    }

    if (packageTitle.length > 100) {
      setValidationError("Package title can contain maximum 100 characters.");

      return;
    }

    if (
      !formData.package_price ||
      !Number.isFinite(packagePrice) ||
      packagePrice <= 0
    ) {
      setValidationError("Enter a valid package price.");

      return;
    }

    if (formData.short_info.length > MAX_SHORT_INFO_ITEMS) {
      setValidationError(
        `You can add maximum ${MAX_SHORT_INFO_ITEMS} short info items.`,
      );

      return;
    }

    const shortInfo = formData.short_info
      .map((item) => item.trim())
      .filter(Boolean);

    const invalidShortInfo = shortInfo.some(
      (item) => item.length > MAX_SHORT_INFO_LENGTH,
    );

    if (invalidShortInfo) {
      setValidationError(
        `Each short info can contain maximum ${MAX_SHORT_INFO_LENGTH} characters.`,
      );

      return;
    }

    onSubmit({
      package_title: packageTitle,

      package_price: formData.package_price,

      short_info: shortInfo,
    });
  };

  const canAddShortInfo = formData.short_info.length < MAX_SHORT_INFO_ITEMS;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {(validationError || error) && (
        <GlobalErrorMessage error={validationError || error} />
      )}

      {/* Package Title */}
      <div className="space-y-2">
        <Label htmlFor="package_title">Package Title</Label>

        <Input
          id="package_title"
          name="package_title"
          type="text"
          maxLength={100}
          value={formData.package_title}
          onChange={handleChange}
          placeholder="Basic Photography Package"
          disabled={loading}
          autoComplete="off"
        />

        <p className="text-xs text-muted-foreground">
          {formData.package_title.length}
          /100
        </p>
      </div>

      {/* Package Price */}
      <div className="space-y-2">
        <Label htmlFor="package_price">Package Price</Label>

        <div className="relative">
          <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
            ৳
          </span>

          <Input
            id="package_price"
            name="package_price"
            type="number"
            min="0.01"
            step="0.01"
            value={formData.package_price}
            onChange={handleChange}
            placeholder="5999.00"
            disabled={loading}
            className="pl-8"
          />
        </div>
      </div>

      {/* Short Info */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label>Short Info</Label>

            <p className="mt-1 text-xs text-muted-foreground">
              Optional. Maximum 3 items.
            </p>
          </div>

          <span className="text-xs text-muted-foreground">
            {formData.short_info.length}/{MAX_SHORT_INFO_ITEMS}
          </span>
        </div>

        {formData.short_info.map((item, index) => (
          <div key={index} className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={item}
                maxLength={MAX_SHORT_INFO_LENGTH}
                placeholder={`Short info ${index + 1}`}
                disabled={loading}
                onChange={(event) =>
                  handleShortInfoChange(index, event.target.value)
                }
              />

              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={loading}
                onClick={() => handleRemoveShortInfo(index)}
                className="shrink-0"
              >
                <X className="size-4" />

                <span className="sr-only">Remove short info</span>
              </Button>
            </div>

            <div className="text-right text-xs text-muted-foreground">
              {item.length}/{MAX_SHORT_INFO_LENGTH}
            </div>
          </div>
        ))}

        {canAddShortInfo && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={handleAddShortInfo}
          >
            <Plus className="size-4" />
            Add Short Info
          </Button>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Please wait..." : submitLabel}
      </Button>
    </form>
  );
};

export default PackagesForm;
