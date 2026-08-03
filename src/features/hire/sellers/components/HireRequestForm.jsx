import { useMemo, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import {
  clearHireOperationError,
  createHire,
  getHireFieldError,
  selectCreateHireError,
  selectCreateHireLoading,
} from "@/store/features/hire/hireSlice";

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

  const [fieldErrors, setFieldErrors] = useState({});

  const [formError, setFormError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const clearCreateError = () => {
    if (apiError) {
      dispatch(clearHireOperationError("create"));
    }
  };

  const getDisplayedFieldError = (fieldPath) => {
    return (
      fieldErrors[fieldPath] || getHireFieldError(apiError, fieldPath) || ""
    );
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

    /*
     * Slot indexes change after removal. Clear existing errors
     * instead of showing an error beneath the wrong slot.
     */
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
      /*
       * The normalized rejected payload is stored in
       * state.hire.errors.create.
       */
    }
  };

  const bookingSlotsError = getHireFieldError(apiError, "booking_slots");

  const serviceError = getHireFieldError(apiError, "service");

  const customerNoteError = getHireFieldError(apiError, "customer_note");

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-8">
        {serviceError ? (
          <div
            role="alert"
            className="border-l-2 border-red-600 bg-red-50 px-4 py-3"
          >
            <p className="text-sm text-red-700">{serviceError}</p>
          </div>
        ) : null}

        {bookingSlotsError ? (
          <div
            role="alert"
            className="border-l-2 border-red-600 bg-red-50 px-4 py-3"
          >
            <p className="text-sm text-red-700">{bookingSlotsError}</p>
          </div>
        ) : null}

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

                {bookingSlots.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeBookingSlot(index)}
                    disabled={loading}
                    className="text-sm font-semibold text-red-600 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Remove
                  </button>
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
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
                    aria-invalid={Boolean(startsAtError)}
                    onChange={(event) =>
                      updateBookingSlot(index, "starts_at", event.target.value)
                    }
                    className={`h-11 w-full rounded-none bg-white px-3 ${"text-sm text-gray-950 outline-none transition "}disabled:cursor-not-allowed disabled:bg-gray-100 ${
                      startsAtError
                        ? "border border-red-600 " + "focus:border-red-700"
                        : "border border-gray-300 " + "focus:border-gray-950"
                    }`}
                  />

                  {startsAtError ? (
                    <p className="mt-2 text-xs text-red-600">{startsAtError}</p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor={`whatsapp-number-${index}`}
                    className="mb-2 block text-sm font-medium text-gray-950"
                  >
                    WhatsApp Number
                  </label>

                  <div
                    className={`flex h-11 w-full items-center rounded-none bg-white transition ${
                      whatsappNumberError
                        ? "border border-red-600 focus-within:border-red-700"
                        : "border border-gray-300 focus-within:border-gray-950"
                    } ${loading ? "cursor-not-allowed bg-gray-100" : ""}`}
                  >
                    <span className="select-none pl-3 pr-1 text-sm text-primary">
                      +88
                    </span>

                    <input
                      id={`whatsapp-number-${index}`}
                      type="tel"
                      value={slot.whatsapp_number}
                      disabled={loading}
                      aria-invalid={Boolean(whatsappNumberError)}
                      placeholder="Enter your WhatsApp number"
                      onChange={(event) => {
                        const digitsOnly = event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 11);
                        updateBookingSlot(index, "whatsapp_number", digitsOnly);
                      }}
                      className="h-full w-full bg-transparent px-1 text-sm text-gray-950 outline-none disabled:cursor-not-allowed"
                    />
                  </div>

                  {whatsappNumberError && (
                    <p className="mt-2 text-xs text-red-600">
                      {whatsappNumberError}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor={`google-map-link-${index}`}
                    className="mb-2 block text-sm font-medium text-gray-950"
                  >
                    Google Maps Location
                    <span className="ml-1 font-normal text-gray-500">
                      Optional
                    </span>
                  </label>

                  <input
                    id={`google-map-link-${index}`}
                    type="url"
                    value={slot.google_map_link}
                    disabled={loading}
                    aria-invalid={Boolean(googleMapLinkError)}
                    placeholder="https://maps.app.goo.gl/example"
                    onChange={(event) =>
                      updateBookingSlot(
                        index,
                        "google_map_link",
                        event.target.value,
                      )
                    }
                    className={`h-11 w-full rounded-none bg-white px-3 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100 ${
                      googleMapLinkError
                        ? "border border-red-600 focus:border-red-700"
                        : "border border-gray-300 focus:border-gray-950"
                    }`}
                  />

                  {googleMapLinkError ? (
                    <p className="mt-2 text-xs text-red-600">
                      {googleMapLinkError}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor={`venue-name-${index}`}
                    className="mb-2 block text-sm font-medium text-gray-950"
                  >
                    Venue name
                  </label>

                  <input
                    id={`venue-name-${index}`}
                    type="text"
                    value={slot.venue_name}
                    disabled={loading}
                    aria-invalid={Boolean(venueNameError)}
                    placeholder="Royal Convention Hall"
                    onChange={(event) =>
                      updateBookingSlot(index, "venue_name", event.target.value)
                    }
                    className={`h-11 w-full rounded-none bg-white px-3 ${"text-sm text-gray-950 outline-none transition "}placeholder:text-gray-400 disabled:cursor-not-allowed ${"disabled:bg-gray-100 "}${
                      venueNameError
                        ? "border border-red-600 " + "focus:border-red-700"
                        : "border border-gray-300 " + "focus:border-gray-950"
                    }`}
                  />

                  {venueNameError ? (
                    <p className="mt-2 text-xs text-red-600">
                      {venueNameError}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor={`venue-address-${index}`}
                    className="mb-2 block text-sm font-medium text-gray-950"
                  >
                    Venue address
                  </label>

                  <input
                    id={`venue-address-${index}`}
                    type="text"
                    value={slot.venue_address}
                    disabled={loading}
                    aria-invalid={Boolean(venueAddressError)}
                    placeholder="Narayanganj, Bangladesh"
                    onChange={(event) =>
                      updateBookingSlot(
                        index,
                        "venue_address",
                        event.target.value,
                      )
                    }
                    className={`h-11 w-full rounded-none bg-white px-3 ${"text-sm text-gray-950 outline-none transition "}placeholder:text-gray-400 disabled:cursor-not-allowed ${"disabled:bg-gray-100 "}${
                      venueAddressError
                        ? "border border-red-600 " + "focus:border-red-700"
                        : "border border-gray-300 " + "focus:border-gray-950"
                    }`}
                  />

                  {venueAddressError ? (
                    <p className="mt-2 text-xs text-red-600">
                      {venueAddressError}
                    </p>
                  ) : null}
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor={`location-note-${index}`}
                    className="mb-2 block text-sm font-medium text-gray-950"
                  >
                    Location note
                    <span className="ml-1 font-normal text-gray-500">
                      Optional
                    </span>
                  </label>

                  <textarea
                    id={`location-note-${index}`}
                    rows={3}
                    value={slot.location_note}
                    disabled={loading}
                    aria-invalid={Boolean(locationNoteError)}
                    placeholder="Add arrival instructions or location details."
                    onChange={(event) =>
                      updateBookingSlot(
                        index,
                        "location_note",
                        event.target.value,
                      )
                    }
                    className={`w-full resize-none rounded-none bg-white px-3 py-3 ${"text-sm text-gray-950 outline-none transition "}placeholder:text-gray-400 disabled:cursor-not-allowed ${"disabled:bg-gray-100 "}${
                      locationNoteError
                        ? "border border-red-600 " + "focus:border-red-700"
                        : "border border-gray-300 " + "focus:border-gray-950"
                    }`}
                  />

                  {locationNoteError ? (
                    <p className="mt-2 text-xs text-red-600">
                      {locationNoteError}
                    </p>
                  ) : null}
                </div>
              </div>
            </section>
          );
        })}

        <div>
          <button
            type="button"
            onClick={addBookingSlot}
            disabled={loading || bookingSlots.length >= MAX_BOOKING_SLOTS}
            className="w-full border border-dashed border-gray-400 bg-white px-5 py-3 text-sm font-semibold text-gray-950 transition hover:border-gray-950 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {bookingSlots.length >= MAX_BOOKING_SLOTS
              ? "Maximum 5 Event Dates"
              : "+ Add Another Event Date"}
          </button>

          <p className="mt-2 text-xs text-gray-500">
            You may add up to {MAX_BOOKING_SLOTS} event dates in one hire
            request.
          </p>
        </div>

        <div>
          <label
            htmlFor="customer-note"
            className="mb-2 block text-sm font-medium text-gray-950"
          >
            Customer note
            <span className="ml-1 font-normal text-gray-500">Optional</span>
          </label>

          <textarea
            id="customer-note"
            rows={4}
            maxLength={1000}
            value={customerNote}
            disabled={loading}
            aria-invalid={Boolean(customerNoteError)}
            placeholder="Describe your event or any important requirements."
            onChange={(event) => {
              setCustomerNote(event.target.value);
              setSuccessMessage("");
              setFormError("");
              clearCreateError();
            }}
            className={`w-full resize-none rounded-none bg-white px-3 py-3 ${"text-sm text-gray-950 outline-none transition "}placeholder:text-gray-400 disabled:cursor-not-allowed ${"disabled:bg-gray-100 "}${
              customerNoteError
                ? "border border-red-600 " + "focus:border-red-700"
                : "border border-gray-300 " + "focus:border-gray-950"
            }`}
          />

          <div className="mt-1 flex items-start justify-between gap-4">
            <div>
              {customerNoteError ? (
                <p className="text-xs text-red-600">{customerNoteError}</p>
              ) : null}
            </div>

            <p className="shrink-0 text-xs text-gray-500">
              {customerNote.length}/1000
            </p>
          </div>
        </div>

        {formError ? (
          <div
            role="alert"
            className="border-l-2 border-red-600 bg-red-50 px-4 py-3"
          >
            <p className="text-sm text-red-700">{formError}</p>
          </div>
        ) : null}

        {apiError?.message ? (
          <div
            role="alert"
            className="border-l-2 border-red-600 bg-red-50 px-4 py-3"
          >
            <p className="text-sm font-semibold text-red-700">
              The request could not be submitted.
            </p>

            <p className="mt-1 text-sm text-red-700">{apiError.message}</p>
          </div>
        ) : null}

        {successMessage ? (
          <div
            role="status"
            className="border-l-2 border-green-700 bg-green-50 px-4 py-3"
          >
            <p className="text-sm font-medium text-green-800">
              {successMessage}
            </p>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading || !serviceId}
          className="w-full bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {loading ? "Submitting Request..." : "Submit Hire Request"}
        </button>
      </div>
    </form>
  );
};

export default HireRequestForm;
