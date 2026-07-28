import { memo } from "react";

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

import BackendErrorMessage from "@/components/common/BackendErrorMessage";
import { getGalleryImageUrl, SERVICE_TYPES } from "./eventServiceFormConfig";
import useEventServiceSheet from "./useEventServiceSheet";

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

const EventServiceSheet = ({
  brandSlug,
  service = null,
  trigger,
  onSuccess,
}) => {
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
    showPaymentFields,
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
    onSuccess,
  });

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

          {serviceType && !canUploadGalleryImages && (
            <div className="border border-primary bg-primary/5 px-4 py-3 text-sm">
              This service type does not support gallery images.
            </div>
          )}

          {serviceType && !canUploadCoverPhoto && (
            <div className="border border-primary bg-primary/5 px-4 py-3 text-sm">
              This service type does not support cover photo.
            </div>
          )}

          <BackendErrorMessage error={visibleError} />

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

export default memo(EventServiceSheet);
