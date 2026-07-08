"use client";

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  createEventService,
  updateEventService,
  clearOperationState,
} from "@/store/features/eventService/eventServiceSlice";

import {
  selectOperationLoading,
  selectOperationError,
} from "@/store/features/eventService/eventServiceSelector";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// ── Backend-aligned constants ─────────────────────────

const SERVICE_TYPES = [
  { value: "photography", label: "Photography" },
  { value: "videography", label: "Videography" },
  { value: "stage_designer", label: "Stage Designer" },
  { value: "sound_lighting", label: "Sound System and Lighting" },
  { value: "event_hall", label: "Event Hall" },
];

const SERVICE_IMAGE_LIMITS = {
  photography: 5,
  stage_designer: 5,
  event_hall: 5,
  videography: 0,
  sound_lighting: 0,
};

const GALLERY_ONLY_SERVICE_TYPES = new Set([
  "photography",
  "stage_designer",
  "event_hall",
]);

const COVER_PHOTO_ONLY_SERVICE_TYPES = new Set([
  "videography",
  "sound_lighting",
]);

const SHIFT_HOUR_REQUIRED_TYPES = new Set([
  "photography",
  "videography",
  "sound_lighting",
  "event_hall",
]);

const DRIVE_LINK_REQUIRED_TYPES = new Set(["videography"]);

const PAYMENT_REQUIRED_TYPES = new Set(["sound_lighting"]);

const FIELD_LABELS = {
  service_name: "Service type",
  drive_link: "Drive or YouTube link",
  shift_charge: "Shift charge",
  description: "Description",
  shift_hour: "Shift hour",
  sound_system_payment: "Sound system payment",
  lighting_payment: "Lighting payment",
  cover_photo: "Cover photo",
  add_gallery_images: "Gallery images",
  remove_gallery_image_ids: "Gallery images",
  non_field_errors: "Error",
  detail: "Error",
};

const inputClass =
  "w-full border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60";

const labelClass = "mb-1 block text-sm font-medium";

const primaryButtonClass =
  "bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60";

const secondaryButtonClass =
  "border border-input bg-background px-4 py-2 text-sm font-semibold hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60";

const smallPrimaryButtonClass =
  "bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60";

const smallSecondaryButtonClass =
  "border border-input bg-background px-3 py-2 text-xs font-semibold hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60";

// ── Helpers ──────────────────────────────────────────

const createInitialForm = (service = null) => ({
  service_name: service?.service_name || "",
  drive_link: service?.drive_link || "",
  shift_charge: service?.shift_charge ?? "",
  description: service?.description || "",
  shift_hour: service?.shift_hour ?? "",
  sound_system_payment: service?.sound_system_payment ?? "",
  lighting_payment: service?.lighting_payment ?? "",
  cover_photo: null,
  add_gallery_images: [],
  remove_gallery_image_ids: [],
});

const isEmptyValue = (value) => {
  return value === "" || value === null || value === undefined;
};

const getFieldLabel = (key) => {
  return FIELD_LABELS[key] || key.replaceAll("_", " ");
};

const stripHtml = (value) => {
  if (typeof value !== "string") return "";

  const titleMatch = value.match(/<title>(.*?)<\/title>/i);

  if (titleMatch?.[1]) {
    return titleMatch[1].trim();
  }

  if (value.includes("<!DOCTYPE") || value.includes("<html")) {
    return "Server error. Check backend console.";
  }

  return value
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const getCleanErrorMessage = (error) => {
  if (!error) return "";

  if (typeof error === "string") {
    return stripHtml(error) || "Something went wrong.";
  }

  if (Array.isArray(error)) {
    return error.map(getCleanErrorMessage).filter(Boolean).join(" ");
  }

  if (typeof error === "object") {
    if (error.detail) return getCleanErrorMessage(error.detail);
    if (error.message) return getCleanErrorMessage(error.message);
    if (error.error) return getCleanErrorMessage(error.error);

    const messages = Object.entries(error)
      .map(([key, value]) => {
        const label = getFieldLabel(key);

        if (Array.isArray(value)) {
          return `${label}: ${value.map(getCleanErrorMessage).join(" ")}`;
        }

        if (typeof value === "object" && value !== null) {
          return `${label}: ${getCleanErrorMessage(value)}`;
        }

        return `${label}: ${getCleanErrorMessage(value)}`;
      })
      .filter(Boolean);

    return messages.join(" ");
  }

  return "Something went wrong.";
};

const getGalleryImageUrl = (image) => {
  return (
    image?.image_url ||
    image?.gallery_image_url ||
    image?.url ||
    image?.image ||
    ""
  );
};

const createPreviewId = (file, index) => {
  return `${file.name}-${file.size}-${file.lastModified}-${index}`;
};

const isBlobUrl = (url) => {
  return typeof url === "string" && url.startsWith("blob:");
};

const getServiceNameForUrl = (service) => {
  return service?.slug || service?.service_name || "";
};

// ── Component ────────────────────────────────────────

const EventServiceSheet = ({
  brandSlug,
  service = null,
  trigger,
  onSuccess,
}) => {
  const dispatch = useDispatch();

  const loading = useSelector(selectOperationLoading);
  const reduxError = useSelector(selectOperationError);

  const coverInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const objectUrlsRef = useRef(new Set());

  const isEdit = Boolean(service);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(() => createInitialForm(service));
  const [coverPreview, setCoverPreview] = useState(
    service?.cover_photo_url || "",
  );
  const [newGalleryPreviews, setNewGalleryPreviews] = useState([]);
  const [localError, setLocalError] = useState("");

  const serviceType = form.service_name;

  const selectedImageLimit = SERVICE_IMAGE_LIMITS[serviceType] ?? 0;

  const isGalleryOnlyType = GALLERY_ONLY_SERVICE_TYPES.has(serviceType);
  const isCoverPhotoOnlyType = COVER_PHOTO_ONLY_SERVICE_TYPES.has(serviceType);

  const showShiftHour = SHIFT_HOUR_REQUIRED_TYPES.has(serviceType);
  const showDriveLink = DRIVE_LINK_REQUIRED_TYPES.has(serviceType);
  const showPaymentFields = PAYMENT_REQUIRED_TYPES.has(serviceType);

  const existingGalleryImages = Array.isArray(service?.gallery_images)
    ? service.gallery_images
    : [];

  const removedImageCount = form.remove_gallery_image_ids.length;
  const newGalleryImageCount = form.add_gallery_images.length;

  const currentExistingImageCount = Math.max(
    existingGalleryImages.length - removedImageCount,
    0,
  );

  const availableGallerySlots = Math.max(
    selectedImageLimit - currentExistingImageCount - newGalleryImageCount,
    0,
  );

  const canUploadGalleryImages = isGalleryOnlyType && selectedImageLimit > 0;
  const canUploadCoverPhoto = isCoverPhotoOnlyType;

  const visibleError = localError || getCleanErrorMessage(reduxError);

  const createObjectUrl = (file) => {
    const url = URL.createObjectURL(file);
    objectUrlsRef.current.add(url);
    return url;
  };

  const revokeObjectUrl = (url) => {
    if (isBlobUrl(url) && objectUrlsRef.current.has(url)) {
      URL.revokeObjectURL(url);
      objectUrlsRef.current.delete(url);
    }
  };

  const revokeAllObjectUrls = () => {
    objectUrlsRef.current.forEach((url) => {
      URL.revokeObjectURL(url);
    });

    objectUrlsRef.current.clear();
  };

  const clearFileInputs = () => {
    if (coverInputRef.current) {
      coverInputRef.current.value = "";
    }

    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
  };

  const resetSheetState = () => {
    revokeAllObjectUrls();

    setForm(createInitialForm(service));
    setCoverPreview(service?.cover_photo_url || "");
    setNewGalleryPreviews([]);
    setLocalError("");

    clearFileInputs();
    dispatch(clearOperationState());
  };

  const handleOpenChange = (value) => {
    resetSheetState();
    setOpen(value);
  };

  useEffect(() => {
    return () => {
      revokeAllObjectUrls();
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setLocalError("");

    if (name !== "service_name") {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));

      return;
    }

    revokeAllObjectUrls();
    clearFileInputs();

    setCoverPreview("");
    setNewGalleryPreviews([]);

    setForm((prev) => {
      const nextForm = {
        ...prev,
        service_name: value,
        cover_photo: null,
        add_gallery_images: [],
        remove_gallery_image_ids: [],
      };

      if (!DRIVE_LINK_REQUIRED_TYPES.has(value)) {
        nextForm.drive_link = "";
      }

      if (!SHIFT_HOUR_REQUIRED_TYPES.has(value)) {
        nextForm.shift_hour = "";
      }

      if (!PAYMENT_REQUIRED_TYPES.has(value)) {
        nextForm.sound_system_payment = "";
        nextForm.lighting_payment = "";
      }

      return nextForm;
    });
  };

  const openCoverFilePicker = () => {
    coverInputRef.current?.click();
  };

  const openGalleryFilePicker = () => {
    galleryInputRef.current?.click();
  };

  const handleCoverPhotoChange = (e) => {
    const file = e.target.files?.[0] || null;

    if (!file) return;

    if (!canUploadCoverPhoto) {
      setLocalError("This service type does not support cover photo.");
      e.target.value = "";
      return;
    }

    revokeObjectUrl(coverPreview);

    const previewUrl = createObjectUrl(file);

    setForm((prev) => ({
      ...prev,
      cover_photo: file,
    }));

    setCoverPreview(previewUrl);
    setLocalError("");
  };

  const removeSelectedCoverPhoto = () => {
    if (form.cover_photo) {
      revokeObjectUrl(coverPreview);
    }

    setForm((prev) => ({
      ...prev,
      cover_photo: null,
    }));

    setCoverPreview(service?.cover_photo_url || "");

    if (coverInputRef.current) {
      coverInputRef.current.value = "";
    }
  };

  const handleGalleryImagesChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    if (!canUploadGalleryImages) {
      setLocalError("This service type does not support gallery images.");
      e.target.value = "";
      return;
    }

    if (availableGallerySlots === 0) {
      setLocalError("No gallery image slot is available.");
      e.target.value = "";
      return;
    }

    if (files.length > availableGallerySlots) {
      setLocalError(
        `You can upload only ${availableGallerySlots} more gallery image(s).`,
      );
      e.target.value = "";
      return;
    }

    const previews = files.map((file, index) => ({
      id: createPreviewId(file, index),
      file,
      url: createObjectUrl(file),
      name: file.name,
    }));

    setForm((prev) => ({
      ...prev,
      add_gallery_images: [...prev.add_gallery_images, ...files],
    }));

    setNewGalleryPreviews((prev) => [...prev, ...previews]);
    setLocalError("");

    e.target.value = "";
  };

  const removeNewGalleryImage = (previewId) => {
    const selectedPreview = newGalleryPreviews.find(
      (preview) => preview.id === previewId,
    );

    if (!selectedPreview) return;

    revokeObjectUrl(selectedPreview.url);

    setNewGalleryPreviews((prev) =>
      prev.filter((preview) => preview.id !== previewId),
    );

    setForm((prev) => ({
      ...prev,
      add_gallery_images: prev.add_gallery_images.filter(
        (file) => file !== selectedPreview.file,
      ),
    }));
  };

  const toggleRemoveGalleryImage = (imageId) => {
    const normalizedImageId = String(imageId);

    setForm((prev) => {
      const alreadySelected =
        prev.remove_gallery_image_ids.includes(normalizedImageId);

      return {
        ...prev,
        remove_gallery_image_ids: alreadySelected
          ? prev.remove_gallery_image_ids.filter(
              (id) => id !== normalizedImageId,
            )
          : [...prev.remove_gallery_image_ids, normalizedImageId],
      };
    });
  };

  const validateForm = () => {
    if (!brandSlug) {
      return "Brand slug is missing.";
    }

    if (!form.service_name) {
      return "Service type is required.";
    }

    if (isEmptyValue(form.shift_charge)) {
      return "Shift charge is required.";
    }

    if (Number(form.shift_charge) < 0) {
      return "Shift charge cannot be negative.";
    }

    if (showShiftHour && isEmptyValue(form.shift_hour)) {
      return "Shift hour is required.";
    }

    if (showShiftHour && Number(form.shift_hour) <= 0) {
      return "Shift hour must be greater than 0.";
    }

    if (showDriveLink && isEmptyValue(form.drive_link)) {
      return "Drive or YouTube link is required for Videography.";
    }

    if (showPaymentFields && isEmptyValue(form.sound_system_payment)) {
      return "Sound system payment is required.";
    }

    if (showPaymentFields && isEmptyValue(form.lighting_payment)) {
      return "Lighting payment is required.";
    }

    if (showPaymentFields && Number(form.sound_system_payment) < 0) {
      return "Sound system payment cannot be negative.";
    }

    if (showPaymentFields && Number(form.lighting_payment) < 0) {
      return "Lighting payment cannot be negative.";
    }

    if (isGalleryOnlyType && form.cover_photo) {
      return "This service type does not support cover photo.";
    }

    if (isCoverPhotoOnlyType && form.add_gallery_images.length > 0) {
      return "This service type does not support gallery images.";
    }

    if (isGalleryOnlyType) {
      const finalGalleryCount =
        currentExistingImageCount + form.add_gallery_images.length;

      if (finalGalleryCount > selectedImageLimit) {
        return `Maximum ${selectedImageLimit} gallery images are allowed.`;
      }
    }

    return "";
  };

  const buildFormData = () => {
    const formData = new FormData();

    formData.append("service_name", form.service_name);
    formData.append("shift_charge", form.shift_charge);
    formData.append("description", form.description || "");

    if (showShiftHour) {
      formData.append("shift_hour", form.shift_hour);
    }

    if (showDriveLink) {
      formData.append("drive_link", form.drive_link);
    }

    if (showPaymentFields) {
      formData.append("sound_system_payment", form.sound_system_payment);
      formData.append("lighting_payment", form.lighting_payment);
    }

    if (canUploadCoverPhoto && form.cover_photo) {
      formData.append("cover_photo", form.cover_photo);
    }

    if (canUploadGalleryImages) {
      form.add_gallery_images.forEach((image) => {
        formData.append("add_gallery_images", image);
      });

      form.remove_gallery_image_ids.forEach((imageId) => {
        formData.append("remove_gallery_image_ids", imageId);
      });
    }

    return formData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    dispatch(clearOperationState());
    setLocalError("");

    const validationError = validateForm();

    if (validationError) {
      setLocalError(validationError);
      return;
    }

    const formData = buildFormData();

    try {
      const result = isEdit
        ? await dispatch(
            updateEventService({
              brandSlug,
              serviceId: service?.id,
              serviceName: getServiceNameForUrl(service),
              data: formData,
            }),
          ).unwrap()
        : await dispatch(
            createEventService({
              brandSlug,
              data: formData,
            }),
          ).unwrap();

      onSuccess?.(result);

      revokeAllObjectUrls();
      clearFileInputs();

      setForm(createInitialForm(result));
      setCoverPreview(result?.cover_photo_url || "");
      setNewGalleryPreviews([]);
      setLocalError("");

      dispatch(clearOperationState());
      setOpen(false);
    } catch (error) {
      setLocalError(getCleanErrorMessage(error));
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>

      <SheetContent className="w-full overflow-y-auto p-6 sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>
            {isEdit ? "Update Event Service" : "Create Event Service"}
          </SheetTitle>

          <SheetDescription>
            {isEdit
              ? "Update this brand service information."
              : "Create a new service for this brand."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Service Type</label>

              <select
                name="service_name"
                value={form.service_name}
                onChange={handleChange}
                disabled={isEdit}
                className={inputClass}
                required
              >
                <option value="">Select service type</option>

                {SERVICE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>

              {isEdit && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Service type cannot be changed after creation.
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>Shift Charge</label>

              <input
                type="number"
                name="shift_charge"
                value={form.shift_charge}
                onChange={handleChange}
                placeholder="8000"
                className={inputClass}
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          {showShiftHour && (
            <div>
              <label className={labelClass}>Shift Hour</label>

              <input
                type="number"
                name="shift_hour"
                value={form.shift_hour}
                onChange={handleChange}
                placeholder="5"
                className={inputClass}
                min="1"
                required
              />
            </div>
          )}

          {showDriveLink && (
            <div>
              <label className={labelClass}>Drive / YouTube Link</label>

              <input
                type="url"
                name="drive_link"
                value={form.drive_link}
                onChange={handleChange}
                placeholder="https://drive.google.com/..."
                className={inputClass}
                required
              />
            </div>
          )}

          {showPaymentFields && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Sound System Payment</label>

                <input
                  type="number"
                  name="sound_system_payment"
                  value={form.sound_system_payment}
                  onChange={handleChange}
                  placeholder="5000"
                  className={inputClass}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Lighting Payment</label>

                <input
                  type="number"
                  name="lighting_payment"
                  value={form.lighting_payment}
                  onChange={handleChange}
                  placeholder="5000"
                  className={inputClass}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className={labelClass}>Description</label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Write service description..."
              className={inputClass}
            />
          </div>

          {canUploadCoverPhoto && (
            <section className="border bg-muted/20 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold">Cover Photo</h3>
                  <p className="text-xs text-muted-foreground">
                    Cover photo is supported for this service type.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openCoverFilePicker}
                  className={smallPrimaryButtonClass}
                >
                  {coverPreview ? "Change Cover" : "Upload Cover"}
                </button>
              </div>

              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverPhotoChange}
                className="hidden"
              />

              {coverPreview ? (
                <div className="relative overflow-hidden border bg-background">
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="h-48 w-full object-cover"
                  />

                  {form.cover_photo && (
                    <button
                      type="button"
                      onClick={removeSelectedCoverPhoto}
                      className="absolute right-3 top-3 bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                    >
                      Remove
                    </button>
                  )}

                  <div className="absolute bottom-3 left-3 bg-background px-3 py-1 text-xs font-semibold">
                    {form.cover_photo ? "New cover selected" : "Current cover"}
                  </div>
                </div>
              ) : (
                <div className="flex min-h-40 flex-col items-center justify-center border border-dashed bg-background p-6 text-center">
                  <p className="text-sm font-semibold">
                    No cover photo selected
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Select one image for Videography or Sound System and
                    Lighting.
                  </p>

                  <button
                    type="button"
                    onClick={openCoverFilePicker}
                    className={`mt-4 ${smallSecondaryButtonClass}`}
                  >
                    Select Image
                  </button>
                </div>
              )}
            </section>
          )}

          {canUploadGalleryImages && (
            <section className="border bg-muted/20 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold">Gallery Images</h3>

                  <p className="text-xs text-muted-foreground">
                    Limit: {selectedImageLimit}. Active:{" "}
                    {currentExistingImageCount}. New: {newGalleryImageCount}.
                    Remaining: {availableGallerySlots}.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openGalleryFilePicker}
                  disabled={availableGallerySlots === 0}
                  className={smallPrimaryButtonClass}
                >
                  Add Images
                </button>
              </div>

              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryImagesChange}
                className="hidden"
              />

              {newGalleryPreviews.length > 0 && (
                <div className="mb-5">
                  <p className="mb-2 text-xs font-semibold">
                    New images before save
                  </p>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {newGalleryPreviews.map((preview) => (
                      <div
                        key={preview.id}
                        className="relative overflow-hidden border bg-background"
                      >
                        <img
                          src={preview.url}
                          alt={preview.name}
                          className="h-28 w-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() => removeNewGalleryImage(preview.id)}
                          className="absolute right-2 top-2 bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                        >
                          Remove
                        </button>

                        <div className="absolute bottom-2 left-2 bg-background px-2 py-1 text-[10px] font-semibold">
                          New
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isEdit && existingGalleryImages.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold">
                    Existing gallery images
                  </p>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {existingGalleryImages.map((image) => {
                      const imageId = String(image.id);
                      const imageUrl = getGalleryImageUrl(image);
                      const isSelectedForRemove =
                        form.remove_gallery_image_ids.includes(imageId);

                      return (
                        <div
                          key={imageId}
                          className="relative overflow-hidden border bg-background"
                        >
                          {imageUrl && (
                            <img
                              src={imageUrl}
                              alt={`Gallery ${image.sort_order || ""}`}
                              className={`h-28 w-full object-cover transition ${
                                isSelectedForRemove
                                  ? "opacity-40"
                                  : "opacity-100"
                              }`}
                            />
                          )}

                          <button
                            type="button"
                            onClick={() => toggleRemoveGalleryImage(imageId)}
                            className="absolute right-2 top-2 bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                          >
                            {isSelectedForRemove ? "Undo" : "Remove"}
                          </button>

                          <div className="absolute bottom-2 left-2 bg-background px-2 py-1 text-[10px] font-semibold">
                            {isSelectedForRemove ? "Will remove" : "Saved"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {!isEdit && newGalleryPreviews.length === 0 && (
                <div className="flex min-h-32 flex-col items-center justify-center border border-dashed bg-background p-6 text-center">
                  <p className="text-sm font-semibold">
                    No gallery images selected
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Add gallery images before submitting.
                  </p>

                  <button
                    type="button"
                    onClick={openGalleryFilePicker}
                    className={`mt-4 ${smallSecondaryButtonClass}`}
                  >
                    Select Gallery Images
                  </button>
                </div>
              )}
            </section>
          )}

          {form.service_name && !canUploadGalleryImages && (
            <div className="border border-primary bg-primary/5 px-4 py-3 text-sm">
              This service type does not support gallery images.
            </div>
          )}

          {form.service_name && !canUploadCoverPhoto && (
            <div className="border border-primary bg-primary/5 px-4 py-3 text-sm">
              This service type does not support cover photo.
            </div>
          )}

          {visibleError && (
            <div className="border border-primary bg-primary/5 px-4 py-3 text-sm font-medium">
              {visibleError}
            </div>
          )}

          <SheetFooter className="gap-3 sm:gap-2">
            <SheetClose asChild>
              <button
                type="button"
                className={secondaryButtonClass}
                disabled={loading}
              >
                Cancel
              </button>
            </SheetClose>

            <button
              type="submit"
              disabled={loading}
              className={primaryButtonClass}
            >
              {loading
                ? isEdit
                  ? "Updating..."
                  : "Creating..."
                : isEdit
                  ? "Update Service"
                  : "Create Service"}
            </button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default EventServiceSheet;
