import { CalendarDays } from "lucide-react";

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

  return (
    <div>
      <div className="flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-[#b60018]" />

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
            className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-3"
          >
            <div>
              <p className="text-sm font-semibold text-gray-950">
                {slot.booking_title ||
                  slot.title ||
                  slot.event_type ||
                  "Booking Event"}
              </p>

              <p className="text-xs text-gray-600">
                {slot.date || slot.starts_at || "Date not available"}
              </p>

              {slot.unit_price ? (
                <p className="mt-1 text-xs font-medium text-[#b60018]">
                  {formatMoney(slot.unit_price)} per shift
                </p>
              ) : null}
            </div>

            <div>
              <input
                type="number"
                min="1"
                step="1"
                value={slotShifts[slot.id || slot.booking_slot_id] ?? ""}
                onChange={(event) =>
                  onChange(slot.id || slot.booking_slot_id, event.target.value)
                }
                disabled={loading}
                className="h-10 w-32 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-[#b60018] focus:ring-2 focus:ring-red-100"
              />

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
