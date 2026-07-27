import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

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

const parseMoney = (value) => {
  const amount = Number(value);

  return Number.isFinite(amount) ? amount : 0;
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

const toDecimalString = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "0.00";
  }

  return amount.toFixed(2);
};

const getInitialFormData = (hire) => ({
  due_payment_last_date: "",
  service_price: hire?.service?.shift_charge
    ? String(hire.service.shift_charge)
    : "",
  discount_price: "0.00",
  advance_payment: "0.00",
  seller_note: "",
});

const CreateInvoiceSection = ({ hire }) => {
  const dispatch = useDispatch();

  const createLoading = useSelector(selectInvoiceCreateLoading);
  const apiError = useSelector(selectInvoiceError);

  const [isOpen, setIsOpen] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState(null);
  const [formData, setFormData] = useState(() => getInitialFormData(hire));
  const [validationErrors, setValidationErrors] = useState({});

  const today = getLocalToday();

  const isEligible =
    hire?.status === "accepted" &&
    hire?.is_accept === true &&
    hire?.can_create_invoice === true;

  const financialPreview = useMemo(() => {
    const servicePrice = parseMoney(formData.service_price);
    const discountPrice = parseMoney(formData.discount_price);
    const advancePayment = parseMoney(formData.advance_payment);

    const total = servicePrice - discountPrice;
    const duePayment = total - advancePayment;

    return {
      servicePrice,
      discountPrice,
      advancePayment,
      total: Math.max(total, 0),
      duePayment: Math.max(duePayment, 0),
    };
  }, [
    formData.service_price,
    formData.discount_price,
    formData.advance_payment,
  ]);

  if (!isEligible) {
    return null;
  }

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

    const servicePrice = parseMoney(formData.service_price);
    const discountPrice = parseMoney(formData.discount_price);
    const advancePayment = parseMoney(formData.advance_payment);

    const calculatedTotal = servicePrice - discountPrice;

    if (!formData.due_payment_last_date) {
      errors.due_payment_last_date = "Due payment date is required.";
    } else if (formData.due_payment_last_date < today) {
      errors.due_payment_last_date = "Due payment date cannot be in the past.";
    }

    if (
      formData.service_price === "" ||
      !Number.isFinite(Number(formData.service_price)) ||
      servicePrice <= 0
    ) {
      errors.service_price = "Service price must be greater than zero.";
    }

    if (
      formData.discount_price === "" ||
      !Number.isFinite(Number(formData.discount_price)) ||
      discountPrice < 0
    ) {
      errors.discount_price = "Discount price cannot be negative.";
    } else if (discountPrice > servicePrice) {
      errors.discount_price = "Discount price cannot exceed service price.";
    }

    if (
      formData.advance_payment === "" ||
      !Number.isFinite(Number(formData.advance_payment)) ||
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
      service_price: toDecimalString(formData.service_price),
      discount_price: toDecimalString(formData.discount_price),
      advance_payment: toDecimalString(formData.advance_payment),
      seller_note: formData.seller_note.trim(),
    };

    try {
      const invoice = await dispatch(createInvoice(invoiceData)).unwrap();

      setCreatedInvoice(invoice);
      setIsOpen(false);
    } catch {
      // The rejected message is already stored in the Redux slice.
    }
  };

  if (createdInvoice) {
    return (
      <section className="border-t border-border px-6 py-5">
        <div className="border border-emerald-600 bg-emerald-50 p-5 dark:bg-emerald-950/20">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Invoice Created
          </p>

          <h2 className="mt-2 text-lg font-semibold text-foreground">
            {createdInvoice.invoice_number || "Invoice created successfully"}
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-muted-foreground">Total</p>

              <p className="mt-1 font-semibold">
                {formatMoney(createdInvoice.total)}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase text-muted-foreground">
                Due Payment
              </p>

              <p className="mt-1 font-semibold">
                {formatMoney(createdInvoice.due_payment)}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="border-t border-border px-6 py-5">
      {!isOpen ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">Create Invoice</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              This accepted hire is eligible for invoice creation.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              dispatch(clearInvoiceError());
              setIsOpen(true);
            }}
            className="min-h-10 border border-foreground bg-foreground px-5 py-2 text-sm font-semibold text-background transition hover:opacity-85"
          >
            Create Invoice
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Create Invoice</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Invoice for{" "}
                {hire.service?.service_display_name ||
                  hire.service?.service_name ||
                  "this service"}
              </p>
            </div>

            <button
              type="button"
              disabled={createLoading}
              onClick={() => {
                setIsOpen(false);
                setValidationErrors({});
                dispatch(clearInvoiceError());
              }}
              className="text-sm font-medium text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
          </div>

          {apiError ? (
            <div
              role="alert"
              className="mt-5 border border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-400"
            >
              {apiError}
            </div>
          ) : null}

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="due_payment_last_date"
                className="text-sm font-medium"
              >
                Due Payment Date
              </label>

              <input
                id="due_payment_last_date"
                name="due_payment_last_date"
                type="date"
                min={today}
                value={formData.due_payment_last_date}
                onChange={handleChange}
                disabled={createLoading}
                aria-invalid={Boolean(validationErrors.due_payment_last_date)}
                className="mt-2 h-11 w-full border border-input bg-background px-3 text-sm outline-none focus:border-foreground disabled:cursor-not-allowed disabled:opacity-60"
              />

              {validationErrors.due_payment_last_date ? (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.due_payment_last_date}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="service_price" className="text-sm font-medium">
                Service Price
              </label>

              <input
                id="service_price"
                name="service_price"
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                value={formData.service_price}
                onChange={handleChange}
                disabled={createLoading}
                aria-invalid={Boolean(validationErrors.service_price)}
                className="mt-2 h-11 w-full border border-input bg-background px-3 text-sm outline-none focus:border-foreground disabled:cursor-not-allowed disabled:opacity-60"
              />

              {validationErrors.service_price ? (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.service_price}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="discount_price" className="text-sm font-medium">
                Discount Price
              </label>

              <input
                id="discount_price"
                name="discount_price"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={formData.discount_price}
                onChange={handleChange}
                disabled={createLoading}
                aria-invalid={Boolean(validationErrors.discount_price)}
                className="mt-2 h-11 w-full border border-input bg-background px-3 text-sm outline-none focus:border-foreground disabled:cursor-not-allowed disabled:opacity-60"
              />

              {validationErrors.discount_price ? (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.discount_price}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="advance_payment" className="text-sm font-medium">
                Advance Payment
              </label>

              <input
                id="advance_payment"
                name="advance_payment"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={formData.advance_payment}
                onChange={handleChange}
                disabled={createLoading}
                aria-invalid={Boolean(validationErrors.advance_payment)}
                className="mt-2 h-11 w-full border border-input bg-background px-3 text-sm outline-none focus:border-foreground disabled:cursor-not-allowed disabled:opacity-60"
              />

              {validationErrors.advance_payment ? (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.advance_payment}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-5">
            <label htmlFor="seller_note" className="text-sm font-medium">
              Seller Note
            </label>

            <textarea
              id="seller_note"
              name="seller_note"
              rows={4}
              maxLength={1000}
              value={formData.seller_note}
              onChange={handleChange}
              disabled={createLoading}
              placeholder="Add payment instructions or other invoice information."
              className="mt-2 w-full resize-y border border-input bg-background px-3 py-3 text-sm outline-none focus:border-foreground disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div className="mt-6 border border-border">
            <div className="border-b border-border px-4 py-3">
              <h3 className="font-semibold">Financial Preview</h3>

              <p className="mt-1 text-xs text-muted-foreground">
                The backend response remains the authoritative financial
                calculation.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-5 p-4 md:grid-cols-5">
              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  Service Price
                </p>

                <p className="mt-1 font-medium">
                  {formatMoney(financialPreview.servicePrice)}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  Discount
                </p>

                <p className="mt-1 font-medium">
                  {formatMoney(financialPreview.discountPrice)}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase text-muted-foreground">Total</p>

                <p className="mt-1 font-semibold">
                  {formatMoney(financialPreview.total)}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  Advance
                </p>

                <p className="mt-1 font-medium">
                  {formatMoney(financialPreview.advancePayment)}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  Due Payment
                </p>

                <p className="mt-1 font-semibold">
                  {formatMoney(financialPreview.duePayment)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              disabled={createLoading}
              onClick={() => {
                setIsOpen(false);
                setValidationErrors({});
                dispatch(clearInvoiceError());
              }}
              className="min-h-10 border border-border px-5 py-2 text-sm font-semibold transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={createLoading}
              className="min-h-10 border border-foreground bg-foreground px-5 py-2 text-sm font-semibold text-background transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createLoading
                ? "Creating Invoice..."
                : "Confirm & Create Invoice"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
};

export default CreateInvoiceSection;
