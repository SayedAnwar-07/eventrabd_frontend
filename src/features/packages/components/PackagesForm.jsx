import { useState } from "react";

import GlobalErrorMessage from "@/components/common/GlobalErrorMessage";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PackagesForm = ({
  initialValues = {
    package_title: "",
    package_price: "",
  },
  loading = false,
  error = null,
  submitLabel = "Save Package",
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    package_title: initialValues.package_title ?? "",
    package_price: initialValues.package_price ?? "",
  });

  const [validationError, setValidationError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (validationError) {
      setValidationError("");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const packageTitle = formData.package_title.trim();
    const packagePrice = Number(formData.package_price);

    if (!packageTitle) {
      setValidationError("Package title is required.");
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

    onSubmit({
      package_title: packageTitle,
      package_price: formData.package_price,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {(validationError || error) && (
        <GlobalErrorMessage error={validationError || error} />
      )}

      <div className="space-y-2">
        <Label htmlFor="package_title">Package Title</Label>

        <Input
          id="package_title"
          name="package_title"
          type="text"
          value={formData.package_title}
          onChange={handleChange}
          placeholder="Basic Photography Package"
          disabled={loading}
          autoComplete="off"
        />
      </div>

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

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Please wait..." : submitLabel}
      </Button>
    </form>
  );
};

export default PackagesForm;
