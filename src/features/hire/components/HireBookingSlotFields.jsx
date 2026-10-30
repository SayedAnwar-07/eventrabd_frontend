import { useState } from "react";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { EVENT_TYPE_OPTIONS, getEventTypeLabel } from "../utils/hireFormUtils";

const TIME_OPTIONS = Array.from({ length: 96 }, (_, index) => {
  const hour24 = Math.floor(index / 4);
  const minute = (index % 4) * 15;
  const hour12 = hour24 % 12 || 12;
  const period = hour24 >= 12 ? "PM" : "AM";

  const value = `${String(hour24).padStart(2, "0")}:${String(minute).padStart(
    2,
    "0",
  )}`;

  const label = `${String(hour12).padStart(2, "0")}:${String(minute).padStart(
    2,
    "0",
  )} ${period}`;

  return { value, label };
});

const HireBookingSlotFields = ({
  item,
  itemIndex,
  minimumDateTime,
  loading = false,
  fieldErrors = {},
  onEventTypeChange,
  onBookingFieldChange,
}) => {
  const [calendarOpen, setCalendarOpen] = useState({});
  const [calendarMonths, setCalendarMonths] = useState({});

  const fieldTriggerClass =
    "flex! h-11! min-h-11! w-full! min-w-0! items-center justify-between gap-2 rounded-md! border! border-[#E5DDD5]! bg-gray-50! px-3! py-0! text-left text-sm font-normal text-[#3D3530] shadow-none! outline-none transition-colors hover:border-[#CFC2B6]! focus-visible:border-[#A68C78]! focus-visible:ring-2! focus-visible:ring-[#A68C78]/20! disabled:cursor-not-allowed disabled:bg-[#F8F5F2]! disabled:opacity-70 data-[placeholder]:text-[#A69B91]";

  const inputClass =
    "h-11 w-full rounded-md border border-[#E5DDD5] bg-gray-50 px-3 text-sm text-[#3D3530] shadow-none outline-none transition-colors placeholder:text-[#A69B91] focus-visible:border-[#A68C78] focus-visible:ring-2 focus-visible:ring-[#A68C78]/20 disabled:cursor-not-allowed disabled:bg-[#F8F5F2] disabled:opacity-70";

  const labelClass = "mb-1.5 block text-xs font-medium text-[#51463E]";

  const optionalClass = "ml-1 text-[11px] font-normal text-[#9B9087]";

  const getDatePart = (value) => value?.split("T")[0] || "";

  const getTimePart = (value) => value?.split("T")[1]?.slice(0, 5) || "";

  const toLocalDate = (value) => {
    if (!value) return undefined;

    const [year, month, day] = value.split("-").map(Number);

    if (!year || !month || !day) return undefined;

    return new Date(year, month - 1, day);
  };

  const formatDateValue = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const formatDate = (dateString) => {
    const date = toLocalDate(dateString);

    if (!date) return "Choose a date";

    return new Intl.DateTimeFormat("en", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const minimumDateString = getDatePart(minimumDateTime);
  const minimumDate = toLocalDate(minimumDateString);
  const minimumTime = getTimePart(minimumDateTime);

  const renderError = (error) =>
    error ? (
      <p role="alert" className="mt-1.5 text-xs leading-relaxed text-red-600">
        {error}
      </p>
    ) : null;

  const renderFieldStatus = (required) =>
    required ? (
      <span className="ml-1 text-red-600" aria-label="required">
        *
      </span>
    ) : (
      <span className={optionalClass}>(Optional)</span>
    );

  return (
    <div className="space-y-5">
      {item.bookingSlots.map((slot, slotIndex) => {
        const eventType = item.eventTypes?.[slotIndex] || "";

        const errorPrefix = `booking_items.${itemIndex}.booking_slots.${slotIndex}`;

        const eventTypeError =
          fieldErrors[`booking_items.${itemIndex}.event_types.${slotIndex}`];

        const startsAtError = fieldErrors[`${errorPrefix}.starts_at`];

        const venueNameError = fieldErrors[`${errorPrefix}.venue_name`];

        const venueAddressError = fieldErrors[`${errorPrefix}.venue_address`];

        const googleMapError = fieldErrors[`${errorPrefix}.google_map_link`];

        const isFirstBooking = itemIndex === 0 && slotIndex === 0;

        const eventLabel = getEventTypeLabel(eventType);

        const datePickerKey = `${itemIndex}-${slotIndex}`;

        const datePart = getDatePart(slot.starts_at);
        const timePart = getTimePart(slot.starts_at);

        const selectedDate = toLocalDate(datePart);

        // Keep the shared starts_at error beneath the
        // field the user needs to complete.
        const dateError = !datePart ? startsAtError : null;
        const timeError = datePart ? startsAtError : null;

        const dateIsBeforeMinimum = (date) => {
          if (!minimumDate) return false;

          return (
            date <
            new Date(
              minimumDate.getFullYear(),
              minimumDate.getMonth(),
              minimumDate.getDate(),
            )
          );
        };

        const updateDate = (date) => {
          if (!date || loading || dateIsBeforeMinimum(date)) {
            return;
          }

          const nextDate = formatDateValue(date);
          let nextTime = timePart || "09:00";

          if (
            nextDate === minimumDateString &&
            minimumTime &&
            nextTime < minimumTime
          ) {
            nextTime = minimumTime;
          }

          onBookingFieldChange(
            itemIndex,
            slotIndex,
            "starts_at",
            `${nextDate}T${nextTime}`,
          );

          setCalendarMonths((previous) => ({
            ...previous,
            [datePickerKey]: date,
          }));

          setCalendarOpen((previous) => ({
            ...previous,
            [datePickerKey]: false,
          }));
        };

        const updateSelectedTime = (value) => {
          if (!datePart || loading) return;

          let nextTime = value;

          if (
            datePart === minimumDateString &&
            minimumTime &&
            nextTime < minimumTime
          ) {
            nextTime = minimumTime;
          }

          onBookingFieldChange(
            itemIndex,
            slotIndex,
            "starts_at",
            `${datePart}T${nextTime}`,
          );
        };

        return (
          <section
            key={`${item.key}-slot-${slotIndex}`}
            className="overflow-visible rounded-md border border-[#E5DDD5] bg-white shadow-[0_1px_2px_rgba(61,53,48,0.04),0_8px_24px_-12px_rgba(61,53,48,0.14)]"
          >
            {/* Card header */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-t-md border-b border-[#F0EAE4] bg-[#FFFCF9] px-4 py-3.5 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sm font-semibold ${
                    isFirstBooking
                      ? "bg-[#3D3530] text-white"
                      : "bg-[#A68C78] text-[#2B2420]"
                  }`}
                >
                  {slotIndex + 1}
                </span>

                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-[#3D3530]">
                    Event {slotIndex + 1}
                  </h3>

                  <p className="mt-0.5 truncate text-xs text-[#756A62]">
                    {eventLabel || "Not selected yet"}
                  </p>
                </div>
              </div>

              {isFirstBooking && (
                <span className="rounded-md bg-[#F3ECE5] px-2.5 py-1 text-[11px] font-semibold text-[#51463E]">
                  Required
                </span>
              )}
            </div>

            <div className="space-y-7 p-4 sm:p-6">
              {/* Event details */}
              <div>
                <p className="mb-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#756A62]">
                  Event details
                </p>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {/* EVENT TYPE */}
                  <div className="w-full min-w-0">
                    <label
                      htmlFor={`event-${itemIndex}-${slotIndex}`}
                      className={labelClass}
                    >
                      Event Type
                      <span className="ml-1 text-red-600">*</span>
                    </label>

                    <Select
                      value={eventType}
                      disabled={loading}
                      className=""
                      onValueChange={(value) =>
                        onEventTypeChange(itemIndex, slotIndex, value)
                      }
                    >
                      <SelectTrigger
                        id={`event-${itemIndex}-${slotIndex}`}
                        aria-invalid={Boolean(eventTypeError)}
                        className={`${fieldTriggerClass} ${
                          eventTypeError ? "border-red-500!" : ""
                        }`}
                      >
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>

                      <SelectContent className="z-100">
                        {EVENT_TYPE_OPTIONS.map((option) => {
                          const usedInSameItem =
                            item.eventTypes?.some(
                              (selectedValue, selectedIndex) =>
                                selectedIndex !== slotIndex &&
                                selectedValue === option.value,
                            ) || false;

                          return (
                            <SelectItem
                              key={option.value}
                              value={option.value}
                              disabled={usedInSameItem}
                            >
                              {option.label}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>

                    {renderError(eventTypeError)}
                  </div>

                  {/* EVENT DATE */}
                  <div className="w-full min-w-0">
                    <label className={labelClass}>
                      Event Date
                      {renderFieldStatus(isFirstBooking)}
                    </label>

                    <Popover
                      open={Boolean(calendarOpen[datePickerKey])}
                      onOpenChange={(open) =>
                        setCalendarOpen((previous) => ({
                          ...previous,
                          [datePickerKey]: open,
                        }))
                      }
                    >
                      <PopoverTrigger
                        disabled={loading}
                        aria-label="Choose event date"
                        aria-invalid={Boolean(dateError)}
                        className={`${fieldTriggerClass} ${
                          dateError ? "border-red-500!" : ""
                        }`}
                      >
                        <span
                          className={`min-w-0 truncate text-sm ${
                            datePart ? "text-[#3D3530]" : "text-[#A69B91]"
                          }`}
                        >
                          {formatDate(datePart)}
                        </span>

                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="shrink-0 text-[#756A62]"
                          aria-hidden="true"
                        >
                          <rect x="3" y="4" width="18" height="18" rx="2" />
                          <path d="M16 2v4M8 2v4M3 10h18" />
                        </svg>
                      </PopoverTrigger>

                      <PopoverContent
                        align="start"
                        side="bottom"
                        sideOffset={4}
                        className="z-100 w-auto rounded-md border border-[#E5DDD5] bg-white p-2 shadow-lg"
                      >
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          month={
                            calendarMonths[datePickerKey] ||
                            selectedDate ||
                            minimumDate ||
                            new Date()
                          }
                          onMonthChange={(month) =>
                            setCalendarMonths((previous) => ({
                              ...previous,
                              [datePickerKey]: month,
                            }))
                          }
                          onSelect={updateDate}
                          disabled={dateIsBeforeMinimum}
                          showOutsideDays
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>

                    {renderError(dateError)}
                  </div>

                  {/* EVENT TIME */}
                  <div className="w-full min-w-0">
                    <label className={labelClass}>
                      Event Time
                      {renderFieldStatus(isFirstBooking)}
                    </label>

                    <Select
                      value={timePart}
                      disabled={loading || !datePart}
                      onValueChange={updateSelectedTime}
                    >
                      <SelectTrigger
                        aria-label="Event time"
                        aria-invalid={Boolean(timeError)}
                        className={`${fieldTriggerClass} ${
                          timeError ? "border-red-500!" : ""
                        }`}
                      >
                        <SelectValue placeholder="Choose a time" />
                      </SelectTrigger>

                      <SelectContent
                        position="popper"
                        side="bottom"
                        align="start"
                        className="z-100 max-h-60 w-[--radix-select-trigger-width] rounded-md border border-[#E5DDD5] bg-white"
                      >
                        {TIME_OPTIONS.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            disabled={
                              datePart === minimumDateString &&
                              Boolean(minimumTime) &&
                              option.value < minimumTime
                            }
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {!datePart && (
                      <p className="mt-1.5 text-xs text-[#756A62]">
                        Choose an event date first.
                      </p>
                    )}

                    {renderError(timeError)}
                  </div>
                </div>
              </div>

              {/* Venue details */}
              <div className="border-t border-[#F0EAE4] pt-6">
                <p className="mb-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#756A62]">
                  Venue details
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Venue name */}
                  <div className="min-w-0">
                    <label
                      htmlFor={`venue-name-${itemIndex}-${slotIndex}`}
                      className={labelClass}
                    >
                      Venue Name
                      {renderFieldStatus(isFirstBooking)}
                    </label>

                    <input
                      id={`venue-name-${itemIndex}-${slotIndex}`}
                      type="text"
                      value={slot.venue_name ?? ""}
                      disabled={loading}
                      placeholder="Enter venue name"
                      aria-required={isFirstBooking}
                      aria-invalid={Boolean(venueNameError)}
                      onChange={(event) =>
                        onBookingFieldChange(
                          itemIndex,
                          slotIndex,
                          "venue_name",
                          event.target.value,
                        )
                      }
                      className={`${inputClass} ${
                        venueNameError ? "border-red-500!" : ""
                      }`}
                    />

                    {renderError(venueNameError)}
                  </div>

                  {/* Venue address */}
                  <div className="min-w-0">
                    <label
                      htmlFor={`venue-address-${itemIndex}-${slotIndex}`}
                      className={labelClass}
                    >
                      Venue Address
                      {renderFieldStatus(isFirstBooking)}
                    </label>

                    <input
                      id={`venue-address-${itemIndex}-${slotIndex}`}
                      type="text"
                      value={slot.venue_address ?? ""}
                      disabled={loading}
                      placeholder="Street, area, city"
                      aria-required={isFirstBooking}
                      aria-invalid={Boolean(venueAddressError)}
                      onChange={(event) =>
                        onBookingFieldChange(
                          itemIndex,
                          slotIndex,
                          "venue_address",
                          event.target.value,
                        )
                      }
                      className={`${inputClass} ${
                        venueAddressError ? "border-red-500!" : ""
                      }`}
                    />

                    {renderError(venueAddressError)}
                  </div>
                </div>

                {/* Google Maps link */}
                <div className="mt-3">
                  <label
                    htmlFor={`map-${itemIndex}-${slotIndex}`}
                    className={labelClass}
                  >
                    Google Maps Link
                    <span className={optionalClass}>(Optional)</span>
                  </label>

                  <input
                    id={`map-${itemIndex}-${slotIndex}`}
                    type="url"
                    value={slot.google_map_link ?? ""}
                    disabled={loading}
                    placeholder="https://maps.app.goo.gl/example"
                    aria-invalid={Boolean(googleMapError)}
                    onChange={(event) =>
                      onBookingFieldChange(
                        itemIndex,
                        slotIndex,
                        "google_map_link",
                        event.target.value,
                      )
                    }
                    className={`${inputClass} ${
                      googleMapError ? "border-red-500!" : ""
                    }`}
                  />

                  {renderError(googleMapError)}
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default HireBookingSlotFields;
