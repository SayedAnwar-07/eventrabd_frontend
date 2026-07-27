import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  clearInvoiceError,
  clearInvoiceSuccessMessage,
  selectInvoiceError,
  selectInvoiceUpdateLoading,
  updateInvoice,
} from "@/store/features/invoice/invoiceSlice";

const getLocalToday = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getInitialFormData = (invoice) => ({
  due_payment_last_date: invoice?.due_payment_last_date || "",
  service_price: invoice?.service_price || "",
  discount_price: invoice?.discount_price || "0.00",
  advance_payment: invoice?.advance_payment || "0.00",
  seller_note: invoice?.seller_note || "",
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

const EditInvoiceDialog = ({ invoice }) => {
  const dispatch = useDispatch();

  const updateLoading = useSelector(selectInvoiceUpdateLoading);
  const apiError = useSelector(selectInvoiceError);

  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState(() => getInitialFormData(invoice));

  const [validationErrors, setValidationErrors] = useState({});
  const [localMessage, setLocalMessage] = useState("");

  const today = getLocalToday();

  const servicePrice = parseMoney(formData.service_price);
  const discountPrice = parseMoney(formData.discount_price);
  const advancePayment = parseMoney(formData.advance_payment);

  const previewTotal = Math.max(servicePrice - discountPrice, 0);
  const previewDuePayment = Math.max(previewTotal - advancePayment, 0);

  const handleOpenChange = (nextOpen) => {
    if (updateLoading) {
      return;
    }

    if (nextOpen) {
      setFormData(getInitialFormData(invoice));
      setValidationErrors({});
      setLocalMessage("");

      dispatch(clearInvoiceError());
      dispatch(clearInvoiceSuccessMessage());
    }

    setOpen(nextOpen);
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

    setLocalMessage("");

    if (apiError) {
      dispatch(clearInvoiceError());
    }
  };

  const validateForm = () => {
    const errors = {};

    const currentServicePrice = Number(formData.service_price);
    const currentDiscountPrice = Number(formData.discount_price);
    const currentAdvancePayment = Number(formData.advance_payment);

    const calculatedTotal = currentServicePrice - currentDiscountPrice;

    if (!formData.due_payment_last_date) {
      errors.due_payment_last_date = "Due payment date is required.";
    } else if (formData.due_payment_last_date < today) {
      errors.due_payment_last_date = "Due payment date cannot be in the past.";
    } else if (
      invoice?.issue_date &&
      formData.due_payment_last_date < invoice.issue_date
    ) {
      errors.due_payment_last_date =
        "Due payment date cannot be before the issue date.";
    }

    if (
      formData.service_price === "" ||
      !Number.isFinite(currentServicePrice) ||
      currentServicePrice <= 0
    ) {
      errors.service_price = "Service price must be greater than zero.";
    }

    if (
      formData.discount_price === "" ||
      !Number.isFinite(currentDiscountPrice) ||
      currentDiscountPrice < 0
    ) {
      errors.discount_price = "Discount price cannot be negative.";
    } else if (currentDiscountPrice > currentServicePrice) {
      errors.discount_price = "Discount price cannot exceed service price.";
    }

    if (
      formData.advance_payment === "" ||
      !Number.isFinite(currentAdvancePayment) ||
      currentAdvancePayment < 0
    ) {
      errors.advance_payment = "Advance payment cannot be negative.";
    } else if (currentAdvancePayment > calculatedTotal) {
      errors.advance_payment =
        "Advance payment cannot exceed the calculated total.";
    }

    setValidationErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const getChangedFields = () => {
    const changedFields = {};

    const nextServicePrice = toDecimalString(formData.service_price);

    const nextDiscountPrice = toDecimalString(formData.discount_price);

    const nextAdvancePayment = toDecimalString(formData.advance_payment);

    const currentServicePrice = toDecimalString(invoice?.service_price);

    const currentDiscountPrice = toDecimalString(invoice?.discount_price);

    const currentAdvancePayment = toDecimalString(invoice?.advance_payment);

    if (nextServicePrice !== currentServicePrice) {
      changedFields.service_price = nextServicePrice;
    }

    if (nextDiscountPrice !== currentDiscountPrice) {
      changedFields.discount_price = nextDiscountPrice;
    }

    if (nextAdvancePayment !== currentAdvancePayment) {
      changedFields.advance_payment = nextAdvancePayment;
    }

    if (formData.due_payment_last_date !== invoice?.due_payment_last_date) {
      changedFields.due_payment_last_date = formData.due_payment_last_date;
    }

    const nextSellerNote = formData.seller_note.trim();
    const currentSellerNote = String(invoice?.seller_note || "").trim();

    if (nextSellerNote !== currentSellerNote) {
      changedFields.seller_note = nextSellerNote;
    }

    return changedFields;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLocalMessage("");

    dispatch(clearInvoiceError());
    dispatch(clearInvoiceSuccessMessage());

    if (!invoice?.id) {
      setLocalMessage("Invoice ID is missing.");
      return;
    }

    if (!invoice?.can_edit) {
      setLocalMessage("This invoice can no longer be edited.");
      return;
    }

    if (!validateForm()) {
      return;
    }

    const changedFields = getChangedFields();

    if (Object.keys(changedFields).length === 0) {
      setLocalMessage("No invoice changes were detected.");
      return;
    }

    try {
      await dispatch(
        updateInvoice({
          invoiceId: invoice.id,
          data: changedFields,
        }),
      ).unwrap();

      setOpen(false);
      setValidationErrors({});
      setLocalMessage("");
    } catch {
      // Redux stores and displays the backend error.
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          disabled={!invoice?.can_edit}
          className="min-h-10 border border-foreground bg-foreground px-5 py-2 text-sm font-semibold text-background transition hover:opacity-85 disabled:cursor-not-allowed disabled:border-border disabled:bg-muted disabled:text-muted-foreground disabled:opacity-60"
        >
          Edit Invoice
        </button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Invoice</DialogTitle>

          <DialogDescription>
            Update payment information for{" "}
            {invoice?.invoice_number || "this invoice"}. Only changed fields
            will be submitted.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-2">
          {apiError ? (
            <div
              role="alert"
              className="mb-5 border border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-400"
            >
              {apiError}
            </div>
          ) : null}

          {localMessage ? (
            <div
              role="status"
              className="mb-5 border border-amber-500 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950/20 dark:text-amber-400"
            >
              {localMessage}
            </div>
          ) : null}

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor={`invoice-due-date-${invoice?.id}`}
                className="text-sm font-medium"
              >
                Due Payment Date
              </label>

              <input
                id={`invoice-due-date-${invoice?.id}`}
                name="due_payment_last_date"
                type="date"
                min={today}
                value={formData.due_payment_last_date}
                onChange={handleChange}
                disabled={updateLoading}
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
              <label
                htmlFor={`invoice-service-price-${invoice?.id}`}
                className="text-sm font-medium"
              >
                Service Price
              </label>

              <input
                id={`invoice-service-price-${invoice?.id}`}
                name="service_price"
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                value={formData.service_price}
                onChange={handleChange}
                disabled={updateLoading}
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
              <label
                htmlFor={`invoice-discount-${invoice?.id}`}
                className="text-sm font-medium"
              >
                Discount Price
              </label>

              <input
                id={`invoice-discount-${invoice?.id}`}
                name="discount_price"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={formData.discount_price}
                onChange={handleChange}
                disabled={updateLoading}
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
              <label
                htmlFor={`invoice-advance-${invoice?.id}`}
                className="text-sm font-medium"
              >
                Advance Payment
              </label>

              <input
                id={`invoice-advance-${invoice?.id}`}
                name="advance_payment"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={formData.advance_payment}
                onChange={handleChange}
                disabled={updateLoading}
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
            <label
              htmlFor={`invoice-seller-note-${invoice?.id}`}
              className="text-sm font-medium"
            >
              Seller Note
            </label>

            <textarea
              id={`invoice-seller-note-${invoice?.id}`}
              name="seller_note"
              rows={4}
              value={formData.seller_note}
              onChange={handleChange}
              disabled={updateLoading}
              placeholder="Add payment instructions or invoice information."
              className="mt-2 w-full resize-y border border-input bg-background px-3 py-3 text-sm outline-none focus:border-foreground disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div className="mt-6 border border-border">
            <div className="border-b border-border px-4 py-3">
              <h3 className="font-semibold">Financial Preview</h3>

              <p className="mt-1 text-xs text-muted-foreground">
                Final totals will come from the backend.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-5 p-4 sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  Service Price
                </p>

                <p className="mt-1 font-medium">{formatMoney(servicePrice)}</p>
              </div>

              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  Discount
                </p>

                <p className="mt-1 font-medium">{formatMoney(discountPrice)}</p>
              </div>

              <div>
                <p className="text-xs uppercase text-muted-foreground">Total</p>

                <p className="mt-1 font-semibold">
                  {formatMoney(previewTotal)}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  Advance
                </p>

                <p className="mt-1 font-medium">
                  {formatMoney(advancePayment)}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  Due Payment
                </p>

                <p className="mt-1 font-semibold">
                  {formatMoney(previewDuePayment)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              disabled={updateLoading}
              onClick={() => handleOpenChange(false)}
              className="min-h-10 border border-border px-5 py-2 text-sm font-semibold transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={updateLoading || !invoice?.can_edit}
              className="min-h-10 border border-foreground bg-foreground px-5 py-2 text-sm font-semibold text-background transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updateLoading ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditInvoiceDialog;
