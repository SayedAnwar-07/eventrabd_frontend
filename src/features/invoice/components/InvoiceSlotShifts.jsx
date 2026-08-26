import { CalendarDays, Minus, Plus } from "lucide-react";

import { formatMoney } from "../utils/currency";

const InvoiceSlotShifts = ({
  bookingRows = [],
  slotShifts = {},
  errors = {},
  loading,
  onChange,
}) => {
  if (!bookingRows.length) {
    return null;
  }
  const formatDate = (dateValue) => {
    if (!dateValue) return "Date not available";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Date not available";
    }

    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const EVENT_TYPE_LABELS = {
    holud: "Holud",
    mehedi: "Mehedi",
    akhd_walima: "Akhd/Walima",
    wedding_ceremony: "Wedding Ceremony",
    reception: "Reception",
    anniversary: "Anniversary",
    birthday: "Birthday",
    others: "Others",
  };

  const formatEventType = (eventType) =>
    EVENT_TYPE_LABELS[eventType] || eventType || "";

  return (
    <div>
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-gray-800">
          Shift Count per Booked Event
        </h3>
      </div>

      <p className="mt-1 text-xs text-gray-500">
        Set the shift count for every Hire booking slot. Final pricing will be
        calculated by the backend.
      </p>

      {errors?.slot_shifts_general ? (
        <p className="mt-2 text-sm text-red-600">
          {errors.slot_shifts_general}
        </p>
      ) : null}

      <div className="mt-4 space-y-3">
        {bookingRows.map((slot) => (
          <div
            key={slot.id || slot.booking_slot_id}
            className="flex flex-col gap-3 rounded-md border border-gray-200 bg-white p-3 lg:flex-row lg:items-center lg:justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-gray-950">
                {slot.booking_title ||
                  slot.title ||
                  formatEventType(slot.event_type) ||
                  "Booking Event"}
              </p>

              <p className="text-xs text-gray-600">
                {slot.booking_title && slot.event_type ? (
                  <span>{formatEventType(slot.event_type)} • </span>
                ) : null}

                {formatDate(slot.date || slot.starts_at)}
              </p>

              {slot.unit_price ? (
                <p className="mt-1 text-xs font-medium text-[#b60018]">
                  {formatMoney(slot.unit_price)} per shift
                </p>
              ) : null}
            </div>

            <div>
              <div className="flex h-10 w-full items-center overflow-hidden rounded-md border border-gray-300 bg-white lg:w-36">
                {/* Minus */}
                <button
                  type="button"
                  disabled={
                    loading ||
                    Number(slotShifts[slot.id || slot.booking_slot_id] || 1) <=
                      1
                  }
                  onClick={() => {
                    const slotId = slot.id || slot.booking_slot_id;
                    const currentValue = Number(slotShifts[slotId] || 1);

                    onChange(slotId, String(Math.max(1, currentValue - 1)));
                  }}
                  className="flex h-full flex-1 items-center justify-center text-gray-500 transition hover:bg-gray-50 hover:text-[#b60018] disabled:cursor-not-allowed disabled:text-gray-300"
                >
                  <Minus className="h-4 w-4" />
                </button>

                {/* Value */}
                <div className="flex h-full min-w-14 items-center justify-center border-x border-gray-200 px-4 text-sm font-semibold text-gray-950">
                  {slotShifts[slot.id || slot.booking_slot_id] || 1}
                </div>

                {/* Plus */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    const slotId = slot.id || slot.booking_slot_id;
                    const currentValue = Number(slotShifts[slotId] || 1);

                    onChange(slotId, String(currentValue + 1));
                  }}
                  className="flex h-full flex-1 items-center justify-center text-gray-500 transition hover:bg-red-50 hover:text-[#b60018] disabled:cursor-not-allowed disabled:text-gray-300"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {errors?.[slot.id || slot.booking_slot_id] ? (
                <p className="mt-1 text-xs text-red-600">
                  {errors[slot.id || slot.booking_slot_id]}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvoiceSlotShifts;
