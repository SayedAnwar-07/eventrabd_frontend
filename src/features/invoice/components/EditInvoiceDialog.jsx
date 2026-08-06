import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CalendarDays,
  CircleDollarSign,
  FilePenLine,
  ListChecks,
  Plus,
  Save,
  Trash2,
} from "lucide-react";

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

const MAX_TERMS_CONDITIONS = 3;
const MAX_TERM_LENGTH = 300;

const normalizeTermsConditions = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.slice(0, MAX_TERMS_CONDITIONS).map((term) => String(term ?? ""));
};

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

  terms_conditions: normalizeTermsConditions(invoice?.terms_conditions),
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

  return "Unable to update the invoice.";
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

  const handleAddTerm = () => {
    if (
      updateLoading ||
      formData.terms_conditions.length >= MAX_TERMS_CONDITIONS
    ) {
      return;
    }

    setFormData((currentData) => ({
      ...currentData,
      terms_conditions: [...currentData.terms_conditions, ""],
    }));

    setValidationErrors((currentErrors) => ({
      ...currentErrors,
      terms_conditions: null,
    }));

    setLocalMessage("");

    if (apiError) {
      dispatch(clearInvoiceError());
    }
  };

  const handleTermChange = (index, value) => {
    setFormData((currentData) => ({
      ...currentData,
      terms_conditions: currentData.terms_conditions.map((term, termIndex) =>
        termIndex === index ? value : term,
      ),
    }));

    setValidationErrors((currentErrors) => {
      const currentTermErrors = Array.isArray(currentErrors.terms_conditions)
        ? [...currentErrors.terms_conditions]
        : [];

      currentTermErrors[index] = null;

      return {
        ...currentErrors,
        terms_conditions: currentTermErrors,
      };
    });

    setLocalMessage("");

    if (apiError) {
      dispatch(clearInvoiceError());
    }
  };

  const handleRemoveTerm = (index) => {
    if (updateLoading) {
      return;
    }

    setFormData((currentData) => ({
      ...currentData,
      terms_conditions: currentData.terms_conditions.filter(
        (_, termIndex) => termIndex !== index,
      ),
    }));

    setValidationErrors((currentErrors) => {
      const currentTermErrors = Array.isArray(currentErrors.terms_conditions)
        ? currentErrors.terms_conditions.filter(
            (_, termIndex) => termIndex !== index,
          )
        : null;

      return {
        ...currentErrors,
        terms_conditions: currentTermErrors,
      };
    });

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

    const termsConditions = normalizeTermsConditions(formData.terms_conditions);

    const termErrors = termsConditions.map((term) => {
      const cleanedTerm = term.trim();

      if (!cleanedTerm) {
        return "Term cannot be empty.";
      }

      if (cleanedTerm.length > MAX_TERM_LENGTH) {
        return `Term cannot contain more than ${MAX_TERM_LENGTH} characters.`;
      }

      return null;
    });

    if (formData.terms_conditions.length > MAX_TERMS_CONDITIONS) {
      errors.terms_conditions = [
        `A maximum of ${MAX_TERMS_CONDITIONS} terms is allowed.`,
      ];
    } else if (termErrors.some(Boolean)) {
      errors.terms_conditions = termErrors;
    }

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

    const nextTermsConditions = normalizeTermsConditions(
      formData.terms_conditions,
    ).map((term) => term.trim());

    const currentTermsConditions = normalizeTermsConditions(
      invoice?.terms_conditions,
    ).map((term) => term.trim());

    if (
      JSON.stringify(nextTermsConditions) !==
      JSON.stringify(currentTermsConditions)
    ) {
      changedFields.terms_conditions = nextTermsConditions;
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
      // Redux stores the backend error.
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          disabled={!invoice?.can_edit}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#b60018] px-6 text-sm font-semibold text-white transition hover:bg-[#960014] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
        >
          <FilePenLine className="h-4 w-4" />
          Edit Invoice
        </button>
      </DialogTrigger>

      <DialogContent className="max-h-[92vh] overflow-y-auto border-gray-200 bg-white p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-gray-200 px-6 py-5 text-left sm:px-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
            <FilePenLine className="h-5 w-5 text-[#b60018]" />
          </div>

          <DialogTitle className="pt-2 text-xl text-gray-950">
            Edit Invoice
          </DialogTitle>

          <DialogDescription className="leading-6 text-gray-600">
            Update payment information for{" "}
            <span className="font-semibold text-gray-900">
              {invoice?.invoice_number || "this invoice"}
            </span>
            . Only changed fields will be submitted.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-6 sm:px-8">
          {apiError ? (
            <div
              role="alert"
              className="mb-5 border-l-2 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {getErrorMessage(apiError)}
            </div>
          ) : null}

          {localMessage ? (
            <div
              role="status"
              className="mb-5 border-l-2 border-amber-600 bg-amber-50 px-4 py-3 text-sm text-amber-800"
            >
              {localMessage}
            </div>
          ) : null}

          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              id={`invoice-due-date-${invoice?.id}`}
              label="Due Payment Date"
              icon={CalendarDays}
              error={validationErrors.due_payment_last_date}
            >
              <input
                id={`invoice-due-date-${invoice?.id}`}
                name="due_payment_last_date"
                type="date"
                min={today}
                value={formData.due_payment_last_date}
                onChange={handleChange}
                disabled={updateLoading}
                aria-invalid={Boolean(validationErrors.due_payment_last_date)}
                className="mt-2 h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-950 outline-none transition focus:border-[#b60018] focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60"
              />
            </FormField>

            <FormField
              id={`invoice-service-price-${invoice?.id}`}
              label="Service Price"
              icon={CircleDollarSign}
              error={validationErrors.service_price}
            >
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
                className="mt-2 h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-950 outline-none transition focus:border-[#b60018] focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60"
              />
            </FormField>

            <FormField
              id={`invoice-discount-${invoice?.id}`}
              label="Discount Price"
              icon={CircleDollarSign}
              error={validationErrors.discount_price}
            >
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
                className="mt-2 h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-950 outline-none transition focus:border-[#b60018] focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60"
              />
            </FormField>

            <FormField
              id={`invoice-advance-${invoice?.id}`}
              label="Advance Payment"
              icon={CircleDollarSign}
              error={validationErrors.advance_payment}
            >
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
                className="mt-2 h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-950 outline-none transition focus:border-[#b60018] focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60"
              />
            </FormField>
          </div>

          <div className="mt-5">
            <label
              htmlFor={`invoice-seller-note-${invoice?.id}`}
              className="text-sm font-semibold text-gray-800"
            >
              Seller Note
            </label>

            <textarea
              id={`invoice-seller-note-${invoice?.id}`}
              name="seller_note"
              rows={4}
              maxLength={1000}
              value={formData.seller_note}
              onChange={handleChange}
              disabled={updateLoading}
              placeholder="Add payment instructions or invoice information."
              className="mt-2 w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-gray-950 outline-none transition focus:border-[#b60018] focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60"
            />
          </div>

          <div className="mt-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-[#b60018]" />

                  <h3 className="text-sm font-semibold text-gray-800">
                    Terms & Conditions
                  </h3>

                  <span className="text-xs font-normal text-gray-500">
                    Optional
                  </span>
                </div>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Add up to {MAX_TERMS_CONDITIONS} invoice terms.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddTerm}
                disabled={
                  updateLoading ||
                  formData.terms_conditions.length >= MAX_TERMS_CONDITIONS
                }
                className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-[#b60018] bg-white px-4 text-xs font-semibold text-[#b60018] transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-white"
              >
                <Plus className="h-4 w-4" />
                Add Term
              </button>
            </div>

            {formData.terms_conditions.length > 0 ? (
              <div className="mt-4 space-y-3">
                {formData.terms_conditions.map((term, index) => {
                  const termError = Array.isArray(
                    validationErrors.terms_conditions,
                  )
                    ? validationErrors.terms_conditions[index]
                    : null;

                  return (
                    <div
                      key={`invoice-term-${invoice?.id}-${index}`}
                      className="rounded-xl border border-gray-200 bg-gray-50 p-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-50 text-xs font-bold text-[#b60018]">
                          {index + 1}
                        </div>

                        <div className="min-w-0 flex-1">
                          <label
                            htmlFor={`invoice-term-${invoice?.id}-${index}`}
                            className="sr-only"
                          >
                            Term {index + 1}
                          </label>

                          <textarea
                            id={`invoice-term-${invoice?.id}-${index}`}
                            rows={2}
                            maxLength={MAX_TERM_LENGTH}
                            value={term}
                            onChange={(event) =>
                              handleTermChange(index, event.target.value)
                            }
                            disabled={updateLoading}
                            aria-invalid={Boolean(termError)}
                            placeholder={`Enter term ${index + 1}`}
                            className={`w-full resize-y rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-950 outline-none transition disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60 ${
                              termError
                                ? "border-red-400 focus:border-red-600 focus:ring-2 focus:ring-red-100"
                                : "border-gray-300 focus:border-[#b60018] focus:ring-2 focus:ring-red-100"
                            }`}
                          />

                          <div className="mt-1 flex items-start justify-between gap-3">
                            <div>
                              {termError ? (
                                <p className="text-xs text-red-600">
                                  {termError}
                                </p>
                              ) : null}
                            </div>

                            <p className="shrink-0 text-[11px] text-gray-400">
                              {term.length}/{MAX_TERM_LENGTH}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveTerm(index)}
                          disabled={updateLoading}
                          aria-label={`Remove term ${index + 1}`}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-5 text-center">
                <p className="text-sm text-gray-500">
                  No terms and conditions added.
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  This field is optional.
                </p>
              </div>
            )}

            <div className="mt-2 flex justify-end">
              <p className="text-xs text-gray-500">
                {formData.terms_conditions.length}/{MAX_TERMS_CONDITIONS} terms
                added
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
            <div>
              <h3 className="font-semibold text-gray-950">Financial Preview</h3>

              <p className="mt-1 text-xs text-gray-500">
                Final totals will be calculated and returned by the backend.
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <PreviewItem label="Service Price" value={servicePrice} />

              <PreviewItem label="Discount" value={discountPrice} />

              <PreviewItem label="Subtotal" value={previewTotal} />

              <PreviewItem label="Advance" value={advancePayment} />

              <PreviewItem
                label="Due Payment"
                value={previewDuePayment}
                emphasized
              />
            </div>
          </div>

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={updateLoading}
              onClick={() => handleOpenChange(false)}
              className="h-11 rounded-lg border border-gray-300 bg-white px-6 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={updateLoading || !invoice?.can_edit}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#b60018] px-6 text-sm font-semibold text-white transition hover:bg-[#960014] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />

              {updateLoading ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditInvoiceDialog;
