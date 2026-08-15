import { EVENT_TYPE_OPTIONS, getEventTypeLabel } from "../utils/hireFormUtils";

const HireBookingSlotFields = ({
  item,
  itemIndex,
  minimumDateTime,
  loading = false,
  fieldErrors = {},
  onEventTypeChange,
  onBookingFieldChange,
}) => {
  return (
    <div className="space-y-6 p-5">
      {item.bookingSlots.map((slot, slotIndex) => {
        const eventType = item.eventTypes?.[slotIndex] || "";

        const eventTypeError =
          fieldErrors[`booking_items.${itemIndex}.event_types.${slotIndex}`];

        const startsAtError =
          fieldErrors[
            `booking_items.${itemIndex}.booking_slots.${slotIndex}.starts_at`
          ];

        const venueNameError =
          fieldErrors[
            `booking_items.${itemIndex}.booking_slots.${slotIndex}.venue_name`
          ];

        const venueAddressError =
          fieldErrors[
            `booking_items.${itemIndex}.booking_slots.${slotIndex}.venue_address`
          ];

        const googleMapError =
          fieldErrors[
            `booking_items.${itemIndex}.booking_slots.${slotIndex}.google_map_link`
          ];

        // Only the first slot of the whole Hire is required.
        const isFirstBooking = itemIndex === 0 && slotIndex === 0;

        const eventLabel = getEventTypeLabel(eventType);

        return (
          <div
            key={`${item.key}-slot-${slotIndex}`}
            className="border border-gray-200 p-4"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-gray-950">
                  Event {slotIndex + 1}
                </p>

                {eventLabel && (
                  <p className="mt-1 text-xs font-medium text-green-700">
                    {eventLabel}
                  </p>
                )}
              </div>

              {isFirstBooking && (
                <span className="text-[10px] font-semibold uppercase tracking-wide text-[#a2101b]">
                  Booking details required
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Event Type */}
              <div>
                <label
                  htmlFor={`event-${itemIndex}-${slotIndex}`}
                  className="mb-2 block text-xs font-semibold text-gray-700"
                >
                  Event Type
                </label>

                <select
                  id={`event-${itemIndex}-${slotIndex}`}
                  value={eventType}
                  disabled={loading}
                  onChange={(event) =>
                    onEventTypeChange(itemIndex, slotIndex, event.target.value)
                  }
                  className={`h-11 w-full rounded-none px-3 text-sm outline-none ${
                    eventTypeError
                      ? "border border-red-600 bg-white"
                      : eventType
                        ? "border border-green-700 bg-green-50 text-green-900"
                        : "border border-gray-300 bg-white text-gray-700"
                  }`}
                >
                  <option value="">Select event type</option>

                  {EVENT_TYPE_OPTIONS.map((option) => {
                    const usedInSameItem = item.eventTypes.some(
                      (selectedValue, selectedIndex) =>
                        selectedIndex !== slotIndex &&
                        selectedValue === option.value,
                    );

                    return (
                      <option
                        key={option.value}
                        value={option.value}
                        disabled={usedInSameItem}
                      >
                        {option.label}
                      </option>
                    );
                  })}
                </select>

                {eventTypeError && (
                  <p className="mt-1 text-xs text-red-600">{eventTypeError}</p>
                )}
              </div>

              {/* Start Date */}
              <div>
                <label
                  htmlFor={`date-${itemIndex}-${slotIndex}`}
                  className="mb-2 block text-xs font-semibold text-gray-700"
                >
                  Start Date & Time
                </label>

                <input
                  id={`date-${itemIndex}-${slotIndex}`}
                  type="datetime-local"
                  min={minimumDateTime}
                  value={slot.starts_at}
                  disabled={loading}
                  onChange={(event) =>
                    onBookingFieldChange(
                      itemIndex,
                      slotIndex,
                      "starts_at",
                      event.target.value,
                    )
                  }
                  className={`h-11 w-full rounded-none px-3 text-sm outline-none ${
                    startsAtError
                      ? "border border-red-600"
                      : slot.starts_at
                        ? "border border-green-700 bg-green-50"
                        : "border border-gray-300"
                  }`}
                />

                {startsAtError && (
                  <p className="mt-1 text-xs text-red-600">{startsAtError}</p>
                )}
              </div>

              {/* Venue Name */}
              <div>
                <label
                  htmlFor={`venue-name-${itemIndex}-${slotIndex}`}
                  className="mb-2 block text-xs font-semibold text-gray-700"
                >
                  Venue Name
                </label>

                <input
                  id={`venue-name-${itemIndex}-${slotIndex}`}
                  type="text"
                  value={slot.venue_name}
                  disabled={loading}
                  onChange={(event) =>
                    onBookingFieldChange(
                      itemIndex,
                      slotIndex,
                      "venue_name",
                      event.target.value,
                    )
                  }
                  className={`h-11 w-full rounded-none px-3 text-sm outline-none ${
                    venueNameError
                      ? "border border-red-600"
                      : slot.venue_name
                        ? "border border-green-700 bg-green-50"
                        : "border border-gray-300"
                  }`}
                />

                {venueNameError && (
                  <p className="mt-1 text-xs text-red-600">{venueNameError}</p>
                )}
              </div>

              {/* Venue Address */}
              <div>
                <label
                  htmlFor={`venue-address-${itemIndex}-${slotIndex}`}
                  className="mb-2 block text-xs font-semibold text-gray-700"
                >
                  Venue Address
                </label>

                <input
                  id={`venue-address-${itemIndex}-${slotIndex}`}
                  type="text"
                  value={slot.venue_address}
                  disabled={loading}
                  onChange={(event) =>
                    onBookingFieldChange(
                      itemIndex,
                      slotIndex,
                      "venue_address",
                      event.target.value,
                    )
                  }
                  className={`h-11 w-full rounded-none px-3 text-sm outline-none ${
                    venueAddressError
                      ? "border border-red-600"
                      : slot.venue_address
                        ? "border border-green-700 bg-green-50"
                        : "border border-gray-300"
                  }`}
                />

                {venueAddressError && (
                  <p className="mt-1 text-xs text-red-600">
                    {venueAddressError}
                  </p>
                )}
              </div>

              {/* Google Map */}
              <div className="sm:col-span-2">
                <label
                  htmlFor={`map-${itemIndex}-${slotIndex}`}
                  className="mb-2 block text-xs font-semibold text-gray-700"
                >
                  Google Maps Link
                </label>

                <input
                  id={`map-${itemIndex}-${slotIndex}`}
                  type="url"
                  value={slot.google_map_link}
                  disabled={loading}
                  placeholder="https://maps.app.goo.gl/example"
                  onChange={(event) =>
                    onBookingFieldChange(
                      itemIndex,
                      slotIndex,
                      "google_map_link",
                      event.target.value,
                    )
                  }
                  className={`h-11 w-full rounded-none px-3 text-sm outline-none ${
                    googleMapError
                      ? "border border-red-600"
                      : slot.google_map_link
                        ? "border border-green-700 bg-green-50"
                        : "border border-gray-300"
                  }`}
                />

                {googleMapError && (
                  <p className="mt-1 text-xs text-red-600">{googleMapError}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HireBookingSlotFields;
