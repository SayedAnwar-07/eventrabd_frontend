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

const SERVICE_TYPES = [
  { value: "photography", label: "Photography" },
  { value: "videography", label: "Videography" },
  { value: "stage_designer", label: "Stage Designer" },
  { value: "sound_lighting", label: "Sound System and Lighting" },
  { value: "dj", label: "DJ" },
];

const SERVICE_IMAGE_LIMITS = {
  photography: 4,
  stage_designer: 4,
  dj: 2,
  videography: 0,
  sound_lighting: 0,
};

const createInitialForm = (service = null) => ({
  service_name: service?.service_name || "",
  drive_link: service?.drive_link || "",
  shift_charge: service?.shift_charge ?? "",
  description: service?.description || "",
  shift_hour: service?.shift_hour ?? "",
  cover_photo: null,
  remove_cover_photo: false,
  add_gallery_images: [],
  remove_gallery_image_ids: [],
});

const getErrorMessage = (error) => {
  if (!error) return "";

  if (typeof error === "string") return error;

  if (error.detail) return error.detail;

  if (Array.isArray(error)) {
    return error.join(", ");
  }

  if (typeof error === "object") {
    return Object.entries(error)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}: ${value.join(", ")}`;
        }

        if (typeof value === "object" && value !== null) {
          return `${key}: ${JSON.stringify(value)}`;
        }

        return `${key}: ${value}`;
      })
      .join(" | ");
  }

  return "Something went wrong.";
};

const getGalleryImageUrl = (image) => {
  return (
    image.image_url || image.gallery_image_url || image.image || image.url || ""
  );
};

const createPreviewId = (file, index) => {
  return `${file.name}-${file.size}-${Date.now()}-${index}`;
};

const isBlobUrl = (url) => {
  return typeof url === "string" && url.startsWith("blob:");
};

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

  const isEdit = Boolean(service);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(() => createInitialForm(service));
  const [coverPreview, setCoverPreview] = useState(
    service?.cover_photo_url || "",
  );
  const [newGalleryPreviews, setNewGalleryPreviews] = useState([]);
  const [localError, setLocalError] = useState("");

  const selectedImageLimit = SERVICE_IMAGE_LIMITS[form.service_name] ?? 0;

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

  const canUploadGalleryImages = selectedImageLimit > 0;

  const showShiftHour =
    form.service_name === "photography" ||
    form.service_name === "videography" ||
    form.service_name === "dj";

  const showDriveLink =
    form.service_name === "photography" || form.service_name === "videography";

  const visibleError = localError || getErrorMessage(reduxError);

  const revokeUrl = (url) => {
    if (isBlobUrl(url)) {
      URL.revokeObjectURL(url);
    }
  };

  const revokeAllNewGalleryPreviews = () => {
    newGalleryPreviews.forEach((preview) => {
      revokeUrl(preview.url);
    });
  };

  useEffect(() => {
    return () => {
      revokeUrl(coverPreview);

      newGalleryPreviews.forEach((preview) => {
        revokeUrl(preview.url);
      });
    };
  }, [coverPreview, newGalleryPreviews]);

  const clearFileInputs = () => {
    if (coverInputRef.current) {
      coverInputRef.current.value = "";
    }

    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
  };

  const resetSheetState = () => {
    revokeUrl(coverPreview);
    revokeAllNewGalleryPreviews();

    setForm(createInitialForm(service));
    setCoverPreview(service?.cover_photo_url || "");
    setNewGalleryPreviews([]);
    setLocalError("");

    clearFileInputs();
    dispatch(clearOperationState());
  };

  const handleOpenChange = (value) => {
    if (value) {
      resetSheetState();
    } else {
      setLocalError("");
      clearFileInputs();
      dispatch(clearOperationState());
    }

    setOpen(value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "service_name") {
      const imageLimit = SERVICE_IMAGE_LIMITS[value] ?? 0;

      if (imageLimit === 0) {
        revokeAllNewGalleryPreviews();
        setNewGalleryPreviews([]);

        if (galleryInputRef.current) {
          galleryInputRef.current.value = "";
        }
      }
    }

    setForm((prev) => {
      const updatedForm = {
        ...prev,
        [name]: value,
      };

      if (name === "service_name") {
        const imageLimit = SERVICE_IMAGE_LIMITS[value] ?? 0;

        if (imageLimit === 0) {
          updatedForm.add_gallery_images = [];
          updatedForm.remove_gallery_image_ids = [];
        }

        if (value !== "photography" && value !== "videography") {
          updatedForm.drive_link = "";
        }

        if (
          value !== "photography" &&
          value !== "videography" &&
          value !== "dj"
        ) {
          updatedForm.shift_hour = "";
        }
      }

      return updatedForm;
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

    revokeUrl(coverPreview);

    const previewUrl = URL.createObjectURL(file);

    setForm((prev) => ({
      ...prev,
      cover_photo: file,
      remove_cover_photo: false,
    }));

    setCoverPreview(previewUrl);
    setLocalError("");
  };

  const removeCoverPhoto = () => {
    const hasNewCover = Boolean(form.cover_photo);

    revokeUrl(coverPreview);

    if (coverInputRef.current) {
      coverInputRef.current.value = "";
    }

    if (hasNewCover) {
      setForm((prev) => ({
        ...prev,
        cover_photo: null,
      }));

      setCoverPreview(
        service?.cover_photo_url && !form.remove_cover_photo
          ? service.cover_photo_url
          : "",
      );

      return;
    }

    setForm((prev) => ({
      ...prev,
      cover_photo: null,
      remove_cover_photo: isEdit && Boolean(service?.cover_photo_url),
    }));

    setCoverPreview("");
  };

  const restoreCurrentCoverPhoto = () => {
    setForm((prev) => ({
      ...prev,
      cover_photo: null,
      remove_cover_photo: false,
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
      setLocalError("This service type does not allow gallery images.");
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
      url: URL.createObjectURL(file),
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

    revokeUrl(selectedPreview.url);

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
    setForm((prev) => {
      const alreadySelected = prev.remove_gallery_image_ids.includes(imageId);

      return {
        ...prev,
        remove_gallery_image_ids: alreadySelected
          ? prev.remove_gallery_image_ids.filter((id) => id !== imageId)
          : [...prev.remove_gallery_image_ids, imageId],
      };
    });
  };

  const appendIfValue = (formData, key, value) => {
    if (value !== "" && value !== null && value !== undefined) {
      formData.append(key, value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLocalError("");

    const formData = new FormData();

    appendIfValue(formData, "service_name", form.service_name);
    appendIfValue(formData, "drive_link", form.drive_link);
    appendIfValue(formData, "shift_charge", form.shift_charge);
    appendIfValue(formData, "description", form.description);
    appendIfValue(formData, "shift_hour", form.shift_hour);

    if (form.cover_photo) {
      formData.append("cover_photo", form.cover_photo);
    }

    /*
      Backend note:
      This field is only needed if you want to remove the old cover photo
      without uploading a new one. Your backend serializer must support it.
    */
    if (form.remove_cover_photo) {
      formData.append("remove_cover_photo", "true");
    }

    if (canUploadGalleryImages) {
      form.add_gallery_images.forEach((image) => {
        formData.append("add_gallery_images", image);
      });
    }

    form.remove_gallery_image_ids.forEach((imageId) => {
      formData.append("remove_gallery_image_ids", imageId);
    });

    console.group("EVENT SERVICE FORM DATA");
    console.log("Mode:", isEdit ? "UPDATE" : "CREATE");
    console.log("brandSlug:", brandSlug);
    console.log("serviceSlug:", service?.slug || null);
    console.log("Raw form:", form);

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(key, {
          name: value.name,
          type: value.type,
          size: value.size,
        });
      } else {
        console.log(key, value);
      }
    }

    console.groupEnd();

    try {
      const result = isEdit
        ? await dispatch(
            updateEventService({
              brandSlug,
              serviceName: service.slug,
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

      clearFileInputs();

      revokeUrl(coverPreview);
      revokeAllNewGalleryPreviews();

      setCoverPreview(result?.cover_photo_url || "");
      setNewGalleryPreviews([]);
      dispatch(clearOperationState());
      setOpen(false);
    } catch (error) {
      console.error("EVENT SERVICE SUBMIT ERROR:", error);
      setLocalError(getErrorMessage(error));
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>

      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
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

        <form onSubmit={handleSubmit} className="mt-6 space-y-6 p-4">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Service Type
              </label>

              <select
                name="service_name"
                value={form.service_name}
                onChange={handleChange}
                disabled={isEdit}
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500 disabled:bg-gray-100"
                required
              >
                <option value="">Select service type</option>

                {SERVICE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Shift Charge
              </label>

              <input
                type="number"
                name="shift_charge"
                value={form.shift_charge}
                onChange={handleChange}
                placeholder="8000"
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                required
              />
            </div>
          </div>

          {showShiftHour && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Shift Hour
              </label>

              <input
                type="number"
                name="shift_hour"
                value={form.shift_hour}
                onChange={handleChange}
                placeholder="5"
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                required
              />
            </div>
          )}

          {showDriveLink && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Drive / YouTube Link
              </label>

              <input
                type="url"
                name="drive_link"
                value={form.drive_link}
                onChange={handleChange}
                placeholder="your drive or other file link"
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                required={form.service_name === "videography"}
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Write service description..."
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Cover Photo UI */}
          <section className="rounded-2xl border bg-gray-50 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Cover Photo
                </h3>
                <p className="text-xs text-gray-500">
                  Upload one main image for this service.
                </p>
              </div>

              <button
                type="button"
                onClick={openCoverFilePicker}
                className="rounded-xl bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800"
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
              <div className="relative overflow-hidden rounded-2xl border bg-white">
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="h-48 w-full object-cover"
                />

                <button
                  type="button"
                  onClick={removeCoverPhoto}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-lg font-bold text-white hover:bg-black"
                  aria-label="Remove cover photo"
                  title="Remove cover photo"
                >
                  ×
                </button>

                <div className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-700">
                  {form.cover_photo ? "New cover preview" : "Current cover"}
                </div>
              </div>
            ) : (
              <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed bg-white p-6 text-center">
                <p className="text-sm font-semibold text-gray-700">
                  No cover photo selected
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Choose a clear landscape image for better service display.
                </p>

                <button
                  type="button"
                  onClick={openCoverFilePicker}
                  className="mt-4 rounded-xl border px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Select Image
                </button>

                {form.remove_cover_photo && service?.cover_photo_url && (
                  <button
                    type="button"
                    onClick={restoreCurrentCoverPhoto}
                    className="mt-2 text-xs font-semibold text-rose-600 hover:text-rose-700"
                  >
                    Restore current cover
                  </button>
                )}
              </div>
            )}
          </section>

          {/* Gallery Image UI */}
          {canUploadGalleryImages && (
            <section className="rounded-2xl border bg-gray-50 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Gallery Images
                  </h3>

                  <p className="text-xs text-gray-500">
                    Limit: {selectedImageLimit}. Existing active:{" "}
                    {currentExistingImageCount}. New selected:{" "}
                    {newGalleryImageCount}. Remaining: {availableGallerySlots}.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openGalleryFilePicker}
                  disabled={availableGallerySlots === 0}
                  className="rounded-xl bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
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
                  <p className="mb-2 text-xs font-semibold text-gray-700">
                    New images before save
                  </p>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {newGalleryPreviews.map((preview) => (
                      <div
                        key={preview.id}
                        className="group relative overflow-hidden rounded-xl border bg-white"
                      >
                        <img
                          src={preview.url}
                          alt={preview.name}
                          className="h-28 w-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() => removeNewGalleryImage(preview.id)}
                          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-base font-bold text-white hover:bg-black"
                          aria-label="Remove selected gallery image"
                          title="Remove image"
                        >
                          ×
                        </button>

                        <div className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-gray-700">
                          New
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isEdit && existingGalleryImages.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold text-gray-700">
                    Existing gallery images
                  </p>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {existingGalleryImages.map((image) => {
                      const imageUrl = getGalleryImageUrl(image);
                      const isSelectedForRemove =
                        form.remove_gallery_image_ids.includes(image.id);

                      return (
                        <div
                          key={image.id}
                          className={`relative overflow-hidden rounded-xl border bg-white ${
                            isSelectedForRemove
                              ? "border-red-300"
                              : "border-gray-200"
                          }`}
                        >
                          {imageUrl && (
                            <img
                              src={imageUrl}
                              alt={`Gallery ${image.sort_order}`}
                              className={`h-28 w-full object-cover transition ${
                                isSelectedForRemove
                                  ? "grayscale opacity-45"
                                  : "opacity-100"
                              }`}
                            />
                          )}

                          <button
                            type="button"
                            onClick={() => toggleRemoveGalleryImage(image.id)}
                            className={`absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-base font-bold text-white ${
                              isSelectedForRemove
                                ? "bg-gray-800 hover:bg-gray-900"
                                : "bg-red-600 hover:bg-red-700"
                            }`}
                            aria-label={
                              isSelectedForRemove
                                ? "Undo remove gallery image"
                                : "Remove gallery image"
                            }
                            title={
                              isSelectedForRemove
                                ? "Undo remove"
                                : "Remove image"
                            }
                          >
                            {isSelectedForRemove ? "↺" : "×"}
                          </button>

                          <div
                            className={`absolute bottom-2 left-2 rounded-full px-2 py-1 text-[10px] font-semibold ${
                              isSelectedForRemove
                                ? "bg-red-600 text-white"
                                : "bg-white/90 text-gray-700"
                            }`}
                          >
                            {isSelectedForRemove ? "Will remove" : "Saved"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {!isEdit && newGalleryPreviews.length === 0 && (
                <div className="flex min-h-32 flex-col items-center justify-center rounded-2xl border border-dashed bg-white p-6 text-center">
                  <p className="text-sm font-semibold text-gray-700">
                    No gallery images selected
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Add images now. They will be saved only after submit.
                  </p>

                  <button
                    type="button"
                    onClick={openGalleryFilePicker}
                    className="mt-4 rounded-xl border px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Select Gallery Images
                  </button>
                </div>
              )}
            </section>
          )}

          {!canUploadGalleryImages && form.service_name && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              This service type does not allow gallery images.
            </div>
          )}

          {visibleError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {visibleError}
            </div>
          )}

          <SheetFooter className="gap-3 sm:gap-2">
            <SheetClose asChild>
              <button
                type="button"
                className="rounded-xl border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </SheetClose>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
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