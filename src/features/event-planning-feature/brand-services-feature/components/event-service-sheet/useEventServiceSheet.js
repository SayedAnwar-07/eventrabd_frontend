import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  clearOperationState,
  createEventService,
  updateEventService,
} from "@/store/features/eventService/eventServiceSlice";
import {
  selectOperationError,
  selectOperationLoading,
} from "@/store/features/eventService/eventServiceSelector";

import {
  buildEventServiceFormData,
  COVER_PHOTO_ONLY_SERVICE_TYPES,
  createInitialForm,
  createPreviewId,
  DRIVE_LINK_REQUIRED_TYPES,
  GALLERY_ONLY_SERVICE_TYPES,
  getServiceNameForUrl,
  isBlobUrl,
  PAYMENT_REQUIRED_TYPES,
  SERVICE_IMAGE_LIMITS,
  SHIFT_HOUR_REQUIRED_TYPES,
  validateEventServiceForm,
} from "./eventServiceFormConfig";

const useEventServiceSheet = ({ brandSlug, service = null, onSuccess }) => {
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
  const [localError, setLocalError] = useState(null);

  const existingGalleryImages = Array.isArray(service?.gallery_images)
    ? service.gallery_images
    : [];

  const derived = useMemo(() => {
    const serviceType = form.service_name;
    const selectedImageLimit = SERVICE_IMAGE_LIMITS[serviceType] ?? 0;

    const isGalleryOnlyType = GALLERY_ONLY_SERVICE_TYPES.has(serviceType);
    const isCoverPhotoOnlyType =
      COVER_PHOTO_ONLY_SERVICE_TYPES.has(serviceType);

    const showShiftHour = SHIFT_HOUR_REQUIRED_TYPES.has(serviceType);
    const showDriveLink = DRIVE_LINK_REQUIRED_TYPES.has(serviceType);
    const showPaymentFields = PAYMENT_REQUIRED_TYPES.has(serviceType);

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

    return {
      serviceType,
      selectedImageLimit,
      isGalleryOnlyType,
      isCoverPhotoOnlyType,
      showShiftHour,
      showDriveLink,
      showPaymentFields,
      currentExistingImageCount,
      newGalleryImageCount,
      availableGallerySlots,
      canUploadGalleryImages: isGalleryOnlyType && selectedImageLimit > 0,
      canUploadCoverPhoto: isCoverPhotoOnlyType,
    };
  }, [
    existingGalleryImages.length,
    form.add_gallery_images.length,
    form.remove_gallery_image_ids.length,
    form.service_name,
  ]);

  const visibleError = localError || reduxError;

  const createObjectUrl = useCallback((file) => {
    const url = URL.createObjectURL(file);

    objectUrlsRef.current.add(url);

    return url;
  }, []);

  const revokeObjectUrl = useCallback((url) => {
    if (isBlobUrl(url) && objectUrlsRef.current.has(url)) {
      URL.revokeObjectURL(url);
      objectUrlsRef.current.delete(url);
    }
  }, []);

  const revokeAllObjectUrls = useCallback(() => {
    objectUrlsRef.current.forEach((url) => {
      URL.revokeObjectURL(url);
    });

    objectUrlsRef.current.clear();
  }, []);

  const clearFileInputs = useCallback(() => {
    if (coverInputRef.current) {
      coverInputRef.current.value = "";
    }

    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
  }, []);

  const clearLocalError = useCallback(() => {
    setLocalError(null);
  }, []);

  const resetSheetState = useCallback(() => {
    revokeAllObjectUrls();

    setForm(createInitialForm(service));
    setCoverPreview(service?.cover_photo_url || "");
    setNewGalleryPreviews([]);
    setLocalError(null);

    clearFileInputs();
    dispatch(clearOperationState());
  }, [clearFileInputs, dispatch, revokeAllObjectUrls, service]);

  const handleOpenChange = useCallback(
    (value) => {
      resetSheetState();
      setOpen(value);
    },
    [resetSheetState],
  );

  useEffect(() => {
    return () => {
      revokeAllObjectUrls();
    };
  }, [revokeAllObjectUrls]);

  const handleChange = useCallback(
    (event) => {
      const { name, value } = event.target;

      clearLocalError();

      if (name !== "service_name") {
        setForm((previousForm) => ({
          ...previousForm,
          [name]: value,
        }));

        return;
      }

      revokeAllObjectUrls();
      clearFileInputs();

      setCoverPreview("");
      setNewGalleryPreviews([]);

      setForm((previousForm) => {
        const nextForm = {
          ...previousForm,
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
    },
    [clearFileInputs, clearLocalError, revokeAllObjectUrls],
  );

  const openCoverFilePicker = useCallback(() => {
    coverInputRef.current?.click();
  }, []);

  const openGalleryFilePicker = useCallback(() => {
    galleryInputRef.current?.click();
  }, []);

  const handleCoverPhotoChange = useCallback(
    (event) => {
      const file = event.target.files?.[0] || null;

      if (!file) {
        return;
      }

      if (!derived.canUploadCoverPhoto) {
        setLocalError("This service type does not support cover photo.");
        event.target.value = "";
        return;
      }

      revokeObjectUrl(coverPreview);

      const previewUrl = createObjectUrl(file);

      setForm((previousForm) => ({
        ...previousForm,
        cover_photo: file,
      }));

      setCoverPreview(previewUrl);
      setLocalError(null);
    },
    [
      coverPreview,
      createObjectUrl,
      derived.canUploadCoverPhoto,
      revokeObjectUrl,
    ],
  );

  const removeSelectedCoverPhoto = useCallback(() => {
    if (form.cover_photo) {
      revokeObjectUrl(coverPreview);
    }

    setForm((previousForm) => ({
      ...previousForm,
      cover_photo: null,
    }));

    setCoverPreview(service?.cover_photo_url || "");

    if (coverInputRef.current) {
      coverInputRef.current.value = "";
    }
  }, [
    coverPreview,
    form.cover_photo,
    revokeObjectUrl,
    service?.cover_photo_url,
  ]);

  const handleGalleryImagesChange = useCallback(
    (event) => {
      const files = Array.from(event.target.files || []);

      if (files.length === 0) {
        return;
      }

      if (!derived.canUploadGalleryImages) {
        setLocalError("This service type does not support gallery images.");
        event.target.value = "";
        return;
      }

      if (derived.availableGallerySlots === 0) {
        setLocalError("No gallery image slot is available.");
        event.target.value = "";
        return;
      }

      if (files.length > derived.availableGallerySlots) {
        setLocalError(
          `You can upload only ${derived.availableGallerySlots} more gallery image(s).`,
        );
        event.target.value = "";
        return;
      }

      const previews = files.map((file, index) => ({
        id: createPreviewId(file, index),
        file,
        url: createObjectUrl(file),
        name: file.name,
      }));

      setForm((previousForm) => ({
        ...previousForm,
        add_gallery_images: [...previousForm.add_gallery_images, ...files],
      }));

      setNewGalleryPreviews((previousPreviews) => [
        ...previousPreviews,
        ...previews,
      ]);

      setLocalError(null);
      event.target.value = "";
    },
    [
      createObjectUrl,
      derived.availableGallerySlots,
      derived.canUploadGalleryImages,
    ],
  );

  const removeNewGalleryImage = useCallback(
    (previewId) => {
      const selectedPreview = newGalleryPreviews.find(
        (preview) => preview.id === previewId,
      );

      if (!selectedPreview) {
        return;
      }

      revokeObjectUrl(selectedPreview.url);

      setNewGalleryPreviews((previousPreviews) =>
        previousPreviews.filter((preview) => preview.id !== previewId),
      );

      setForm((previousForm) => ({
        ...previousForm,
        add_gallery_images: previousForm.add_gallery_images.filter(
          (file) => file !== selectedPreview.file,
        ),
      }));
    },
    [newGalleryPreviews, revokeObjectUrl],
  );

  const toggleRemoveGalleryImage = useCallback((imageId) => {
    const normalizedImageId = String(imageId);

    setForm((previousForm) => {
      const alreadySelected =
        previousForm.remove_gallery_image_ids.includes(normalizedImageId);

      return {
        ...previousForm,
        remove_gallery_image_ids: alreadySelected
          ? previousForm.remove_gallery_image_ids.filter(
              (id) => id !== normalizedImageId,
            )
          : [...previousForm.remove_gallery_image_ids, normalizedImageId],
      };
    });
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      dispatch(clearOperationState());
      setLocalError(null);

      const validationError = validateEventServiceForm({
        brandSlug,
        form,
        showShiftHour: derived.showShiftHour,
        showDriveLink: derived.showDriveLink,
        showPaymentFields: derived.showPaymentFields,
        isGalleryOnlyType: derived.isGalleryOnlyType,
        isCoverPhotoOnlyType: derived.isCoverPhotoOnlyType,
        currentExistingImageCount: derived.currentExistingImageCount,
        selectedImageLimit: derived.selectedImageLimit,
      });

      if (validationError) {
        setLocalError(validationError);
        return;
      }

      const formData = buildEventServiceFormData({
        form,
        showShiftHour: derived.showShiftHour,
        showDriveLink: derived.showDriveLink,
        showPaymentFields: derived.showPaymentFields,
        canUploadCoverPhoto: derived.canUploadCoverPhoto,
        canUploadGalleryImages: derived.canUploadGalleryImages,
      });

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
        setLocalError(null);

        dispatch(clearOperationState());
        setOpen(false);
      } catch (error) {
        // Keep the complete string/object/array payload from rejectWithValue.
        setLocalError(error);
      }
    },
    [
      brandSlug,
      clearFileInputs,
      derived,
      dispatch,
      form,
      isEdit,
      onSuccess,
      revokeAllObjectUrls,
      service,
    ],
  );

  return {
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
    ...derived,
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
  };
};

export default useEventServiceSheet;
