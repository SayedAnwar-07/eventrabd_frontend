import { CheckCircle2, Package, CalendarDays, Phone } from "lucide-react";

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

      <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="text-green-700" size={22} />
          <h3 className="font-semibold text-gray-950">Booking Selection</h3>
        </div>

        <div className="space-y-3">
          {bookingItems.map((item, index) => {
            const { title, unitPrice } = getBookingItemInfo(item);

            return (
              <div
                key={item.key}
                className="rounded-xl border border-gray-200 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Booking {index + 1}
                    </p>
                    <h4 className="mt-1 font-semibold text-gray-950">
                      {title}
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">
                      Quantity: {item.quantity}
                    </p>
                  </div>

                  <p className="font-semibold text-green-700">
                    {formatPrice(unitPrice)}
                  </p>
                </div>

                {item.packageId && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                    <Package size={16} />
                    Package Selected
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
        <h3 className="font-semibold text-gray-950">Event Information</h3>

        {bookingItems.map((item) =>
          item.bookingSlots.map((slot, index) => (
            <div key={index} className="rounded-xl bg-gray-50 p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CalendarDays size={16} />
                {slot.starts_at
                  ? new Date(slot.starts_at).toLocaleString()
                  : "Date not selected"}
              </div>

              <p className="text-sm text-gray-600">
                Venue: {slot.venue_name || "Not provided"}
              </p>

              <p className="text-sm text-gray-600">
                Address: {slot.venue_address || "Not provided"}
              </p>
            </div>
          )),
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3">
        <h3 className="font-semibold text-gray-950">Contact Information</h3>

        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Phone size={16} />
          +88{customerWhatsappNumber}
        </div>

        {customerNote && (
          <p className="rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
            {customerNote}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-green-200 bg-green-50 p-5">
        <p className="font-semibold text-green-900">Total Amount</p>

        <p className="text-2xl font-bold text-green-800">
          {grandTotal !== null ? formatPrice(grandTotal) : "Unavailable"}
        </p>
      </div>

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
