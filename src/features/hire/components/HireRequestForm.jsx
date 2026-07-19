import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  clearHireError,
  createHire,
  selectCreateHireLoading,
  selectHireError,
} from "@/store/features/hire/hireSlice";

const createEmptySlot = () => ({
  starts_at: "",
  ends_at: "",
  venue_name: "",
  venue_address: "",
  location_note: "",
});

const getMinimumDateTime = () => {
  const now = new Date();

  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

  return now.toISOString().slice(0, 16);
};

const flattenApiErrors = (value, path = "") => {
  if (!value) return [];

  if (typeof value === "string") {
    return [path ? `${path}: ${value}` : value];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      flattenApiErrors(item, path ? `${path} ${index + 1}` : `${index + 1}`),
    );
  }

  if (typeof value === "object") {
    return Object.entries(value).flatMap(([key, item]) => {
      const formattedKey = key.replaceAll("_", " ");
      const nextPath = path ? `${path} ${formattedKey}` : formattedKey;

      return flattenApiErrors(item, nextPath);
    });
  }

  return [String(value)];
};

const HireRequestForm = ({ serviceId, onSuccess }) => {
  const dispatch = useDispatch();

  const loading = useSelector(selectCreateHireLoading);
  const apiError = useSelector(selectHireError);

  const minimumDateTime = useMemo(() => getMinimumDateTime(), []);

  const [customerNote, setCustomerNote] = useState("");
  const [bookingSlots, setBookingSlots] = useState([createEmptySlot()]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const apiErrorMessages = flattenApiErrors(apiError);

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

    if (apiError) {
      dispatch(clearHireError());
    }
  };

  const addBookingSlot = () => {
    setBookingSlots((currentSlots) => [...currentSlots, createEmptySlot()]);

    setFormError("");
    setSuccessMessage("");
  };

  const removeBookingSlot = (index) => {
    if (bookingSlots.length === 1) return;

    setBookingSlots((currentSlots) =>
      currentSlots.filter((_, slotIndex) => slotIndex !== index),
    );

    setFieldErrors({});
    setFormError("");
    setSuccessMessage("");
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

      if (!slot.ends_at) {
        errors[`${fieldPrefix}.ends_at`] = "End date and time are required.";
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

      if (slot.starts_at && slot.ends_at) {
        const startsAt = new Date(slot.starts_at);
        const endsAt = new Date(slot.ends_at);

        if (Number.isNaN(endsAt.getTime())) {
          errors[`${fieldPrefix}.ends_at`] = "Enter a valid end date and time.";
        } else if (endsAt.getTime() <= startsAt.getTime()) {
          errors[`${fieldPrefix}.ends_at`] =
            "End time must be later than start time.";
        }
      }

      const duplicateKey = [
        slot.starts_at,
        slot.ends_at,
        slot.venue_name.trim().toLowerCase(),
        slot.venue_address.trim().toLowerCase(),
      ].join("|");

      if (
        slot.starts_at &&
        slot.ends_at &&
        slot.venue_name.trim() &&
        slot.venue_address.trim()
      ) {
        if (duplicateKeys.has(duplicateKey)) {
          errors[`${fieldPrefix}.starts_at`] =
            "This booking slot is duplicated.";
        }

        duplicateKeys.add(duplicateKey);
      }
    });

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");
    setSuccessMessage("");

    if (!serviceId) {
      setFormError("The selected service is unavailable.");
      return;
    }

    if (bookingSlots.length === 0) {
      setFormError("At least one booking slot is required.");
      return;
    }

    if (!validateForm()) {
      setFormError("Fix the highlighted fields before submitting.");
      return;
    }

    dispatch(clearHireError());

    const payload = {
      service: serviceId,
      customer_note: customerNote.trim(),
      booking_slots: bookingSlots.map((slot) => ({
        starts_at: new Date(slot.starts_at).toISOString(),
        ends_at: new Date(slot.ends_at).toISOString(),
        venue_name: slot.venue_name.trim(),
        venue_address: slot.venue_address.trim(),
        location_note: slot.location_note.trim(),
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
      // The Redux rejected payload is displayed through apiError.
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-8">
        {bookingSlots.map((slot, index) => {
          const fieldPrefix = `booking_slots.${index}`;

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
                    onChange={(event) =>
                      updateBookingSlot(index, "starts_at", event.target.value)
                    }
                    className="h-11 w-full rounded-none border border-gray-300 bg-white px-3 text-sm text-gray-950 outline-none transition focus:border-gray-950 disabled:cursor-not-allowed disabled:bg-gray-100"
                  />

                  {fieldErrors[`${fieldPrefix}.starts_at`] ? (
                    <p className="mt-2 text-xs text-red-600">
                      {fieldErrors[`${fieldPrefix}.starts_at`]}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor={`ends-at-${index}`}
                    className="mb-2 block text-sm font-medium text-gray-950"
                  >
                    End date and time
                  </label>

                  <input
                    id={`ends-at-${index}`}
                    type="datetime-local"
                    min={slot.starts_at || minimumDateTime}
                    value={slot.ends_at}
                    disabled={loading}
                    onChange={(event) =>
                      updateBookingSlot(index, "ends_at", event.target.value)
                    }
                    className="h-11 w-full rounded-none border border-gray-300 bg-white px-3 text-sm text-gray-950 outline-none transition focus:border-gray-950 disabled:cursor-not-allowed disabled:bg-gray-100"
                  />

                  {fieldErrors[`${fieldPrefix}.ends_at`] ? (
                    <p className="mt-2 text-xs text-red-600">
                      {fieldErrors[`${fieldPrefix}.ends_at`]}
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
                    placeholder="Royal Convention Hall"
                    onChange={(event) =>
                      updateBookingSlot(index, "venue_name", event.target.value)
                    }
                    className="h-11 w-full rounded-none border border-gray-300 bg-white px-3 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-gray-950 disabled:cursor-not-allowed disabled:bg-gray-100"
                  />

                  {fieldErrors[`${fieldPrefix}.venue_name`] ? (
                    <p className="mt-2 text-xs text-red-600">
                      {fieldErrors[`${fieldPrefix}.venue_name`]}
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
                    placeholder="Narayanganj, Bangladesh"
                    onChange={(event) =>
                      updateBookingSlot(
                        index,
                        "venue_address",
                        event.target.value,
                      )
                    }
                    className="h-11 w-full rounded-none border border-gray-300 bg-white px-3 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-gray-950 disabled:cursor-not-allowed disabled:bg-gray-100"
                  />

                  {fieldErrors[`${fieldPrefix}.venue_address`] ? (
                    <p className="mt-2 text-xs text-red-600">
                      {fieldErrors[`${fieldPrefix}.venue_address`]}
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
                    placeholder="Add arrival instructions or location details."
                    onChange={(event) =>
                      updateBookingSlot(
                        index,
                        "location_note",
                        event.target.value,
                      )
                    }
                    className="w-full resize-none rounded-none border border-gray-300 bg-white px-3 py-3 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-gray-950 disabled:cursor-not-allowed disabled:bg-gray-100"
                  />
                </div>
              </div>
            </section>
          );
        })}

        <button
          type="button"
          onClick={addBookingSlot}
          disabled={loading}
          className="w-full border border-dashed border-gray-400 bg-white px-5 py-3 text-sm font-semibold text-gray-950 transition hover:border-gray-950 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Add Another Event Date
        </button>

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
            value={customerNote}
            disabled={loading}
            placeholder="Describe your event or any important requirements."
            onChange={(event) => {
              setCustomerNote(event.target.value);
              setSuccessMessage("");

              if (apiError) {
                dispatch(clearHireError());
              }
            }}
            className="w-full resize-none rounded-none border border-gray-300 bg-white px-3 py-3 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-gray-950 disabled:cursor-not-allowed disabled:bg-gray-100"
          />
        </div>

        {formError ? (
          <div className="border-l-2 border-red-600 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">{formError}</p>
          </div>
        ) : null}

        {apiErrorMessages.length > 0 ? (
          <div className="border-l-2 border-red-600 bg-red-50 px-4 py-3">
            <p className="text-sm font-semibold text-red-700">
              The request could not be submitted.
            </p>

            <div className="mt-2 space-y-1">
              {apiErrorMessages.map((message, index) => (
                <p key={`${message}-${index}`} className="text-sm text-red-700">
                  {message}
                </p>
              ))}
            </div>
          </div>
        ) : null}

        {successMessage ? (
          <div className="border-l-2 border-green-700 bg-green-50 px-4 py-3">
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
