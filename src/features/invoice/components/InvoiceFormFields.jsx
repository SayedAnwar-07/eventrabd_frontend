import { CalendarDays, CircleDollarSign } from "lucide-react";

import FormField from "./FormField";

const InvoiceFormFields = ({
  formData,
  validationErrors,
  loading,
  today,
  hasAdditionalCharge,
  onChange,
}) => {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <FormField
        id="invoice-due-payment-date"
        label="Due Payment Date"
        icon={CalendarDays}
        error={validationErrors.due_payment_last_date}
      >
        <input
          id="invoice-due-payment-date"
          name="due_payment_last_date"
          type="date"
          min={today}
          value={formData.due_payment_last_date}
          onChange={onChange}
          disabled={loading}
          className="mt-2 h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-950 outline-none transition focus:border-[#b60018] focus:ring-2 focus:ring-red-100"
        />
      </FormField>

      <FormField
        id="invoice-additional-charge"
        label="Additional Charge"
        icon={CircleDollarSign}
        error={validationErrors.additional_charge}
        optionalText="Optional"
      >
        <input
          id="invoice-additional-charge"
          name="additional_charge"
          type="number"
          min="0"
          step="0.01"
          value={formData.additional_charge}
          onChange={onChange}
          disabled={loading}
          className="mt-2 h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-950 outline-none transition focus:border-[#b60018] focus:ring-2 focus:ring-red-100"
        />
      </FormField>

      <FormField
        id="invoice-discount-price"
        label="Discount Price"
        icon={CircleDollarSign}
        error={validationErrors.discount_price}
      >
        <input
          id="invoice-discount-price"
          name="discount_price"
          type="number"
          min="0"
          step="0.01"
          value={formData.discount_price}
          onChange={onChange}
          disabled={loading}
          className="mt-2 h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-950 outline-none transition focus:border-[#b60018] focus:ring-2:ring-red-100"
        />
      </FormField>

      <FormField
        id="invoice-advance-payment"
        label="Advance Payment"
        icon={CircleDollarSign}
        error={validationErrors.advance_payment}
      >
        <input
          id="invoice-advance-payment"
          name="advance_payment"
          type="number"
          min="0"
          step="0.01"
          value={formData.advance_payment}
          onChange={onChange}
          disabled={loading}
          className="mt-2 h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-950 outline-none transition focus:border-[#b60018] focus:ring-2:ring-red-100"
        />
      </FormField>

      <div className="md:col-span-2">
        <FormField
          id="invoice-additional-charge-reason"
          label="Additional Charge Reason"
          error={validationErrors.additional_charge_reason}
          optionalText={hasAdditionalCharge ? "Required" : "Optional"}
        >
          <textarea
            id="invoice-additional-charge-reason"
            name="additional_charge_reason"
            rows={3}
            value={formData.additional_charge_reason}
            onChange={onChange}
            disabled={loading}
            required={hasAdditionalCharge}
            className="mt-2 w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-gray-950 outline-none transition focus:border-[#b60018] focus:ring-2:ring-red-100"
          />
        </FormField>
      </div>

      <div className="md:col-span-2">
        <label className="text-sm font-semibold text-gray-800">
          Seller Note
        </label>

        <textarea
          name="seller_note"
          rows={4}
          value={formData.seller_note}
          onChange={onChange}
          disabled={loading}
          className="mt-2 w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-gray-950 outline-none transition focus:border-[#b60018] focus:ring-2:ring-red-100"
        />
      </div>
    </div>
  );
};

export default InvoiceFormFields;
