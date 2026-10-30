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
  const labelClass = "mb-1.5 block text-xs font-medium text-[#51463E]";

  const inputClass =
    "h-11 w-full rounded-md border border-[#E5DDD5] bg-gray-50 px-3 text-sm text-[#3D3530] shadow-none outline-none transition-colors placeholder:text-[#A69B91] hover:border-[#CFC2B6] focus-visible:border-[#A68C78] focus-visible:ring-2 focus-visible:ring-[#A68C78]/20 disabled:cursor-not-allowed disabled:bg-[#F8F5F2] disabled:opacity-70";

  const optionalClass = "ml-1 text-[11px] font-normal text-[#9B9087]";

  const whatsappError =
    fieldErrors.customer_whatsapp_number ||
    fieldErrors.customerWhatsappNumber ||
    fieldErrors.whatsapp_number ||
    fieldErrors.whatsapp ||
    null;

  return (
    <section className="space-y-6">
      {/* Booking Items */}
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

      {/* Customer Information */}
      <div className="space-y-6 rounded-md border border-[#E5DDD5] bg-white p-4 shadow-[0_1px_2px_rgba(61,53,48,0.04),0_8px_24px_-12px_rgba(61,53,48,0.10)] sm:p-7">
        {/* WhatsApp Number */}
        <div>
          <label htmlFor="customer-whatsapp" className={labelClass}>
            WhatsApp Number
            <span className="ml-1 text-red-600">*</span>
          </label>

          <div
            className={`flex h-11 w-full items-center overflow-hidden rounded-md border bg-white transition-colors focus-within:ring-2 disabled:bg-[#F8F5F2] ${whatsappError ? "border-red-500 focus-within:border-red-500 focus-within:ring-red-500/15" : "border-[#E5DDD5] hover:border-[#CFC2B6] focus-within:border-[#A68C78] focus-within:ring-[#A68C78]/20"}`}
          >
            <span className="flex h-full shrink-0 items-center gap-2 pl-3 pr-2 text-sm font-medium text-[#51463E] bg-gray-100">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="text-green-700"
              >
                <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
              </svg>
              +88
            </span>

            <input
              id="customer-whatsapp"
              type="tel"
              inputMode="numeric"
              value={customerWhatsappNumber ?? ""}
              disabled={loading}
              required
              aria-invalid={Boolean(whatsappError)}
              aria-describedby={
                whatsappError
                  ? "customer-whatsapp-error"
                  : "customer-whatsapp-help"
              }
              onChange={(e) => onWhatsappChange(e.target.value)}
              placeholder="01XXXXXXXXX"
              className="h-full min-w-0 flex-1 bg-gray-100 pr-3 text-sm text-[#3D3530] outline-none placeholder:text-[#A69B91] disabled:cursor-not-allowed disabled:opacity-70"
            />
          </div>

          {whatsappError ? (
            <p
              id="customer-whatsapp-error"
              role="alert"
              className="mt-1.5 text-xs text-red-600"
            >
              {whatsappError}
            </p>
          ) : (
            <p
              id="customer-whatsapp-help"
              className="mt-1.5 text-xs text-[#9B9087]"
            >
              We'll use this number to share booking updates.
            </p>
          )}
        </div>

        {/* Customer Note */}
        <div>
          <label htmlFor="customer-note" className={labelClass}>
            Customer Note
            <span className={optionalClass}>(Optional)</span>
          </label>

          <textarea
            id="customer-note"
            rows={4}
            value={customerNote ?? ""}
            disabled={loading}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="Write additional information..."
            className={`${inputClass} h-auto min-h-28 resize-y py-3 leading-6`}
          />
        </div>
      </div>
    </section>
  );
};

export default StepBookingDetails;
