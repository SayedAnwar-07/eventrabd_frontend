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
import { Star } from "lucide-react";

const formatServiceName = (name = "") => {
  return name
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

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

  // Step positions depend on whether package booking is selected
  const hasPackageStep = supportsPackages && bookingMode === "packages";
  const detailsStep = hasPackageStep ? 3 : 2;
  const confirmStep = hasPackageStep ? 4 : 3;

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
      setFieldErrors({});
      clearMessages();
      return;
    }

    if (bookingMode !== "packages") {
      setBookingMode("packages");
      setBookingItems([createBookingItem(normalizedId)]);
      setFieldErrors({});
      clearMessages();
      return;
    }

    if (bookingItems.length >= MAX_BOOKING_SLOTS) {
      setFormError(`Maximum ${MAX_BOOKING_SLOTS} packages can be selected.`);
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
    clearFieldError("customer_whatsapp_number");
    clearMessages();
  };

  // Update customer note
  const handleNoteChange = (value) => {
    setCustomerNote(value.slice(0, 1000));
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
      setFormError("Select at least one package before continuing.");
      return;
    }

    setFieldErrors({});
    clearMessages();
    setCurrentStep(3);
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
      setFormError("Fix the highlighted fields before continuing.");
      return;
    }

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
      } else {
        setBookingMode("normal");
        setBookingItems([createBookingItem(null)]);
        setCurrentStep(2);
      }

      setCustomerWhatsappNumber("");
      setCustomerNote("");
      setFieldErrors({});
      setFormError("");
      setSuccessMessage("Your hire request was submitted successfully.");

      onSuccess?.(createdHire);
    } catch {
      // Redux stores the API error and GlobalErrorMessage displays it.
    }
  };

  // Prevent native form submission because confirmation controls submission
  const handleFormSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <form onSubmit={handleFormSubmit} noValidate className="space-y-6">
      {/* Step progress */}
      <div className="w-full mb-10">
        <StepIndicator currentStep={currentStep} hasPackages={hasPackageStep} />
      </div>

      <div className="flex items-start gap-4">
        <div className="h-14 w-14 overflow-hidden rounded-full">
          {brandLogo ? (
            <img
              src={brandLogo}
              alt={brandName || "Brand"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100">
              {brandName?.charAt(0) || "B"}
            </div>
          )}
        </div>

        <div className="">
          <div className="flex gap-3 items-center">
            <h3 className="text-lg font-semibold">
              {formatServiceName(serviceName)}
            </h3>
            {/* Rating */}
            <div className="ml-3 flex items-center gap-2">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />

              <span className="text-lg font-semibold">
                {Number(rating || 0).toFixed(1)}
              </span>

              <span className="text-sm text-muted-foreground">
                ({ratingCount} rating{ratingCount !== 1 ? "s" : ""})
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-500">{brandAddress}</p>
        </div>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <p className="text-sm font-medium text-green-800">{successMessage}</p>
        </div>
      )}

      {/* API error */}
      {apiError && <GlobalErrorMessage error={apiError} />}

      {/* Step 1: Booking type */}
      {supportsPackages && currentStep === 1 && (
        <StepServiceSelection
          bookingMode={bookingMode}
          serviceCharge={serviceCharge}
          onNormalServiceSelect={handleNormalServiceSelect}
          onPackageSelect={handlePackageSelect}
          disabled={loading}
        />
      )}

      {/* Step 2: Package selection */}
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
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-700">{formError}</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                clearMessages();
                setCurrentStep(1);
              }}
              className="flex-1 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Back
            </button>

            <button
              type="button"
              disabled={loading || bookingItems.length === 0}
              onClick={handlePackageContinue}
              className="flex-1 rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              Continue
            </button>
          </div>
        </>
      )}

      {/* Booking details */}
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

          {fieldErrors.customer_whatsapp_number && (
            <p className="text-sm font-medium text-red-600">
              {fieldErrors.customer_whatsapp_number}
            </p>
          )}

          {fieldErrors.booking_items && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-700">
                {fieldErrors.booking_items}
              </p>
            </div>
          )}

          {formError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-700">{formError}</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            {supportsPackages && (
              <button
                type="button"
                disabled={loading}
                onClick={handleDetailsBack}
                className="flex-1 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Back
              </button>
            )}

            <button
              type="button"
              disabled={loading || !serviceId || bookingItems.length === 0}
              onClick={handleDetailsContinue}
              className="flex-1 rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              Review Booking
            </button>
          </div>
        </>
      )}

      {/* Final confirmation */}
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
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-700">{formError}</p>
            </div>
          )}

          <button
            type="button"
            disabled={loading}
            onClick={() => {
              clearMessages();
              setCurrentStep(detailsStep);
            }}
            className="w-full rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Back to Booking Details
          </button>
        </>
      )}
    </form>
  );
};

export default HireRequestForm;
