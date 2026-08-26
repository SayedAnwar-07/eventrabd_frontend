import { formatMoney } from "../utils/currency";

/*
 * Visible only on laptop / desktop.
 * Hidden on mobile and tablet.
 */
const DesktopDots = () => (
  <div className="hidden flex-1 border-b border-dashed border-gray-500 md:block" />
);

const InvoiceFormFields = ({
  formData,
  validationErrors,
  loading,
  today,
  hasAdditionalCharge,
  onChange,
  basePrice,
  total,
  duePayment,
}) => {
  const safeMoney = (value) => {
    const number = Number(value);

    return formatMoney(Number.isFinite(number) ? number : 0);
  };

  const inputClass =
    "h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-[#b60018] focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-gray-100";

  const textareaClass =
    "w-full resize-y rounded-md border border-gray-300 bg-white px-3 py-3 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-[#b60018] focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-gray-100";

  return (
    <div className="w-full text-gray-900">
      {/* =========================================
          DUE PAYMENT DATE
      ========================================== */}
      <div className="border-b border-gray-200 py-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
          <label
            htmlFor="invoice-due-payment-date"
            className="shrink-0 text-sm font-semibold text-gray-900"
          >
            Due Payment Date
            <span className="ml-0.5 text-[#b60018]">*</span>
          </label>

          <DesktopDots />

          <div className="w-full md:w-72">
            <input
              id="invoice-due-payment-date"
              name="due_payment_last_date"
              type="date"
              min={today}
              value={formData.due_payment_last_date}
              onChange={onChange}
              disabled={loading}
              className={inputClass}
            />

            {validationErrors.due_payment_last_date ? (
              <p className="mt-1.5 text-xs text-red-600">
                {validationErrors.due_payment_last_date}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* =========================================
          BASE PRICE
      ========================================== */}
      <div className="py-4">
        <div className="flex items-center gap-3">
          <span className="shrink-0 text-sm text-gray-900">Base Price</span>

          <DesktopDots />

          <span className="ml-auto shrink-0 text-sm font-semibold text-gray-950">
            {safeMoney(basePrice)}
          </span>
        </div>
      </div>

      {/* =========================================
          ADDITIONAL CHARGE
      ========================================== */}
      <div className="py-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
          <label
            htmlFor="invoice-additional-charge"
            className="shrink-0 text-sm text-gray-900"
          >
            Additional Charge
          </label>

          <DesktopDots />

          <div className="w-full md:w-72">
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-gray-500">
                ৳
              </span>

              <input
                id="invoice-additional-charge"
                name="additional_charge"
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={
                  formData.additional_charge === "0.00"
                    ? ""
                    : formData.additional_charge
                }
                onChange={onChange}
                disabled={loading}
                placeholder="Enter amount"
                className={`${inputClass} pl-8`}
              />
            </div>

            {validationErrors.additional_charge ? (
              <p className="mt-1.5 text-xs text-red-600">
                {validationErrors.additional_charge}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* =========================================
          ADDITIONAL CHARGE REASON
      ========================================== */}
      <div className="pb-4">
        <label
          htmlFor="invoice-additional-charge-reason"
          className="mb-2 block text-sm text-gray-900"
        >
          Additional Charge Reason
          {hasAdditionalCharge ? (
            <span className="ml-1 text-xs text-[#b60018]">Required</span>
          ) : null}
        </label>

        <textarea
          id="invoice-additional-charge-reason"
          name="additional_charge_reason"
          rows={3}
          value={formData.additional_charge_reason}
          onChange={onChange}
          disabled={loading}
          required={hasAdditionalCharge}
          placeholder="Write the reason for additional charge"
          className={`${textareaClass} min-h-22.5]`}
        />

        {validationErrors.additional_charge_reason ? (
          <p className="mt-1.5 text-xs text-red-600">
            {validationErrors.additional_charge_reason}
          </p>
        ) : null}
      </div>

      {/* =========================================
          DISCOUNT
      ========================================== */}
      <div className="border-b border-gray-200 py-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
          <label
            htmlFor="invoice-discount-price"
            className="shrink-0 text-sm text-gray-900"
          >
            Discount
          </label>

          <DesktopDots />

          <div className="w-full md:w-72">
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-gray-500">
                −৳
              </span>

              <input
                id="invoice-discount-price"
                name="discount_price"
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={
                  formData.discount_price === "0.00"
                    ? ""
                    : formData.discount_price
                }
                onChange={onChange}
                disabled={loading}
                placeholder="Enter discount"
                className={`${inputClass} pl-10`}
              />
            </div>

            {validationErrors.discount_price ? (
              <p className="mt-1.5 text-xs text-red-600">
                {validationErrors.discount_price}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* =========================================
          TOTAL
      ========================================== */}
      <div className="py-4">
        <div className="flex items-center gap-3">
          <span className="shrink-0 text-sm font-bold text-gray-950">
            Total
          </span>

          <DesktopDots />

          <span className="ml-auto shrink-0 text-sm font-bold text-gray-950">
            {safeMoney(total)}
          </span>
        </div>
      </div>

      {/* =========================================
          ADVANCE PAYMENT
      ========================================== */}
      <div className="py-4 border-b border-gray-200">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
          <label
            htmlFor="invoice-advance-payment"
            className="shrink-0 text-sm text-gray-900"
          >
            Advance Payment
          </label>

          <DesktopDots />

          <div className="w-full md:w-72">
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-gray-500">
                −৳
              </span>

              <input
                id="invoice-advance-payment"
                name="advance_payment"
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={
                  formData.advance_payment === "0.00"
                    ? ""
                    : formData.advance_payment
                }
                onChange={onChange}
                disabled={loading}
                placeholder="Enter advance payment"
                className={`${inputClass} pl-10`}
              />
            </div>

            {validationErrors.advance_payment ? (
              <p className="mt-1.5 text-xs text-red-600">
                {validationErrors.advance_payment}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* =========================================
          DUE PAYMENT
      ========================================== */}
      <div className="py-4">
        <div className="flex items-center gap-3">
          <span className="shrink-0 text-sm font-bold text-gray-950">
            Due Payment
          </span>

          <DesktopDots />

          <span className="ml-auto shrink-0 text-sm font-bold text-gray-950">
            {safeMoney(duePayment)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default InvoiceFormFields;
