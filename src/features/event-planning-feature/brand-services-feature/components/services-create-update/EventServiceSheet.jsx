import { memo, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

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

import { getGalleryImageUrl, SERVICE_TYPES } from "./eventServiceFormConfig";

import useEventServiceSheet from "./useEventServiceSheet";
import RichTextEditor from "@/components/common/RichTextEditor";

import { ImagePlus, Upload, X, Check, Loader2 } from "lucide-react";

// ============================================
// EVENTRABD UI STYLES
// ============================================

const inputClass =
  "h-11 w-full rounded-md border border-[#E5DDD5] bg-gray-50 px-3 text-sm text-[#3D3530] shadow-none outline-none transition-colors placeholder:text-[#A69B91] focus:border-[#A68C78] focus:ring-2 focus:ring-[#A68C78]/20 disabled:cursor-not-allowed disabled:bg-[#F8F5F2] disabled:opacity-70";

const labelClass = "mb-1.5 block text-xs font-medium text-[#51463E]";

const primaryButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#3D3530] bg-[#3D3530] px-6 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:border-[#51463E] hover:bg-[#51463E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A68C78]/40 disabled:cursor-not-allowed disabled:opacity-60";

const secondaryButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#E5DDD5] bg-white px-6 text-sm font-semibold text-[#51463E] transition-colors hover:border-[#CFC2B6] hover:bg-[#FFFCF9] disabled:cursor-not-allowed disabled:opacity-60";

const smallPrimaryButtonClass =
  "inline-flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-[#3D3530] bg-[#3D3530] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#51463E] disabled:cursor-not-allowed disabled:opacity-50";

const smallSecondaryButtonClass =
  "inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-[#E5DDD5] bg-white px-3 py-2 text-xs font-semibold text-[#51463E] transition-colors hover:bg-[#FFFCF9] disabled:cursor-not-allowed disabled:opacity-50";

const sectionClass =
  "overflow-hidden rounded-md border border-[#E5DDD5] bg-white";

const sectionHeaderClass =
  "border-b border-[#F0EAE4] bg-[#FFFCF9] px-4 py-3.5 sm:px-5";

const toastStyle = {
  background: "#FFFFFF",
  color: "#3D3530",
  border: "1px solid #E5DDD5",
  borderRadius: "8px",
  padding: "14px 16px",
  fontSize: "13px",
  boxShadow: "0 8px 24px -12px rgba(61,53,48,0.20)",
};

// ============================================
// EVENT SERVICE SHEET
// ============================================

const EventServiceSheet = ({
  brandSlug,
  service = null,
  trigger,
  onSuccess,
}) => {
  const handleSuccess = useCallback(
    (...args) => {
      toast.success(
        service
          ? "Service updated successfully!"
          : "Service created successfully!",
        {
          id: "event-service-success",
          duration: 4000,
          style: toastStyle,
        },
      );

      onSuccess?.(...args);
    },
    [onSuccess, service],
  );

  const {
    open,
    form,
    isEdit,
    loading,
    visibleError,
    coverInputRef,
    galleryInputRef,
    coverPreview,
    newGalleryPreviews,
    existingGalleryImages,
    serviceType,
    selectedImageLimit,
    showShiftHour,
    showDriveLink,
    currentExistingImageCount,
    newGalleryImageCount,
    availableGallerySlots,
    canUploadGalleryImages,
    canUploadCoverPhoto,
    handleOpenChange,
    handleChange,
    openCoverFilePicker,
    openGalleryFilePicker,
    handleCoverPhotoChange,
    removeSelectedCoverPhoto,
    handleGalleryImagesChange,
    removeNewGalleryImage,
    toggleRemoveGalleryImage,
    handleSubmit,
  } = useEventServiceSheet({
    brandSlug,
    service,
    onSuccess: handleSuccess,
  });

  // Show error toast only when an error occurs.
  useEffect(() => {
    if (!visibleError) return;

    const message =
      typeof visibleError === "string"
        ? visibleError
        : visibleError?.message ||
          visibleError?.detail ||
          "Something went wrong. Please try again.";

    toast.error(message, {
      id: "event-service-error",
      duration: 5000,
      style: toastStyle,
    });
  }, [visibleError]);

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>

      <SheetContent className="flex h-full w-full flex-col gap-0 overflow-hidden border-l border-[#E5DDD5] bg-white p-0 text-[#3D3530] sm:max-w-2xl">
        {/* ===================================
            SHEET HEADER
        =================================== */}

        <SheetHeader className="shrink-0 border-b border-[#E5DDD5] bg-white px-5 py-5 text-left sm:px-6">
          <SheetTitle className="text-xl font-bold tracking-tight text-[#3D3530]">
            {isEdit ? "Update Event Service" : "Create Event Service"}
          </SheetTitle>

          <SheetDescription className="mt-1 text-xs leading-relaxed text-[#756A62] sm:text-sm">
            {isEdit
              ? "Update this brand service information."
              : "Create a new service for this brand."}
          </SheetDescription>
        </SheetHeader>

        {/* ===================================
            FORM
        =================================== */}

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
            {/* ===================================
                SECTION 1 - SERVICE DETAILS
            =================================== */}

            <section className={sectionClass}>
              <div className={sectionHeaderClass}>
                <h3 className="text-sm font-semibold text-[#3D3530]">
                  Service Information
                </h3>

                <p className="mt-1 text-xs text-[#756A62]">
                  Provide the main details and pricing for your service.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-x-5 gap-y-5 p-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-6 sm:p-5">
                {/* Service Type */}

                <div className="min-w-0">
                  <label htmlFor="service_name" className={labelClass}>
                    Service Type
                    <span className="ml-1 text-red-600">*</span>
                  </label>

                  <select
                    id="service_name"
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
                    <p className="mt-1.5 text-xs leading-relaxed text-[#9B9087]">
                      Service type cannot be changed after creation.
                    </p>
                  )}
                </div>

                {/* Shift Charge */}

                <div className="min-w-0">
                  <label htmlFor="shift_charge" className={labelClass}>
                    Shift Charge
                    <span className="ml-1 text-red-600">*</span>
                  </label>

                  <input
                    id="shift_charge"
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

                {/* Shift Hour */}

                {showShiftHour && (
                  <div className="min-w-0">
                    <label htmlFor="shift_hour" className={labelClass}>
                      Shift Hour
                      <span className="ml-1 text-red-600">*</span>
                    </label>

                    <input
                      id="shift_hour"
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

                {/* Drive / YouTube Link */}

                {showDriveLink && (
                  <div className="min-w-0 sm:col-span-2">
                    <label htmlFor="drive_link" className={labelClass}>
                      Drive / YouTube Link
                      <span className="ml-1 text-[11px] font-normal text-[#9B9087]">
                        (Optional)
                      </span>
                    </label>

                    <input
                      id="drive_link"
                      type="url"
                      name="drive_link"
                      value={form.drive_link}
                      onChange={handleChange}
                      placeholder="https://drive.google.com/..."
                      className={inputClass}
                    />
                  </div>
                )}
              </div>
            </section>

            {/* ===================================
                SECTION 2 - DESCRIPTION
            =================================== */}

            <section className={sectionClass}>
              <div className={sectionHeaderClass}>
                <h3 className="text-sm font-semibold text-[#3D3530]">
                  Service Description
                </h3>

                <p className="mt-1 text-xs text-[#756A62]">
                  Describe your service and what customers can expect.
                </p>
              </div>

              <div className="min-w-0">
                <RichTextEditor
                  name="description"
                  value={form.description || ""}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </section>

            {/* ===================================
                SECTION 3 - COVER PHOTO
            =================================== */}

            {canUploadCoverPhoto && (
              <section className={sectionClass}>
                <div className={sectionHeaderClass}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-[#3D3530]">
                        Cover Photo
                      </h3>

                      <p className="mt-1 text-xs leading-relaxed text-[#756A62]">
                        Upload a cover image for this service.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={openCoverFilePicker}
                      className={smallPrimaryButtonClass}
                    >
                      <Upload size={14} />
                      {coverPreview ? "Change Cover" : "Upload Cover"}
                    </button>
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverPhotoChange}
                    className="hidden"
                  />

                  {coverPreview ? (
                    <div className="relative overflow-hidden rounded-md border border-[#E5DDD5] bg-white">
                      <img
                        src={coverPreview}
                        alt="Cover preview"
                        className="h-48 w-full object-cover"
                      />

                      {form.cover_photo && (
                        <button
                          type="button"
                          onClick={removeSelectedCoverPhoto}
                          className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-md border border-[#E5DDD5] bg-white px-3 py-2 text-xs font-semibold text-[#3D3530] shadow-sm transition-colors hover:bg-[#F8F5F2]"
                        >
                          <X size={13} />
                          Remove
                        </button>
                      )}

                      <div className="absolute bottom-3 left-3 rounded-md border border-[#E5DDD5] bg-white px-3 py-1.5 text-[11px] font-medium text-[#51463E]">
                        {form.cover_photo
                          ? "New cover selected"
                          : "Current cover"}
                      </div>
                    </div>
                  ) : (
                    <div className="flex min-h-44 flex-col items-center justify-center rounded-md border border-dashed border-[#D9CEC3] bg-white px-5 py-7 text-center">
                      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md border border-[#E5DDD5] bg-[#FFFCF9]">
                        <ImagePlus size={20} className="text-[#756A62]" />
                      </div>

                      <p className="text-sm font-semibold text-[#3D3530]">
                        No cover photo selected
                      </p>

                      <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-[#756A62]">
                        Select one image for Videography or Sound System and
                        Lighting.
                      </p>

                      <button
                        type="button"
                        onClick={openCoverFilePicker}
                        className={`mt-4 ${smallSecondaryButtonClass}`}
                      >
                        <Upload size={14} />
                        Select Image
                      </button>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ===================================
                SECTION 4 - GALLERY IMAGES
            =================================== */}

            {canUploadGalleryImages && (
              <section className={sectionClass}>
                <div className={sectionHeaderClass}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-[#3D3530]">
                        Gallery Images
                      </h3>

                      <p className="mt-1 text-xs leading-relaxed text-[#756A62]">
                        Upload images to showcase your service.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={openGalleryFilePicker}
                      disabled={availableGallerySlots === 0}
                      className={smallPrimaryButtonClass}
                    >
                      <ImagePlus size={14} />
                      Add Images
                    </button>
                  </div>
                </div>

                <div className="space-y-5 p-4 sm:p-5">
                  {/* Gallery Upload Information */}

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[#F0EAE4] pb-4 text-xs text-[#756A62]">
                    <span>
                      Limit:{" "}
                      <strong className="font-semibold text-[#3D3530]">
                        {selectedImageLimit}
                      </strong>
                    </span>

                    <span>
                      Active:{" "}
                      <strong className="font-semibold text-[#3D3530]">
                        {currentExistingImageCount}
                      </strong>
                    </span>

                    <span>
                      New:{" "}
                      <strong className="font-semibold text-[#3D3530]">
                        {newGalleryImageCount}
                      </strong>
                    </span>

                    <span>
                      Remaining:{" "}
                      <strong className="font-semibold text-[#3D3530]">
                        {availableGallerySlots}
                      </strong>
                    </span>
                  </div>

                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryImagesChange}
                    className="hidden"
                  />

                  {/* New Gallery Images */}

                  {newGalleryPreviews.length > 0 && (
                    <div>
                      <h4 className="mb-3 text-xs font-semibold text-[#51463E]">
                        New Images Before Save
                      </h4>

                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {newGalleryPreviews.map((preview) => (
                          <div
                            key={preview.id}
                            className="group relative overflow-hidden rounded-md border border-[#E5DDD5] bg-white"
                          >
                            <img
                              src={preview.url}
                              alt={preview.name}
                              className="h-28 w-full object-cover"
                            />

                            <button
                              type="button"
                              onClick={() => removeNewGalleryImage(preview.id)}
                              className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#E5DDD5] bg-white text-[#3D3530] shadow-sm transition-colors hover:bg-[#F8F5F2]"
                              aria-label="Remove image"
                            >
                              <X size={14} />
                            </button>

                            <div className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-md border border-[#E5DDD5] bg-white px-2 py-1 text-[10px] font-semibold text-[#51463E]">
                              <Check size={11} />
                              New
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Existing Gallery Images */}

                  {isEdit && existingGalleryImages.length > 0 && (
                    <div>
                      <h4 className="mb-3 text-xs font-semibold text-[#51463E]">
                        Existing Gallery Images
                      </h4>

                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {existingGalleryImages.map((image) => {
                          const imageId = String(image.id);
                          const imageUrl = getGalleryImageUrl(image);

                          const isSelectedForRemove =
                            form.remove_gallery_image_ids.includes(imageId);

                          return (
                            <div
                              key={imageId}
                              className="relative overflow-hidden rounded-md border border-[#E5DDD5] bg-white"
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
                                onClick={() =>
                                  toggleRemoveGalleryImage(imageId)
                                }
                                className="absolute right-2 top-2 inline-flex min-h-7 items-center justify-center gap-1 rounded-md border border-[#E5DDD5] bg-white px-2 text-[11px] font-semibold text-[#3D3530] shadow-sm transition-colors hover:bg-[#F8F5F2]"
                              >
                                {isSelectedForRemove ? (
                                  <>
                                    <Check size={12} />
                                    Undo
                                  </>
                                ) : (
                                  <>
                                    <X size={12} />
                                    Remove
                                  </>
                                )}
                              </button>

                              <div className="absolute bottom-2 left-2 rounded-md border border-[#E5DDD5] bg-white px-2 py-1 text-[10px] font-semibold text-[#51463E]">
                                {isSelectedForRemove ? "Will remove" : "Saved"}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Empty Gallery State */}

                  {!isEdit && newGalleryPreviews.length === 0 && (
                    <div className="flex min-h-40 flex-col items-center justify-center rounded-md border border-dashed border-[#D9CEC3] bg-white px-5 py-7 text-center">
                      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md border border-[#E5DDD5] bg-[#FFFCF9]">
                        <ImagePlus size={20} className="text-[#756A62]" />
                      </div>

                      <p className="text-sm font-semibold text-[#3D3530]">
                        No gallery images selected
                      </p>

                      <p className="mt-1.5 text-xs leading-relaxed text-[#756A62]">
                        Add gallery images before submitting.
                      </p>

                      <button
                        type="button"
                        onClick={openGalleryFilePicker}
                        className={`mt-4 ${smallSecondaryButtonClass}`}
                      >
                        <Upload size={14} />
                        Select Gallery Images
                      </button>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ===================================
                SERVICE TYPE NOTICES
            =================================== */}

            {serviceType && !canUploadGalleryImages && (
              <div className="rounded-md border border-[#E5DDD5] bg-white px-4 py-3 text-xs leading-relaxed text-[#756A62]">
                This service type does not support gallery images.
              </div>
            )}

            {serviceType && !canUploadCoverPhoto && (
              <div className="rounded-md border border-[#E5DDD5] bg-white px-4 py-3 text-xs leading-relaxed text-[#756A62]">
                This service type does not support cover photo.
              </div>
            )}
          </div>

          {/* ===================================
              STICKY FORM FOOTER
          =================================== */}

          <SheetFooter className="shrink-0 flex flex-col-reverse gap-3 border-t border-[#E5DDD5] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
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
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {isEdit ? "Updating..." : "Creating..."}
                </>
              ) : isEdit ? (
                "Update Service"
              ) : (
                "Create Service"
              )}
            </button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default memo(EventServiceSheet);
