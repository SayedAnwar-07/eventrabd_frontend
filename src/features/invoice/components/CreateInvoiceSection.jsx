import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CalendarDays,
  Check,
  CircleDollarSign,
  FilePlus2,
  Save,
  X,
} from "lucide-react";

import InvoiceDocument from "./InvoiceDocument";

import {
  clearInvoiceError,
  clearInvoiceSuccessMessage,
  createInvoice,
  selectInvoiceCreateLoading,
  selectInvoiceError,
} from "@/store/features/invoice/invoiceSlice";

const getLocalToday = () => {
  const today = new Date();

  const year = today.getFullYear();

  const month = String(today.getMonth() + 1).padStart(2, "0");

  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getInitialFormData = () => ({
  due_payment_last_date: "",
  discount_price: "0.00",
  advance_payment: "0.00",
  seller_note: "",
});

const parseMoney = (value) => {
  const amount = Number(value);

  return Number.isFinite(amount) ? amount : 0;
};

const toDecimalString = (value) => {
  const amount = Number(value);

  return Number.isFinite(amount) ? amount.toFixed(2) : "0.00";
};

const formatMoney = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "৳0.00";
  }

  return `৳${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const getErrorMessage = (error) => {
  if (!error) {
    return "";
  }

  if (typeof error === "string") {
    return error;
  }

  if (typeof error?.detail === "string") {
    return error.detail;
  }

  if (typeof error?.message === "string") {
    return error.message;
  }

  return "Unable to create the invoice.";
};

const FormField = ({ id, label, icon: Icon, error, children }) => {
  return (
    <div>
      <label
        htmlFor={id}
        className="flex items-center gap-2 text-sm font-semibold text-gray-800"
      >
        {Icon ? <Icon className="h-4 w-4 text-[#b60018]" /> : null}

        {label}
      </label>

      {children}

      {error ? <p className="mt-1.5 text-sm text-red-600">{error}</p> : null}
    </div>
  );
};

const PreviewItem = ({ label, value, emphasized = false }) => {
  return (
    <div
      className={
        emphasized
          ? "rounded-xl bg-[#b60018] p-4 text-white"
          : "rounded-xl border border-gray-200 bg-white p-4"
      }
    >
      <p
        className={`text-[10px] font-bold uppercase tracking-[0.12em] ${
          emphasized ? "text-red-100" : "text-gray-500"
        }`}
      >
        {label}
      </p>

      <p
        className={`mt-1 ${
          emphasized ? "text-lg font-bold" : "font-semibold text-gray-950"
        }`}
      >
        {formatMoney(value)}
      </p>
    </div>
  );
};

const CreateInvoiceSection = ({ hire }) => {
  const dispatch = useDispatch();

  const createLoading = useSelector(selectInvoiceCreateLoading);

  const apiError = useSelector(selectInvoiceError);

  const [isOpen, setIsOpen] = useState(false);

  const [createdInvoice, setCreatedInvoice] = useState(null);

  const [formData, setFormData] = useState(getInitialFormData);

  const [validationErrors, setValidationErrors] = useState({});

  const today = getLocalToday();

  const serviceSummary = hire?.service_summary || {};

  const slotCount = Number(
    serviceSummary?.slot_count || hire?.booking_slots?.length || 0,
  );

  const shiftHourPerSlot = Number(
    serviceSummary?.shift_hour_per_slot || hire?.service?.shift_hour || 0,
  );

  const totalShiftHours = Number(
    serviceSummary?.total_shift_hours || shiftHourPerSlot * slotCount,
  );

  const shiftChargePerSlot = parseMoney(
    serviceSummary?.shift_charge_per_slot || hire?.service?.shift_charge,
  );

  const servicePrice = parseMoney(
    serviceSummary?.total_amount || shiftChargePerSlot * slotCount,
  );

  const isEligible =
    hire?.status === "accepted" &&
    hire?.is_accept === true &&
    hire?.can_create_invoice === true;

  const financialPreview = useMemo(() => {
    const discountPrice = parseMoney(formData.discount_price);

    const advancePayment = parseMoney(formData.advance_payment);

    const subtotal = Math.max(servicePrice - discountPrice, 0);

    const duePayment = Math.max(subtotal - advancePayment, 0);

    return {
      servicePrice,
      discountPrice,
      advancePayment,
      subtotal,
      total: subtotal,
      duePayment,
    };
  }, [servicePrice, formData.discount_price, formData.advance_payment]);

  if (!isEligible && !createdInvoice) {
    return null;
  }

  const clearFormState = () => {
    setValidationErrors({});
    dispatch(clearInvoiceError());
    dispatch(clearInvoiceSuccessMessage());
  };

  const handleOpen = () => {
    clearFormState();

    setFormData(getInitialFormData());

    setIsOpen(true);
  };

  const handleCancel = () => {
    if (createLoading) {
      return;
    }

    clearFormState();
    setIsOpen(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    setValidationErrors((currentErrors) => ({
      ...currentErrors,
      [name]: null,
    }));

    if (apiError) {
      dispatch(clearInvoiceError());
    }
  };

  const validateForm = () => {
    const errors = {};

    const discountPrice = Number(formData.discount_price);

    const advancePayment = Number(formData.advance_payment);

    const calculatedTotal = servicePrice - discountPrice;

    if (!formData.due_payment_last_date) {
      errors.due_payment_last_date = "Due payment date is required.";
    } else if (formData.due_payment_last_date < today) {
      errors.due_payment_last_date = "Due payment date cannot be in the past.";
    }

    if (!Number.isFinite(servicePrice) || servicePrice <= 0) {
      errors.service_price =
        "The calculated service price must be greater than zero.";
    }

    if (
      formData.discount_price === "" ||
      !Number.isFinite(discountPrice) ||
      discountPrice < 0
    ) {
      errors.discount_price = "Discount price cannot be negative.";
    } else if (discountPrice > servicePrice) {
      errors.discount_price = "Discount price cannot exceed service price.";
    }

    if (
      formData.advance_payment === "" ||
      !Number.isFinite(advancePayment) ||
      advancePayment < 0
    ) {
      errors.advance_payment = "Advance payment cannot be negative.";
    } else if (advancePayment > calculatedTotal) {
      errors.advance_payment =
        "Advance payment cannot exceed the calculated total.";
    }

    setValidationErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    dispatch(clearInvoiceError());
    dispatch(clearInvoiceSuccessMessage());

    if (!validateForm()) {
      return;
    }

    const invoiceData = {
      hire: hire.id,

      due_payment_last_date: formData.due_payment_last_date,

      discount_price: toDecimalString(formData.discount_price),

      advance_payment: toDecimalString(formData.advance_payment),

      seller_note: formData.seller_note.trim(),
    };

    try {
      const invoice = await dispatch(createInvoice(invoiceData)).unwrap();

      setCreatedInvoice(invoice);
      setIsOpen(false);
      setValidationErrors({});
    } catch {
      // Redux stores the backend error.
    }
  };

  if (createdInvoice) {
    const createdInvoiceActions = (
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
          <Check className="h-5 w-5 text-emerald-700" />
        </div>

        <div>
          <p className="font-semibold text-emerald-700">
            Invoice created successfully
          </p>

          <p className="mt-1 text-sm leading-6 text-gray-600">
            The invoice is now available for the customer to review.
          </p>
        </div>
      </div>
    );

    return (
      <InvoiceDocument
        invoice={createdInvoice}
        hire={hire}
        actions={createdInvoiceActions}
      />
    );
  }

  if (!isOpen) {
    return (
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
        <div className="border-b border-gray-100 bg-[linear-gradient(135deg,#fff7f8_0%,#ffffff_60%)] px-6 py-7 sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50">
                <FilePlus2 className="h-6 w-6 text-[#b60018]" />
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#b60018]">
                  Invoice
                </p>

                <h2 className="mt-1 text-xl font-semibold text-gray-950">
                  Create customer invoice
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-gray-600">
                  This accepted hire is ready for invoice creation. Service
                  price will be calculated from the booked slots.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpen}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#b60018] px-6 text-sm font-semibold text-white transition hover:bg-[#960014]"
            >
              <FilePlus2 className="h-4 w-4" />
              Create Invoice
            </button>
          </div>
        </div>

        <div className="grid gap-5 px-6 py-6 sm:grid-cols-3 sm:px-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">
              Booked Slots
            </p>

            <p className="mt-1 text-lg font-semibold text-gray-950">
              {slotCount}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">
              Total Shift Hours
            </p>

            <p className="mt-1 text-lg font-semibold text-gray-950">
              {totalShiftHours} Hours
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">
              Service Price
            </p>

            <p className="mt-1 text-lg font-semibold text-[#b60018]">
              {formatMoney(servicePrice)}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.07)]">
      <header className="border-b border-gray-200 bg-[linear-gradient(135deg,#fff7f8_0%,#ffffff_60%)] px-6 py-6 sm:px-8">
        <div className="flex items-start justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50">
              <FilePlus2 className="h-5 w-5 text-[#b60018]" />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#b60018]">
                New Invoice
              </p>

              <h2 className="mt-1 text-xl font-semibold text-gray-950">
                Create Invoice
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                Invoice for{" "}
                <span className="font-semibold text-gray-900">
                  {hire?.service?.service_display_name ||
                    hire?.service?.service_name ||
                    "this service"}
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCancel}
            disabled={createLoading}
            aria-label="Close invoice form"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="px-6 py-6 sm:px-8 sm:py-8">
        {apiError ? (
          <div
            role="alert"
            className="mb-6 border-l-2 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {getErrorMessage(apiError)}
          </div>
        ) : null}

        {validationErrors.service_price ? (
          <div
            role="alert"
            className="mb-6 border-l-2 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {validationErrors.service_price}
          </div>
        ) : null}

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
              onChange={handleChange}
              disabled={createLoading}
              aria-invalid={Boolean(validationErrors.due_payment_last_date)}
              className="mt-2 h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-950 outline-none transition focus:border-[#b60018] focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60"
            />
          </FormField>

          <FormField
            id="invoice-shift-duration"
            label="Booked Shift Duration"
            icon={CalendarDays}
          >
            <input
              id="invoice-shift-duration"
              type="text"
              value={`${shiftHourPerSlot} Hours × ${slotCount} Slots = ${totalShiftHours} Hours`}
              readOnly
              aria-readonly="true"
              className="mt-2 h-11 w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 text-sm text-gray-600 outline-none"
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
              inputMode="decimal"
              value={formData.discount_price}
              onChange={handleChange}
              disabled={createLoading}
              aria-invalid={Boolean(validationErrors.discount_price)}
              className="mt-2 h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-950 outline-none transition focus:border-[#b60018] focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60"
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
              inputMode="decimal"
              value={formData.advance_payment}
              onChange={handleChange}
              disabled={createLoading}
              aria-invalid={Boolean(validationErrors.advance_payment)}
              className="mt-2 h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-950 outline-none transition focus:border-[#b60018] focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60"
            />
          </FormField>
        </div>

        <div className="mt-5">
          <label
            htmlFor="invoice-seller-note"
            className="text-sm font-semibold text-gray-800"
          >
            Seller Note
          </label>

          <textarea
            id="invoice-seller-note"
            name="seller_note"
            rows={4}
            maxLength={1000}
            value={formData.seller_note}
            onChange={handleChange}
            disabled={createLoading}
            placeholder="Add payment instructions or other invoice information."
            className="mt-2 w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-gray-950 outline-none transition focus:border-[#b60018] focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60"
          />
        </div>

        <div className="mt-7 rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
          <div>
            <h3 className="font-semibold text-gray-950">Financial Preview</h3>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              Service price is calculated from the booked slots. Final values
              will come from the backend.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <PreviewItem
              label="Service Price"
              value={financialPreview.servicePrice}
            />

            <PreviewItem
              label="Discount"
              value={financialPreview.discountPrice}
            />

            <PreviewItem label="Subtotal" value={financialPreview.subtotal} />

            <PreviewItem
              label="Advance"
              value={financialPreview.advancePayment}
            />

            <PreviewItem
              label="Due Payment"
              value={financialPreview.duePayment}
              emphasized
            />
          </div>
        </div>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleCancel}
            disabled={createLoading}
            className="h-11 rounded-lg border border-gray-300 bg-white px-6 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={createLoading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#b60018] px-6 text-sm font-semibold text-white transition hover:bg-[#960014] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />

            {createLoading ? "Creating Invoice..." : "Confirm & Create Invoice"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default CreateInvoiceSection;
