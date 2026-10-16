import HireBookingItemCard from "../components/HireBookingItemCard";

const StepBookingDetails = ({
  bookingItems = [],
  minimumDateTime,
  loading = false,
  fieldErrors = {},
  onIncreaseQuantity,
  onDecreaseQuantity,
  onEventTypeChange,
  onBookingFieldChange,
  getBookingItemInfo,
  customerWhatsappNumber,
  customerNote,
  onWhatsappChange,
  onNoteChange,
}) => {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
          Booking Details
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-gray-950">
          Provide Event Information
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Add event type, date, venue and contact details.
        </p>
      </div>

      <div className="space-y-5">
        {bookingItems.map((item, itemIndex) => {
          const { title, unitPrice } = getBookingItemInfo(item);

          return (
            <HireBookingItemCard
              key={item.key}
              item={item}
              itemIndex={itemIndex}
              bookingItemsCount={bookingItems.length}
              minimumDateTime={minimumDateTime}
              loading={loading}
              fieldErrors={fieldErrors}
              title={title}
              unitPrice={unitPrice}
              onIncreaseQuantity={onIncreaseQuantity}
              onDecreaseQuantity={onDecreaseQuantity}
              onEventTypeChange={onEventTypeChange}
              onBookingFieldChange={onBookingFieldChange}
            />
          );
        })}
      </div>

      <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5">
        <div>
          <label
            htmlFor="customer-whatsapp"
            className="mb-2 block text-sm font-medium text-gray-950"
          >
            WhatsApp Number
          </label>
          <input
            id="customer-whatsapp"
            type="tel"
            value={customerWhatsappNumber}
            disabled={loading}
            onChange={(e) => onWhatsappChange(e.target.value)}
            placeholder="01XXXXXXXXX"
            className="h-12 w-full rounded-xl border border-gray-300 px-4 text-sm outline-none transition focus:border-green-700"
          />
        </div>

        <div>
          <label
            htmlFor="customer-note"
            className="mb-2 block text-sm font-medium text-gray-950"
          >
            Customer Note
          </label>
          <textarea
            id="customer-note"
            rows={4}
            value={customerNote}
            disabled={loading}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="Write additional information..."
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-green-700"
          />
        </div>
      </div>
    </section>
  );
};

export default StepBookingDetails;
