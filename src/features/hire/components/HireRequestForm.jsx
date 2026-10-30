import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import GlobalErrorMessage from "@/components/common/GlobalErrorMessage";

import {
  clearHireOperationError,
  createHire,
  selectCreateHireError,
  selectCreateHireLoading,
} from "@/store/features/hire/hireSlice";

import StepBookingDetails from "../steps/StepBookingDetails";
import StepConfirmation from "../steps/StepConfirmation";
import StepIndicator from "../steps/StepIndicator";
import StepPackageSelection from "../steps/StepPackageSelection";
import StepServiceSelection from "../steps/StepServiceSelection";

import {
  createBookingItem,
  createEmptySlot,
  getMinimumDateTime,
  MAX_BOOKING_SLOTS,
  normalizeItemToQuantityOne,
  normalizeOptionalText,
  PACKAGE_SUPPORTED_SERVICES,
} from "../utils/hireFormUtils";

import { Star, MapPin, ArrowLeft, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

const formatServiceName = (name = "") => {
  return name
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const primaryButtonClass =
  "inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-md bg-theme-color px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-theme-color/20 transition-all duration-200 hover:brightness-95 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-color/30 focus-visible:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none disabled:opacity-70 border border-gray-500";

const secondaryButtonClass =
  "inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border border-theme-color bg-background px-5 py-3 text-sm font-semibold text-theme-color transition-all duration-200 hover:bg-theme-color/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-color/20 focus-visible:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:border-border disabled:bg-muted disabled:text-muted-foreground disabled:opacity-70";

const textButtonClass =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-theme-color transition-colors hover:bg-theme-color/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-color/20 disabled:cursor-not-allowed disabled:opacity-50";

const iconButtonClass =
  "inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-theme-color text-white shadow-sm transition-all duration-200 hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-color/30 focus-visible:ring-offset-2 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50";

const HireRequestForm = ({
  serviceId,
  serviceName,
  serviceCharge,
  selectedPackageId = null,

  // Brand Data
  brandLogo,
  brandName,
  brandAddress,
  rating,
  ratingCount,

  packages = [],
  packagesLoading = false,
  packagesError = null,
  onSuccess,
}) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectCreateHireLoading);
  const apiError = useSelector(selectCreateHireError);

  const supportsPackages = PACKAGE_SUPPORTED_SERVICES.includes(serviceName);
  const availablePackages = Array.isArray(packages) ? packages : [];

  // Form state
  const [minimumDateTime] = useState(getMinimumDateTime);

  const [bookingMode, setBookingMode] = useState(() =>
    selectedPackageId !== null && supportsPackages
      ? "packages"
      : supportsPackages
        ? ""
        : "normal",
  );

  const [bookingItems, setBookingItems] = useState(() =>
    selectedPackageId !== null && supportsPackages
      ? [createBookingItem(selectedPackageId)]
      : supportsPackages
        ? []
        : [createBookingItem(null)],
  );

  const [customerWhatsappNumber, setCustomerWhatsappNumber] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [currentStep, setCurrentStep] = useState(() =>
    selectedPackageId !== null && supportsPackages
      ? 3
      : supportsPackages
        ? 1
        : 2,
  );

  // Tracks the furthest step the user has successfully completed.
  const [highestCompletedStep, setHighestCompletedStep] = useState(() =>
    selectedPackageId !== null && supportsPackages
      ? 2
      : supportsPackages
        ? 0
        : 1,
  );

  // Step positions depend on whether package booking is selected
  const hasPackageStep = supportsPackages && bookingMode === "packages";
  const detailsStep = hasPackageStep ? 3 : 2;
  const confirmStep = hasPackageStep ? 4 : 3;

  // Any booking-detail edit requires the user to review the details again.
  const markDetailsIncomplete = () => {
    setHighestCompletedStep(detailsStep - 1);
  };

  // Clear Redux create error
  const clearCreateError = () => {
    if (apiError) {
      dispatch(clearHireOperationError("create"));
    }
  };

  // Clear general messages
  const clearMessages = () => {
    setFormError("");
    setSuccessMessage("");
    clearCreateError();
  };

  // Clear one field error
  const clearFieldError = (path) => {
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [path]: "",
    }));
  };

  // Find selected package
  const getPackageById = (packageId) => {
    return availablePackages.find(
      (item) => String(item?.id) === String(packageId),
    );
  };

  // Get display title and unit price
  const getBookingItemInfo = (item) => {
    if (!item.packageId) {
      return {
        title: "Book Service Normally",
        unitPrice: Number(serviceCharge),
      };
    }

    const selectedPackage = getPackageById(item.packageId);

    return {
      title: selectedPackage?.package_title || "Selected Package",
      unitPrice: Number(selectedPackage?.package_price),
    };
  };

  // Calculated booking values
  const totalQuantity = bookingItems.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0,
  );

  const pricesAvailable =
    bookingItems.length > 0 &&
    bookingItems.every((item) => {
      const { unitPrice } = getBookingItemInfo(item);
      return Number.isFinite(unitPrice);
    });

  const grandTotal = pricesAvailable
    ? bookingItems.reduce((total, item) => {
        const { unitPrice } = getBookingItemInfo(item);
        return total + unitPrice * Number(item.quantity || 1);
      }, 0)
    : null;

  // Select normal booking and continue to details
  const handleNormalServiceSelect = () => {
    if (loading) {
      return;
    }

    setBookingMode("normal");
    setBookingItems([createBookingItem(null)]);
    setFieldErrors({});
    clearMessages();

    // Mark Step 1 as completed
    setHighestCompletedStep(1);

    // Navigate to Step 2
    setCurrentStep(2);
  };

  // Select package booking mode
  const handlePackageSelect = () => {
    if (loading) {
      return;
    }

    if (bookingMode !== "packages") {
      setBookingMode("packages");
      setBookingItems([]);
      setFieldErrors({});
      clearMessages();
    }

    setHighestCompletedStep(1);
    setCurrentStep(2);
  };

  // Select or deselect package
  const handlePackageToggle = (packageId) => {
    if (loading) {
      return;
    }

    const normalizedId = String(packageId);

    const alreadySelected =
      bookingMode === "packages" &&
      bookingItems.some((item) => String(item.packageId) === normalizedId);

    if (alreadySelected) {
      const nextItems = bookingItems.filter(
        (item) => String(item.packageId) !== normalizedId,
      );

      setBookingItems(nextItems);
      setHighestCompletedStep(1);
      setFieldErrors({});
      clearMessages();
      return;
    }

    if (bookingMode !== "packages") {
      setBookingMode("packages");
      setBookingItems([createBookingItem(normalizedId)]);
      setHighestCompletedStep(1);
      setFieldErrors({});
      clearMessages();
      return;
    }

    if (bookingItems.length >= MAX_BOOKING_SLOTS) {
      toast.error(`Maximum ${MAX_BOOKING_SLOTS} packages can be selected.`);
      return;
    }

    // Multiple packages always keep quantity at one
    const normalizedExistingItems = bookingItems.map(
      normalizeItemToQuantityOne,
    );

    setBookingItems([
      ...normalizedExistingItems,
      createBookingItem(normalizedId),
    ]);
    setHighestCompletedStep(1);
    setFieldErrors({});
    clearMessages();
  };

  // Increase quantity only when one booking option exists
  const handleIncreaseQuantity = () => {
    if (loading || bookingItems.length !== 1) {
      return;
    }

    const currentItem = bookingItems[0];

    if (currentItem.quantity >= MAX_BOOKING_SLOTS) {
      setFormError(`Maximum quantity is ${MAX_BOOKING_SLOTS}.`);
      return;
    }

    setBookingItems([
      {
        ...currentItem,
        quantity: currentItem.quantity + 1,
        eventTypes: [...currentItem.eventTypes, ""],
        bookingSlots: [...currentItem.bookingSlots, createEmptySlot()],
      },
    ]);

    markDetailsIncomplete();
    setFieldErrors({});
    clearMessages();
  };

  // Decrease quantity only when one booking option exists
  const handleDecreaseQuantity = () => {
    if (loading || bookingItems.length !== 1) {
      return;
    }

    const currentItem = bookingItems[0];

    if (currentItem.quantity <= 1) {
      return;
    }

    setBookingItems([
      {
        ...currentItem,
        quantity: currentItem.quantity - 1,
        eventTypes: currentItem.eventTypes.slice(0, -1),
        bookingSlots: currentItem.bookingSlots.slice(0, -1),
      },
    ]);

    markDetailsIncomplete();
    setFieldErrors({});
    clearMessages();
  };

  // Update event type
  const handleEventTypeChange = (itemIndex, slotIndex, value) => {
    setBookingItems((currentItems) =>
      currentItems.map((item, currentItemIndex) => {
        if (currentItemIndex !== itemIndex) {
          return item;
        }

        const nextEventTypes = [...item.eventTypes];
        nextEventTypes[slotIndex] = value;

        return {
          ...item,
          eventTypes: nextEventTypes,
        };
      }),
    );

    markDetailsIncomplete();
    clearFieldError(`booking_items.${itemIndex}.event_types.${slotIndex}`);
    clearFieldError(`booking_items.${itemIndex}.event_types`);
    clearMessages();
  };

  // Update booking slot field
  const updateBookingField = (itemIndex, slotIndex, field, value) => {
    setBookingItems((currentItems) =>
      currentItems.map((item, currentItemIndex) => {
        if (currentItemIndex !== itemIndex) {
          return item;
        }

        const nextSlots = item.bookingSlots.map((slot, currentSlotIndex) =>
          currentSlotIndex === slotIndex
            ? {
                ...slot,
                [field]: value,
              }
            : slot,
        );

        return {
          ...item,
          bookingSlots: nextSlots,
        };
      }),
    );

    markDetailsIncomplete();
    clearFieldError(
      `booking_items.${itemIndex}.booking_slots.${slotIndex}.${field}`,
    );
    clearMessages();
  };

  // Normalize WhatsApp number to local 01XXXXXXXXX format
  const handleWhatsappChange = (value) => {
    let digitsOnly = value.replace(/\D/g, "");

    if (digitsOnly.startsWith("880")) {
      digitsOnly = digitsOnly.slice(2);
    }

    digitsOnly = digitsOnly.slice(0, 11);

    setCustomerWhatsappNumber(digitsOnly);
    markDetailsIncomplete();
    clearFieldError("customer_whatsapp_number");
    clearMessages();
  };

  // Update customer note
  const handleNoteChange = (value) => {
    setCustomerNote(value.slice(0, 1000));
    markDetailsIncomplete();
    clearMessages();
  };

  // Validate booking details
  const validateForm = () => {
    const errors = {};

    if (bookingItems.length === 0) {
      errors.booking_option = "Choose normal service or at least one package.";
    }

    if (totalQuantity > MAX_BOOKING_SLOTS) {
      errors.booking_items = `Maximum ${MAX_BOOKING_SLOTS} bookings are allowed.`;
    }

    if (bookingItems.length > 1) {
      bookingItems.forEach((item, itemIndex) => {
        if (item.quantity !== 1) {
          errors[`booking_items.${itemIndex}.quantity`] =
            "Quantity must be 1 when multiple packages are selected.";
        }
      });
    }

    const usedDateTimes = new Set();

    bookingItems.forEach((item, itemIndex) => {
      if (item.eventTypes.length !== item.quantity) {
        errors[`booking_items.${itemIndex}.event_types`] =
          "Event type count must match quantity.";
      }

      if (item.bookingSlots.length !== item.quantity) {
        errors[`booking_items.${itemIndex}.booking_slots`] =
          "Booking slot count must match quantity.";
      }

      const selectedEvents = item.eventTypes.filter(Boolean);

      if (selectedEvents.length !== new Set(selectedEvents).size) {
        errors[`booking_items.${itemIndex}.event_types`] =
          "The same event type cannot be selected twice for the same booking option.";
      }

      item.eventTypes.forEach((eventType, slotIndex) => {
        if (!eventType) {
          errors[`booking_items.${itemIndex}.event_types.${slotIndex}`] =
            `Select an event type for Event ${slotIndex + 1}.`;
        }
      });

      item.bookingSlots.forEach((slot, slotIndex) => {
        const isFirstBooking = itemIndex === 0 && slotIndex === 0;
        const startsAtPath = `booking_items.${itemIndex}.booking_slots.${slotIndex}.starts_at`;
        const venueNamePath = `booking_items.${itemIndex}.booking_slots.${slotIndex}.venue_name`;
        const venueAddressPath = `booking_items.${itemIndex}.booking_slots.${slotIndex}.venue_address`;

        if (isFirstBooking && !slot.starts_at) {
          errors[startsAtPath] = "Start date and time are required.";
        }

        if (isFirstBooking && !String(slot.venue_name || "").trim()) {
          errors[venueNamePath] = "Venue name is required.";
        }

        if (isFirstBooking && !String(slot.venue_address || "").trim()) {
          errors[venueAddressPath] = "Venue address is required.";
        }

        if (slot.starts_at) {
          const startsAt = new Date(slot.starts_at);

          if (Number.isNaN(startsAt.getTime())) {
            errors[startsAtPath] = "Enter a valid start date and time.";
          } else if (startsAt.getTime() <= Date.now()) {
            errors[startsAtPath] = "Start date and time must be in the future.";
          }

          if (usedDateTimes.has(slot.starts_at)) {
            errors[startsAtPath] = "This booking date and time is duplicated.";
          }

          usedDateTimes.add(slot.starts_at);
        }
      });
    });

    if (!customerWhatsappNumber.trim()) {
      errors.customer_whatsapp_number = "WhatsApp number is required.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // Continue from package selection
  const handlePackageContinue = () => {
    if (loading) {
      return;
    }

    if (bookingItems.length === 0) {
      setFieldErrors((currentErrors) => ({
        ...currentErrors,
        booking_option: "Select at least one package before continuing.",
      }));
      toast.error("Select at least one package before continuing.");
      return;
    }

    setFieldErrors({});
    clearMessages();
    setHighestCompletedStep(2);
    setCurrentStep(detailsStep);
  };

  // Continue from booking details to confirmation
  const handleDetailsContinue = () => {
    if (loading) {
      return;
    }

    setFormError("");
    setSuccessMessage("");
    clearCreateError();

    if (!validateForm()) {
      toast.error("Please fix the highlighted fields before continuing.");
      return;
    }

    setHighestCompletedStep(detailsStep);
    setCurrentStep(confirmStep);
  };

  // Return to the previous step
  const handleDetailsBack = () => {
    clearMessages();

    if (hasPackageStep) {
      setCurrentStep(2);
      return;
    }

    if (supportsPackages) {
      setCurrentStep(1);
    }
  };

  // Build API payload and submit
  const submitHireRequest = async () => {
    if (loading) {
      return;
    }

    setFormError("");
    setSuccessMessage("");
    clearCreateError();

    if (!serviceId) {
      setFormError("The selected service is unavailable.");
      return;
    }

    if (!validateForm()) {
      setFormError("Fix the highlighted fields before submitting.");
      setHighestCompletedStep(detailsStep - 1);
      setCurrentStep(detailsStep);
      return;
    }

    const payload = {
      service: serviceId,
      customer_whatsapp_number: `+88${customerWhatsappNumber.trim()}`,
      customer_note: customerNote.trim(),
      booking_items: bookingItems.map((item) => ({
        package: item.packageId || null,
        quantity: item.quantity,
        event_types: [...item.eventTypes],
        booking_slots: item.bookingSlots.map((slot) => ({
          starts_at: slot.starts_at
            ? new Date(slot.starts_at).toISOString()
            : null,
          venue_name: normalizeOptionalText(slot.venue_name),
          venue_address: normalizeOptionalText(slot.venue_address),
          google_map_link: normalizeOptionalText(slot.google_map_link),
        })),
      })),
    };

    try {
      const createdHire = await dispatch(createHire(payload)).unwrap();

      if (supportsPackages) {
        setBookingMode("");
        setBookingItems([]);
        setCurrentStep(1);
        setHighestCompletedStep(0);
      } else {
        setBookingMode("normal");
        setBookingItems([createBookingItem(null)]);
        setCurrentStep(2);
        setHighestCompletedStep(1);
      }

      setCustomerWhatsappNumber("");
      setCustomerNote("");
      setFieldErrors({});
      setFormError("");
      toast.success("Your hire request was submitted successfully.");

      onSuccess?.(createdHire);
    } catch (error) {
      const errorMessage =
        typeof error === "string"
          ? error
          : error?.message ||
            error?.detail ||
            "Unable to submit your booking. Please try again.";

      toast.error(errorMessage);
    }
  };

  // Navigate only to steps that have already been completed.
  const handleStepNavigation = (stepId) => {
    if (loading || stepId === currentStep) {
      return;
    }

    if (stepId > highestCompletedStep) {
      return;
    }

    clearMessages();
    setCurrentStep(stepId);
  };

  // Prevent native form submission because confirmation controls submission
  const handleFormSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      noValidate
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      {/* SCROLLABLE CONTENT */}
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain scroll-smooth pb-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* STEP INDICATOR */}
        <div className="mb-8 w-full">
          <StepIndicator
            currentStep={currentStep}
            highestCompletedStep={highestCompletedStep}
            hasPackages={hasPackageStep}
            supportsPackages={supportsPackages}
            onStepClick={handleStepNavigation}
          />
        </div>
        {/* BRAND HEADER */}
        <div className="w-full rounded-sm border border-[#DCE3E5] bg-white p-5 shadow-md sm:p-6 md:p-7">
          <div className="flex min-w-0 flex-col items-center gap-4 text-center lg:flex-row lg:items-center lg:gap-5 lg:text-left">
            {/* BRAND LOGO */}
            <div className="shrink-0">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full p-1 sm:h-24 sm:w-24">
                {brandLogo ? (
                  <img
                    src={brandLogo}
                    alt={`${brandName || "Brand"} logo`}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-light tracking-wider text-[#293B47]">
                    {brandName?.trim()?.charAt(0)?.toUpperCase() || "B"}
                  </span>
                )}
              </div>
            </div>

            {/* BRAND DETAILS */}
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center justify-center gap-4 md:justify-start">
                <h3 className="wrap-break-word text-lg font-medium uppercase leading-snug tracking-[0.16em] text-[#293B47] sm:text-xl sm:tracking-[0.20em]">
                  {brandName || "Event Service Provider"}
                </h3>

                {/* RATING */}
                <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                  <div
                    className="inline-flex items-center gap-1.5"
                    aria-label={`${Number(rating || 0).toFixed(1)} out of 5 stars`}
                  >
                    <Star
                      size={18}
                      strokeWidth={1.8}
                      fill="#FFCC40"
                      color="#FFCC40"
                      className="shrink-0"
                    />

                    <span className="text-sm font-semibold tabular-nums text-[#293B47]">
                      {Number(rating || 0).toFixed(1)}
                    </span>
                  </div>

                  <span className="text-sm text-[#73818A]">
                    ({ratingCount || 0}{" "}
                    {Number(ratingCount) === 1 ? "rating" : "ratings"})
                  </span>
                </div>
              </div>

              {/* SERVICE NAME */}
              <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#52636E] sm:text-xs sm:tracking-[0.32em]">
                {formatServiceName(serviceName)}
              </p>

              <div className="mx-auto h-px w-12 bg-[#B9C6CB] lg:mx-0" />

              {/* BRAND ADDRESS */}
              {brandAddress && (
                <div className="flex min-w-0 items-start justify-center gap-2 pt-1 lg:justify-start">
                  <MapPin
                    size={15}
                    strokeWidth={1.6}
                    className="mt-0.5 shrink-0 text-[#667780]"
                  />

                  <p className="min-w-0 wrap-break-word text-xs leading-relaxed text-[#73818A] sm:text-sm">
                    {brandAddress}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SUCCESS MESSAGE */}
        {successMessage && (
          <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3">
            <p className="text-sm font-medium text-green-800">
              {successMessage}
            </p>
          </div>
        )}

        {/* API ERROR */}
        {apiError && <GlobalErrorMessage error={apiError} />}

        {/* STEP 1: BOOKING TYPE */}
        {supportsPackages && currentStep === 1 && (
          <StepServiceSelection
            serviceName={serviceName}
            bookingMode={bookingMode}
            serviceCharge={serviceCharge}
            onNormalServiceSelect={handleNormalServiceSelect}
            onPackageSelect={handlePackageSelect}
            disabled={loading}
          />
        )}

        {/* STEP 2: PACKAGE SELECTION */}
        {hasPackageStep && currentStep === 2 && (
          <>
            <StepPackageSelection
              packages={availablePackages}
              packagesLoading={packagesLoading}
              packagesError={packagesError}
              bookingMode={bookingMode}
              bookingItems={bookingItems}
              loading={loading}
              onPackageToggle={handlePackageToggle}
            />

            {fieldErrors.booking_option && (
              <p className="text-sm font-medium text-red-600">
                {fieldErrors.booking_option}
              </p>
            )}

            {formError && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-700">{formError}</p>
              </div>
            )}
          </>
        )}

        {/* BOOKING DETAILS */}
        {currentStep === detailsStep && (
          <>
            <StepBookingDetails
              bookingItems={bookingItems}
              minimumDateTime={minimumDateTime}
              loading={loading}
              fieldErrors={fieldErrors}
              onIncreaseQuantity={handleIncreaseQuantity}
              onDecreaseQuantity={handleDecreaseQuantity}
              onEventTypeChange={handleEventTypeChange}
              onBookingFieldChange={updateBookingField}
              getBookingItemInfo={getBookingItemInfo}
              customerWhatsappNumber={customerWhatsappNumber}
              customerNote={customerNote}
              onWhatsappChange={handleWhatsappChange}
              onNoteChange={handleNoteChange}
            />

            {fieldErrors.booking_items && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-700">
                  {fieldErrors.booking_items}
                </p>
              </div>
            )}

            {formError && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-700">{formError}</p>
              </div>
            )}
          </>
        )}

        {/* FINAL CONFIRMATION */}
        {currentStep === confirmStep && (
          <>
            <StepConfirmation
              bookingItems={bookingItems}
              getBookingItemInfo={getBookingItemInfo}
              grandTotal={grandTotal}
              customerWhatsappNumber={customerWhatsappNumber}
              customerNote={customerNote}
              onConfirm={submitHireRequest}
              loading={loading}
            />

            {formError && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-700">{formError}</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* FIXED BOTTOM ACTION BAR */}
      <div className="z-20 shrink-0  px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-4">
        {/* PACKAGE SELECTION */}
        {hasPackageStep && currentStep === 2 && (
          <div className="flex w-full items-center gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                clearMessages();
                setCurrentStep(1);
              }}
              className={secondaryButtonClass}
            >
              <ArrowLeft size={17} />
              Back
            </button>

            <button
              type="button"
              disabled={loading || bookingItems.length === 0}
              onClick={handlePackageContinue}
              className={primaryButtonClass}
            >
              Continue
              <ArrowRight size={17} />
            </button>
          </div>
        )}

        {/* BOOKING DETAILS */}
        {currentStep === detailsStep && (
          <div className="flex w-full items-center gap-3">
            {supportsPackages && (
              <button
                type="button"
                disabled={loading}
                onClick={handleDetailsBack}
                className={secondaryButtonClass}
              >
                <ArrowLeft size={17} />
                Back
              </button>
            )}

            <button
              type="button"
              disabled={loading || !serviceId || bookingItems.length === 0}
              onClick={handleDetailsContinue}
              className={primaryButtonClass}
            >
              Review Booking
              <ArrowRight size={17} />
            </button>
          </div>
        )}

        {/* CONFIRMATION */}
        {currentStep === confirmStep && (
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              clearMessages();
              setCurrentStep(detailsStep);
            }}
            className={`w-full ${secondaryButtonClass.replace("flex-1", "")}`}
          >
            <ArrowLeft size={17} />
            Back to Booking Details
          </button>
        )}
      </div>
    </form>
  );
};

export default HireRequestForm;
