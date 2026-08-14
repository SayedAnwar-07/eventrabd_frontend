import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  clearHireOperationError,
  createHire,
  selectCreateHireError,
  selectCreateHireLoading,
} from "@/store/features/hire/hireSlice";

import GlobalErrorMessage from "@/components/common/GlobalErrorMessage";

const MAX_BOOKING_SLOTS = 5;

const PACKAGE_SUPPORTED_SERVICES = ["photography", "videography"];

const EVENT_TYPE_OPTIONS = [
  {
    value: "holud",
    label: "Holud",
  },
  {
    value: "mehedi",
    label: "Mehedi",
  },
  {
    value: "akhd_walima",
    label: "Akhd/Walima",
  },
  {
    value: "wedding_ceremony",
    label: "Wedding Ceremony",
  },
  {
    value: "reception",
    label: "Reception",
  },
  {
    value: "anniversary",
    label: "Anniversary",
  },
  {
    value: "birthday",
    label: "Birthday",
  },
];

const createEmptySlot = () => ({
  starts_at: "",
  whatsapp_number: "",
  venue_name: "",
  venue_address: "",
  location_note: "",
  google_map_link: "",
});

const getMinimumDateTime = () => {
  const now = new Date();

  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

  return now.toISOString().slice(0, 16);
};

const formatPrice = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return null;
  }

  return `৳${numericValue.toLocaleString("en-US")}`;
};

const HireRequestForm = ({
  serviceId,
  serviceName,
  serviceCharge,
  packages = [],
  packagesLoading = false,
  packagesError = null,
  onSuccess,
}) => {
  const dispatch = useDispatch();

  const loading = useSelector(selectCreateHireLoading);

  const apiError = useSelector(selectCreateHireError);

  const minimumDateTime = useMemo(() => getMinimumDateTime(), []);

  const [customerNote, setCustomerNote] = useState("");

  const [bookingSlots, setBookingSlots] = useState([createEmptySlot()]);

  const [eventType, setEventType] = useState("");

  const [selectedPackageId, setSelectedPackageId] = useState("");

  // Only frontend validation errors
  const [fieldErrors, setFieldErrors] = useState({});

  const [formError, setFormError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const supportsPackages = PACKAGE_SUPPORTED_SERVICES.includes(serviceName);

  const availablePackages = Array.isArray(packages) ? packages : [];

  const selectedPackage = availablePackages.find(
    (item) => String(item?.id) === String(selectedPackageId),
  );

  const normalServicePrice = formatPrice(serviceCharge);

  const selectedPackagePrice = formatPrice(selectedPackage?.package_price);

  const clearCreateError = () => {
    if (apiError) {
      dispatch(clearHireOperationError("create"));
    }
  };

  const clearFormMessages = () => {
    setFormError("");
    setSuccessMessage("");
    clearCreateError();
  };

  const getDisplayedFieldError = (fieldPath) => {
    return fieldErrors[fieldPath] || "";
  };

  const updateBookingSlot = (index, field, value) => {
    setBookingSlots((currentSlots) =>
      currentSlots.map((slot, slotIndex) =>
        slotIndex === index
          ? {
              ...slot,
              [field]: value,
            }
          : slot,
      ),
    );

    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [`booking_slots.${index}.${field}`]: "",
    }));

    setFormError("");
    setSuccessMessage("");

    clearCreateError();
  };

  const addBookingSlot = () => {
    if (loading || bookingSlots.length >= MAX_BOOKING_SLOTS) {
      return;
    }

    setBookingSlots((currentSlots) => [...currentSlots, createEmptySlot()]);

    setFieldErrors({});
    setFormError("");
    setSuccessMessage("");

    clearCreateError();
  };

  const removeBookingSlot = (index) => {
    if (loading || bookingSlots.length === 1) {
      return;
    }

    setBookingSlots((currentSlots) =>
      currentSlots.filter((_, slotIndex) => slotIndex !== index),
    );

    setFieldErrors({});
    setFormError("");
    setSuccessMessage("");

    clearCreateError();
  };

  const handleNormalServiceSelect = () => {
    if (loading) {
      return;
    }

    setSelectedPackageId("");
    clearFormMessages();
  };

  const handlePackageSelect = (packageId) => {
    if (loading) {
      return;
    }

    setSelectedPackageId(String(packageId));
    clearFormMessages();
  };

  const validateForm = () => {
    const errors = {};

    const duplicateKeys = new Set();

    bookingSlots.forEach((slot, index) => {
      const fieldPrefix = `booking_slots.${index}`;

      if (!slot.starts_at) {
        errors[`${fieldPrefix}.starts_at`] =
          "Start date and time are required.";
      }

      if (!slot.whatsapp_number.trim()) {
        errors[`${fieldPrefix}.whatsapp_number`] =
          "WhatsApp number is required.";
      }

      if (!slot.venue_name.trim()) {
        errors[`${fieldPrefix}.venue_name`] = "Venue name is required.";
      }

      if (!slot.venue_address.trim()) {
        errors[`${fieldPrefix}.venue_address`] = "Venue address is required.";
      }

      if (slot.starts_at) {
        const startsAt = new Date(slot.starts_at);

        if (Number.isNaN(startsAt.getTime())) {
          errors[`${fieldPrefix}.starts_at`] =
            "Enter a valid start date and time.";
        } else if (startsAt.getTime() <= Date.now()) {
          errors[`${fieldPrefix}.starts_at`] =
            "Start date and time must be in the future.";
        }
      }

      if (slot.starts_at) {
        if (duplicateKeys.has(slot.starts_at)) {
          errors[`${fieldPrefix}.starts_at`] =
            "This booking date and time is duplicated.";
        }

        duplicateKeys.add(slot.starts_at);
      }
    });

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");

    setSuccessMessage("");

    clearCreateError();

    if (!serviceId) {
      setFormError("The selected service is unavailable.");
      return;
    }

    if (bookingSlots.length === 0) {
      setFormError("At least one booking slot is required.");
      return;
    }

    if (bookingSlots.length > MAX_BOOKING_SLOTS) {
      setFormError(
        `You can submit a maximum of ${MAX_BOOKING_SLOTS} booking slots.`,
      );
      return;
    }

    if (!validateForm()) {
      setFormError("Fix the highlighted fields before submitting.");
      return;
    }

    const payload = {
      service: serviceId,

      customer_note: customerNote.trim(),

      booking_slots: bookingSlots.map((slot) => ({
        starts_at: new Date(slot.starts_at).toISOString(),

        customer_whatsapp_number: `+88${slot.whatsapp_number.trim()}`,

        venue_name: slot.venue_name.trim(),

        venue_address: slot.venue_address.trim(),

        location_note: slot.location_note.trim(),

        google_map_link: slot.google_map_link.trim(),
      })),
    };

    if (selectedPackageId) {
      payload.package = selectedPackageId;
    }

    if (eventType) {
      payload.event_type = eventType;
    }

    try {
      const createdHire = await dispatch(createHire(payload)).unwrap();

      setCustomerNote("");

      setBookingSlots([createEmptySlot()]);

      setEventType("");

      setSelectedPackageId("");

      setFieldErrors({});

      setFormError("");

      setSuccessMessage("Your hire request was submitted successfully.");

      onSuccess?.(createdHire);
    } catch {
      // Redux stores API error
      // GlobalErrorMessage displays it
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-8">
        {/* Booking option */}
        {supportsPackages && (
          <section className="border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
                Booking Option
              </p>

              <h3 className="mt-1 text-lg font-semibold text-gray-950">
                Choose How You Want to Book
              </h3>

              <p className="mt-1 text-sm leading-6 text-gray-600">
                Book the service normally or select one available package.
              </p>
            </div>

            <div className="space-y-5 p-5">
              {/* Option A */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">
                  Option A
                </p>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleNormalServiceSelect}
                  className={`w-full border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    !selectedPackageId
                      ? "border-gray-950 bg-gray-50"
                      : "border-gray-200 bg-white hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        !selectedPackageId
                          ? "border-gray-950"
                          : "border-gray-300"
                      }`}
                    >
                      {!selectedPackageId && (
                        <span className="h-2.5 w-2.5 rounded-full bg-gray-950" />
                      )}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-950">
                        Book Service Normally
                      </p>

                      <p className="mt-1 text-sm text-gray-600">
                        Use the regular service charge.
                      </p>

                      <p className="mt-2 text-sm font-semibold text-gray-950">
                        {normalServicePrice
                          ? `${normalServicePrice} per shift`
                          : "Service charge unavailable"}
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Option B */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">
                  Option B
                </p>

                <div className="border border-gray-200">
                  <div className="border-b border-gray-200 px-4 py-3">
                    <p className="font-semibold text-gray-950">
                      Select One Package
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      Package selection is optional.
                    </p>
                  </div>

                  <div className="p-4">
                    {packagesLoading ? (
                      <div className="py-4 text-center">
                        <p className="text-sm text-gray-500">
                          Loading packages...
                        </p>
                      </div>
                    ) : packagesError ? (
                      <div className="space-y-3">
                        <GlobalErrorMessage error={packagesError} />

                        <p className="text-xs text-gray-500">
                          You can still book this service normally.
                        </p>
                      </div>
                    ) : availablePackages.length === 0 ? (
                      <div className="py-4 text-center">
                        <p className="text-sm text-gray-500">
                          No packages are currently available for this service.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {availablePackages.map((item) => {
                          const isSelected =
                            String(selectedPackageId) === String(item?.id);

                          const packagePrice = formatPrice(item?.package_price);

                          return (
                            <button
                              key={item.id}
                              type="button"
                              disabled={loading}
                              onClick={() => handlePackageSelect(item.id)}
                              className={`w-full border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                isSelected
                                  ? "border-[#a2101b] bg-red-50/40"
                                  : "border-gray-200 bg-white hover:border-gray-400"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <span
                                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                                    isSelected
                                      ? "border-[#a2101b]"
                                      : "border-gray-300"
                                  }`}
                                >
                                  {isSelected && (
                                    <span className="h-2.5 w-2.5 rounded-full bg-[#a2101b]" />
                                  )}
                                </span>

                                <div className="min-w-0 flex-1">
                                  <p className="wrap-break-word font-semibold text-gray-950">
                                    {item?.package_title || "Untitled Package"}
                                  </p>

                                  <p className="mt-1 text-sm font-semibold text-[#a2101b]">
                                    {packagePrice ||
                                      "Package price unavailable"}
                                  </p>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Current price summary */}
              {selectedPackage ? (
                <div className="border-l-2 border-[#a2101b] bg-red-50/50 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Selected Package
                  </p>

                  <p className="mt-1 font-semibold text-gray-950">
                    {selectedPackage.package_title}
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#a2101b]">
                    {selectedPackagePrice || "Package price unavailable"}
                  </p>
                </div>
              ) : (
                <div className="border-l-2 border-gray-950 bg-gray-50 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Normal Service
                  </p>

                  <p className="mt-1 font-semibold text-gray-950">
                    Book Service Normally
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-950">
                    {normalServicePrice
                      ? `${normalServicePrice} per shift`
                      : "Service charge unavailable"}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Event Type */}
        <div>
          <label
            htmlFor="event-type"
            className="mb-2 block text-sm font-medium text-gray-950"
          >
            Event Type
            <span className="ml-1 font-normal text-gray-500">(Optional)</span>
          </label>

          <select
            id="event-type"
            value={eventType}
            disabled={loading}
            onChange={(event) => {
              setEventType(event.target.value);
              clearFormMessages();
            }}
            className="h-11 w-full border border-gray-300 bg-white px-3 text-sm text-gray-950 outline-none disabled:bg-gray-100"
          >
            <option value="">Select event type</option>

            {EVENT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Existing booking slots */}
        {bookingSlots.map((slot, index) => {
          const fieldPrefix = `booking_slots.${index}`;

          const startsAtError = getDisplayedFieldError(
            `${fieldPrefix}.starts_at`,
          );

          const whatsappNumberError = getDisplayedFieldError(
            `${fieldPrefix}.whatsapp_number`,
          );

          const venueNameError = getDisplayedFieldError(
            `${fieldPrefix}.venue_name`,
          );

          const venueAddressError = getDisplayedFieldError(
            `${fieldPrefix}.venue_address`,
          );

          const locationNoteError = getDisplayedFieldError(
            `${fieldPrefix}.location_note`,
          );

          const googleMapLinkError = getDisplayedFieldError(
            `${fieldPrefix}.google_map_link`,
          );

          return (
            <section key={index} className="border border-gray-200 bg-white">
              <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
                    Booking Slot
                  </p>

                  <h3 className="mt-1 text-lg font-semibold text-gray-950">
                    Event Date {index + 1}
                  </h3>
                </div>

                {bookingSlots.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeBookingSlot(index)}
                    disabled={loading}
                    className="text-sm font-semibold text-red-600 disabled:opacity-50"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
                {/* Start date */}
                <div>
                  <label
                    htmlFor={`starts-at-${index}`}
                    className="mb-2 block text-sm font-medium text-gray-950"
                  >
                    Start date and time
                  </label>

                  <input
                    id={`starts-at-${index}`}
                    type="datetime-local"
                    min={minimumDateTime}
                    value={slot.starts_at}
                    disabled={loading}
                    onChange={(event) =>
                      updateBookingSlot(index, "starts_at", event.target.value)
                    }
                    className={`h-11 w-full rounded-none px-3 text-sm outline-none ${
                      startsAtError
                        ? "border border-red-600"
                        : "border border-gray-300"
                    }`}
                  />

                  {startsAtError && (
                    <p className="mt-2 text-xs text-red-600">{startsAtError}</p>
                  )}
                </div>

                {/* WhatsApp */}
                <div>
                  <label
                    htmlFor={`whatsapp-number-${index}`}
                    className="mb-2 block text-sm font-medium text-gray-950"
                  >
                    WhatsApp Number
                  </label>

                  <div
                    className={`flex h-11 w-full overflow-hidden ${
                      whatsappNumberError
                        ? "border border-red-600"
                        : "border border-gray-300"
                    }`}
                  >
                    <span className="flex shrink-0 items-center pl-3 text-sm font-medium text-gray-700">
                      +88
                    </span>

                    <input
                      id={`whatsapp-number-${index}`}
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      value={slot.whatsapp_number}
                      disabled={loading}
                      placeholder="01XXXXXXXXX"
                      maxLength={11}
                      onChange={(event) => {
                        let digitsOnly = event.target.value.replace(/\D/g, "");

                        if (digitsOnly.startsWith("880")) {
                          digitsOnly = digitsOnly.slice(2);
                        }

                        digitsOnly = digitsOnly.slice(0, 11);

                        updateBookingSlot(index, "whatsapp_number", digitsOnly);
                      }}
                      className="min-w-0 flex-1 pl-1 pr-3 text-sm outline-none disabled:bg-gray-100"
                    />
                  </div>

                  {whatsappNumberError && (
                    <p className="mt-2 text-xs text-red-600">
                      {whatsappNumberError}
                    </p>
                  )}

                  <p className="mt-1 text-xs text-gray-500">
                    Example: +88 01712345678
                  </p>
                </div>

                {/* Google Map */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor={`google-map-link-${index}`}
                    className="mb-2 block text-sm font-medium"
                  >
                    Google Maps Location
                  </label>

                  <input
                    id={`google-map-link-${index}`}
                    type="url"
                    value={slot.google_map_link}
                    disabled={loading}
                    placeholder="https://maps.app.goo.gl/example"
                    onChange={(event) =>
                      updateBookingSlot(
                        index,
                        "google_map_link",
                        event.target.value,
                      )
                    }
                    className={`h-11 w-full rounded-none px-3 text-sm outline-none ${
                      googleMapLinkError
                        ? "border border-red-600"
                        : "border border-gray-300"
                    }`}
                  />

                  {googleMapLinkError && (
                    <p className="mt-2 text-xs text-red-600">
                      {googleMapLinkError}
                    </p>
                  )}
                </div>

                {/* Venue name */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Venue name
                  </label>

                  <input
                    type="text"
                    value={slot.venue_name}
                    disabled={loading}
                    onChange={(event) =>
                      updateBookingSlot(index, "venue_name", event.target.value)
                    }
                    className={`h-11 w-full rounded-none px-3 text-sm outline-none ${
                      venueNameError
                        ? "border border-red-600"
                        : "border border-gray-300"
                    }`}
                  />

                  {venueNameError && (
                    <p className="mt-2 text-xs text-red-600">
                      {venueNameError}
                    </p>
                  )}
                </div>

                {/* Venue address */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Venue address
                  </label>

                  <input
                    type="text"
                    value={slot.venue_address}
                    disabled={loading}
                    onChange={(event) =>
                      updateBookingSlot(
                        index,
                        "venue_address",
                        event.target.value,
                      )
                    }
                    className={`h-11 w-full rounded-none px-3 text-sm outline-none ${
                      venueAddressError
                        ? "border border-red-600"
                        : "border border-gray-300"
                    }`}
                  />

                  {venueAddressError && (
                    <p className="mt-2 text-xs text-red-600">
                      {venueAddressError}
                    </p>
                  )}
                </div>

                {/* Location note */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium">
                    Location note
                  </label>

                  <textarea
                    rows={3}
                    value={slot.location_note}
                    disabled={loading}
                    onChange={(event) =>
                      updateBookingSlot(
                        index,
                        "location_note",
                        event.target.value,
                      )
                    }
                    className={`w-full resize-none rounded-none px-3 py-3 text-sm outline-none ${
                      locationNoteError
                        ? "border border-red-600"
                        : "border border-gray-300"
                    }`}
                  />

                  {locationNoteError && (
                    <p className="mt-2 text-xs text-red-600">
                      {locationNoteError}
                    </p>
                  )}
                </div>
              </div>
            </section>
          );
        })}

        <button
          type="button"
          onClick={addBookingSlot}
          disabled={loading || bookingSlots.length >= MAX_BOOKING_SLOTS}
          className="w-full border border-dashed px-5 py-3 text-sm font-semibold disabled:opacity-50"
        >
          {bookingSlots.length >= MAX_BOOKING_SLOTS
            ? "Maximum 5 Event Dates"
            : "+ Add Another Event Date"}
        </button>

        <div>
          <label
            htmlFor="customer-note"
            className="mb-2 block text-sm font-medium"
          >
            Customer note
          </label>

          <textarea
            id="customer-note"
            rows={4}
            maxLength={1000}
            value={customerNote}
            disabled={loading}
            onChange={(event) => {
              setCustomerNote(event.target.value);
              setFormError("");
              setSuccessMessage("");
              clearCreateError();
            }}
            className="w-full resize-none rounded-none border border-gray-300 px-3 py-3 text-sm outline-none"
          />

          <p className="mt-1 text-right text-xs text-gray-500">
            {customerNote.length}/1000
          </p>
        </div>

        {formError && (
          <div className="border-l-2 border-red-600 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">{formError}</p>
          </div>
        )}

        {apiError && <GlobalErrorMessage error={apiError} />}

        {successMessage && (
          <div className="border-l-2 border-green-700 bg-green-50 px-4 py-3">
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !serviceId}
          className="w-full bg-gray-950 px-5 py-3 text-sm font-semibold text-white disabled:bg-gray-400"
        >
          {loading ? "Submitting Request..." : "Submit Hire Request"}
        </button>
      </div>
    </form>
  );
};

export default HireRequestForm;
