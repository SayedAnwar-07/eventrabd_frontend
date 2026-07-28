export const SERVICE_TYPES = [
  { value: "photography", label: "Photography" },
  { value: "videography", label: "Videography" },
  { value: "stage_designer", label: "Stage Designer" },
  { value: "sound_lighting", label: "Sound System and Lighting" },
  { value: "event_hall", label: "Event Hall" },
];

export const SERVICE_IMAGE_LIMITS = {
  photography: 5,
  stage_designer: 5,
  event_hall: 5,
  videography: 0,
  sound_lighting: 0,
};

export const GALLERY_ONLY_SERVICE_TYPES = new Set([
  "photography",
  "stage_designer",
  "event_hall",
]);

export const COVER_PHOTO_ONLY_SERVICE_TYPES = new Set([
  "videography",
  "sound_lighting",
]);

export const SHIFT_HOUR_REQUIRED_TYPES = new Set([
  "photography",
  "videography",
  "sound_lighting",
  "event_hall",
]);

export const DRIVE_LINK_REQUIRED_TYPES = new Set(["videography"]);

export const PAYMENT_REQUIRED_TYPES = new Set(["sound_lighting"]);

export const createInitialForm = (service = null) => ({
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

export const getGalleryImageUrl = (image) => {
  return (
    image?.image_url ||
    image?.gallery_image_url ||
    image?.url ||
    image?.image ||
    ""
  );
};

export const createPreviewId = (file, index) => {
  return `${file.name}-${file.size}-${file.lastModified}-${index}`;
};

export const isBlobUrl = (url) => {
  return typeof url === "string" && url.startsWith("blob:");
};

export const getServiceNameForUrl = (service) => {
  return service?.slug || service?.service_name || "";
};

export const validateEventServiceForm = ({
  brandSlug,
  form,
  showShiftHour,
  showDriveLink,
  showPaymentFields,
  isGalleryOnlyType,
  isCoverPhotoOnlyType,
  currentExistingImageCount,
  selectedImageLimit,
}) => {
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

export const buildEventServiceFormData = ({
  form,
  showShiftHour,
  showDriveLink,
  showPaymentFields,
  canUploadCoverPhoto,
  canUploadGalleryImages,
}) => {
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
