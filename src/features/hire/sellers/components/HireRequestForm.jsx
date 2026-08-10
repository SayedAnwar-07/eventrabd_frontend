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

const HireRequestForm = ({ serviceId, onSuccess }) => {
  const dispatch = useDispatch();

  const loading = useSelector(selectCreateHireLoading);

  const apiError = useSelector(selectCreateHireError);

  const minimumDateTime = useMemo(() => getMinimumDateTime(), []);

  const [customerNote, setCustomerNote] = useState("");

  const [bookingSlots, setBookingSlots] = useState([createEmptySlot()]);

  // Only frontend validation errors
  const [fieldErrors, setFieldErrors] = useState({});

  const [formError, setFormError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const clearCreateError = () => {
    if (apiError) {
      dispatch(clearHireOperationError("create"));
    }
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

    try {
      const createdHire = await dispatch(createHire(payload)).unwrap();

      setCustomerNote("");

      setBookingSlots([createEmptySlot()]);

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

                  <input
                    id={`whatsapp-number-${index}`}
                    type="tel"
                    value={slot.whatsapp_number}
                    disabled={loading}
                    placeholder="Enter your WhatsApp number"
                    onChange={(event) => {
                      const digitsOnly = event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 11);

                      updateBookingSlot(index, "whatsapp_number", digitsOnly);
                    }}
                    className={`h-11 w-full rounded-none px-3 text-sm outline-none ${
                      whatsappNumberError
                        ? "border border-red-600"
                        : "border border-gray-300"
                    }`}
                  />

                  {whatsappNumberError && (
                    <p className="mt-2 text-xs text-red-600">
                      {whatsappNumberError}
                    </p>
                  )}
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
