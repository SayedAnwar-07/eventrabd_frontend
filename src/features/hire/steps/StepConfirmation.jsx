import {
  CalendarDays,
  CheckCircle2,
  MapPin,
  Package,
  Phone,
  StickyNote,
} from "lucide-react";

import { formatPrice } from "../utils/hireFormUtils";

const StepConfirmation = ({
  bookingItems = [],
  getBookingItemInfo,
  grandTotal = null,
  customerWhatsappNumber = "",
  customerNote = "",
  onConfirm,
  loading = false,
}) => {
  return (
    <section className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
          Final Step
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-gray-950">
          Review & Confirm
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Check your booking information before confirming.
        </p>
      </div>

      {/* Booking selection */}
      <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-700">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <h3 className="font-semibold text-gray-950">Booking Selection</h3>
            <p className="text-sm text-gray-500">
              Review your selected service or packages.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {bookingItems.map((item, itemIndex) => {
            const { title, unitPrice } = getBookingItemInfo(item);
            const quantity = Number(item.quantity || 1);
            const lineTotal = Number.isFinite(unitPrice)
              ? unitPrice * quantity
              : null;

            return (
              <div
                key={item.key}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Booking {itemIndex + 1}
                    </p>

                    <h4 className="mt-1 font-semibold text-gray-950">
                      {title}
                    </h4>

                    <p className="mt-1 text-sm text-gray-600">
                      Quantity:{" "}
                      <span className="font-medium text-gray-900">
                        {quantity}
                      </span>
                    </p>

                    {item.packageId && (
                      <div className="mt-2 flex items-center gap-2 text-sm font-medium text-green-700">
                        <Package size={15} />
                        Package Booking
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="font-semibold text-green-700">
                      {lineTotal !== null
                        ? formatPrice(lineTotal)
                        : "Unavailable"}
                    </p>

                    {quantity > 1 && Number.isFinite(unitPrice) && (
                      <p className="mt-1 text-xs text-gray-500">
                        {formatPrice(unitPrice)} each
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event information */}
      <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5">
        <div>
          <h3 className="font-semibold text-gray-950">Event Information</h3>
          <p className="mt-1 text-sm text-gray-500">
            Review event, schedule and venue information.
          </p>
        </div>

        <div className="space-y-3">
          {bookingItems.map((item, itemIndex) => {
            const { title } = getBookingItemInfo(item);

            return item.bookingSlots.map((slot, slotIndex) => {
              const eventType = item.eventTypes?.[slotIndex];

              return (
                <div
                  key={`${item.key}-${slotIndex}`}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        {bookingItems.length > 1
                          ? `Booking ${itemIndex + 1} · Event ${slotIndex + 1}`
                          : `Event ${slotIndex + 1}`}
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {eventType || "Event type not selected"}
                      </p>
                    </div>

                    {bookingItems.length > 1 && (
                      <span className="max-w-[45%] truncate text-xs font-medium text-green-700">
                        {title}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2.5 text-sm text-gray-700">
                      <CalendarDays
                        size={16}
                        className="mt-0.5 shrink-0 text-gray-400"
                      />
                      <span>
                        {slot.starts_at
                          ? new Date(slot.starts_at).toLocaleString()
                          : "Date and time not selected"}
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5 text-sm text-gray-700">
                      <MapPin
                        size={16}
                        className="mt-0.5 shrink-0 text-gray-400"
                      />
                      <div className="min-w-0">
                        <p>{slot.venue_name || "Venue not provided"}</p>

                        {slot.venue_address && (
                          <p className="mt-1 text-gray-500">
                            {slot.venue_address}
                          </p>
                        )}
                      </div>
                    </div>

                    {slot.google_map_link && (
                      <a
                        href={slot.google_map_link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex text-sm font-medium text-green-700 transition hover:text-green-800"
                      >
                        View on Google Maps
                      </a>
                    )}
                  </div>
                </div>
              );
            });
          })}
        </div>
      </div>

      {/* Contact information */}
      <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5">
        <div>
          <h3 className="font-semibold text-gray-950">Contact Information</h3>
          <p className="mt-1 text-sm text-gray-500">
            Contact details for this hire request.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-green-700">
            <Phone size={17} />
          </div>

          <div>
            <p className="text-xs text-gray-500">WhatsApp Number</p>
            <p className="mt-0.5 text-sm font-medium text-gray-900">
              +88{customerWhatsappNumber}
            </p>
          </div>
        </div>

        {customerNote && (
          <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-gray-600">
              <StickyNote size={17} />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-gray-500">Customer Note</p>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
                {customerNote}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-green-200 bg-green-50 p-5">
        <div>
          <p className="font-semibold text-green-950">Total Amount</p>
          <p className="mt-1 text-xs text-green-700">Final booking total</p>
        </div>

        <p className="text-2xl font-bold text-green-800">
          {grandTotal !== null ? formatPrice(grandTotal) : "Unavailable"}
        </p>
      </div>

      {/* Confirm */}
      <button
        type="button"
        disabled={loading}
        onClick={onConfirm}
        className="w-full rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {loading ? "Submitting..." : "Confirm Hire"}
      </button>
    </section>
  );
};

export default StepConfirmation;
