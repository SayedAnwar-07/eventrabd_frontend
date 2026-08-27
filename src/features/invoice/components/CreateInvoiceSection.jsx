import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Check, FilePlus2, Save } from "lucide-react";

import InvoiceDocument from "./InvoiceDocument";
import InvoiceFormFields from "./InvoiceFormFields";
import TermsConditions from "./TermsConditions";
import InvoiceSlotShifts from "./InvoiceSlotShifts";

import {
  clearInvoiceError,
  clearInvoiceSuccessMessage,
  createInvoice,
  selectInvoiceCreateLoading,
  selectInvoiceError,
} from "@/store/features/invoice/invoiceSlice";

import { getLocalToday } from "../utils/date";
import { toDecimalString } from "../utils/currency";
import { getErrorMessage } from "../utils/validation";

const MAX_TERMS_CONDITIONS = 3;
const MAX_TERM_LENGTH = 300;

const buildPricedBookingRows = (hire, bookingRows = []) => {
  const bookingItems = Array.isArray(hire?.booking_items)
    ? hire.booking_items
    : [];

  return bookingRows.map((slot, index) => {
    const directBookingItemId =
      slot?.booking_item_id ||
      (typeof slot?.booking_item === "string"
        ? slot.booking_item
        : slot?.booking_item?.id);

    let bookingItem = null;

    if (directBookingItemId) {
      bookingItem =
        bookingItems.find(
          (item) => String(item?.id) === String(directBookingItemId),
        ) || null;
    }

    if (!bookingItem) {
      bookingItem =
        bookingItems.find((item) =>
          Array.isArray(item?.booking_slots)
            ? item.booking_slots.some(
                (itemSlot) => String(itemSlot?.id) === String(slot?.id),
              )
            : false,
        ) || null;
    }

    /*
     * Last fallback only when both arrays have the
     * same number of rows.
     */
    if (!bookingItem && bookingItems.length === bookingRows.length) {
      bookingItem = bookingItems[index] || null;
    }

    return {
      ...slot,

      booking_item_id: bookingItem?.id || directBookingItemId || null,

      unit_price:
        bookingItem?.unit_price ??
        slot?.unit_price ??
        slot?.booking_item?.unit_price ??
        null,

      is_package: bookingItem?.is_package ?? Boolean(bookingItem?.package),
    };
  });
};

const buildInitialSlotShifts = (bookingRows = []) => {
  const slotShifts = {};

  bookingRows.forEach((slot) => {
    if (slot?.id) {
      slotShifts[slot.id] = "1";
    }
  });

  return slotShifts;
};

const getInitialFormData = (bookingRows = []) => ({
  slot_shifts: buildInitialSlotShifts(bookingRows),

  due_payment_last_date: "",

  additional_charge: "0.00",
  additional_charge_reason: "",

  discount_price: "0.00",
  advance_payment: "0.00",

  seller_note: "",

  terms_conditions: [],
});

const CreateInvoiceSection = ({ hire, bookingRows }) => {
  const dispatch = useDispatch();

  const createLoading = useSelector(selectInvoiceCreateLoading);

  const apiError = useSelector(selectInvoiceError);

  const [isOpen, setIsOpen] = useState(false);

  const [createdInvoice, setCreatedInvoice] = useState(null);

  const [formData, setFormData] = useState(() =>
    getInitialFormData(bookingRows || []),
  );

  const [validationErrors, setValidationErrors] = useState({});

  const today = getLocalToday();

  const additionalChargeAmount = Number(formData.additional_charge) || 0;

  const hasAdditionalCharge = additionalChargeAmount > 0;

  const pricedBookingRows = buildPricedBookingRows(hire, bookingRows || []);

  const clearFormState = () => {
    setValidationErrors({});

    dispatch(clearInvoiceError());

    dispatch(clearInvoiceSuccessMessage());
  };

  const handleOpen = () => {
    clearFormState();

    setFormData(getInitialFormData(bookingRows || []));

    setIsOpen(true);
  };

  const handleSlotShiftChange = (slotId, value) => {
    setFormData((current) => ({
      ...current,
      slot_shifts: {
        ...current.slot_shifts,
        [slotId]: value,
      },
    }));
  };

  const handleCancel = () => {
    if (createLoading) return;

    clearFormState();

    setIsOpen(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setValidationErrors((current) => ({
      ...current,
      [name]: null,
    }));

    if (apiError) {
      dispatch(clearInvoiceError());
    }
  };

  const handleAddTerm = () => {
    if (
      createLoading ||
      formData.terms_conditions.length >= MAX_TERMS_CONDITIONS
    ) {
      return;
    }

    setFormData((current) => ({
      ...current,

      terms_conditions: [...current.terms_conditions, ""],
    }));
  };

  const handleTermChange = (index, value) => {
    setFormData((current) => ({
      ...current,

      terms_conditions: current.terms_conditions.map((term, termIndex) =>
        termIndex === index ? value : term,
      ),
    }));
  };

  const handleRemoveTerm = (index) => {
    if (createLoading) {
      return;
    }

    setFormData((current) => ({
      ...current,

      terms_conditions: current.terms_conditions.filter(
        (_, termIndex) => termIndex !== index,
      ),
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.due_payment_last_date) {
      errors.due_payment_last_date = "Due payment date is required.";
    }

    const additionalCharge = Number(formData.additional_charge);

    if (!Number.isFinite(additionalCharge) || additionalCharge < 0) {
      errors.additional_charge = "Additional charge cannot be negative.";
    }

    if (additionalCharge > 0 && !formData.additional_charge_reason.trim()) {
      errors.additional_charge_reason = "Additional charge reason is required.";
    }

    const discount = Number(formData.discount_price);

    if (!Number.isFinite(discount) || discount < 0) {
      errors.discount_price = "Discount cannot be negative.";
    }

    const advance = Number(formData.advance_payment);

    if (!Number.isFinite(advance) || advance < 0) {
      errors.advance_payment = "Advance cannot be negative.";
    }

    const termsErrors = formData.terms_conditions.map((term) => {
      const value = term.trim();

      if (!value) {
        return "Term cannot be empty.";
      }

      if (value.length > MAX_TERM_LENGTH) {
        return `Maximum ${MAX_TERM_LENGTH} characters allowed.`;
      }

      return null;
    });

    if (termsErrors.some(Boolean)) {
      errors.terms_conditions = termsErrors;
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

      slot_shifts: (bookingRows || []).map((slot) => ({
        booking_slot: slot.id,

        shift_count: Number(formData.slot_shifts[slot.id]),
      })),

      due_payment_last_date: formData.due_payment_last_date,

      additional_charge: toDecimalString(formData.additional_charge),

      additional_charge_reason: formData.additional_charge_reason.trim(),

      discount_price: toDecimalString(formData.discount_price),

      advance_payment: toDecimalString(formData.advance_payment),

      seller_note: formData.seller_note.trim(),

      terms_conditions: formData.terms_conditions.map((term) => term.trim()),
    };

    try {
      const invoice = await dispatch(createInvoice(invoiceData)).unwrap();

      setCreatedInvoice(invoice);

      setIsOpen(false);
    } catch {
      // handled by redux
    }
  };

  if (createdInvoice) {
    return (
      <InvoiceDocument
        invoice={createdInvoice}
        hire={hire}
        actions={
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
              <Check className="h-5 w-5 text-emerald-700" />
            </div>

            <div>
              <p className="font-semibold text-emerald-700">
                Invoice created successfully
              </p>

              <p className="text-sm text-gray-600">
                Invoice is ready for customer review.
              </p>
            </div>
          </div>
        }
      />
    );
  }

  /*
   * IMPORTANT:
   * YOUR ORIGINAL PRICE CALCULATION.
   * NOTHING CHANGED HERE.
   */
  const calculatePreviewPrice = () => {
    let total = 0;

    let legacyPriceApplied = false;

    const bookingItems = Array.isArray(hire?.booking_items)
      ? hire.booking_items
      : [];

    const isPackageHire =
      Boolean(
        hire?.package || hire?.is_package_hire || hire?.package_price_snapshot,
      ) ||
      bookingItems.some((item) => item?.is_package || Boolean(item?.package));

    pricedBookingRows.forEach((slot) => {
      const shiftCount = Number(formData.slot_shifts[slot.id]) || 1;

      const unitPrice =
        slot?.unit_price === null ||
        slot?.unit_price === undefined ||
        slot?.unit_price === ""
          ? null
          : Number(slot.unit_price);

      /*
       * Correct new-hire pricing.
       *
       * booking item unit price × shift count
       */
      if (unitPrice !== null && Number.isFinite(unitPrice) && unitPrice > 0) {
        total += unitPrice * shiftCount;

        return;
      }

      /*
       * Legacy package:
       * booking_price is the whole package price,
       * NOT price per booking slot.
       */
      if (isPackageHire) {
        if (!legacyPriceApplied) {
          total += Number(
            hire?.booking_price || hire?.package_price_snapshot || 0,
          );

          legacyPriceApplied = true;
        }

        return;
      }

      /*
       * Legacy normal service.
       */
      const fallbackUnitPrice = Number(
        hire?.service?.shift_charge || hire?.booking_price || 0,
      );

      total += fallbackUnitPrice * shiftCount;
    });

    return total;
  };

  const previewBasePrice = calculatePreviewPrice();

  /*
   * Only derived values for displaying the UI.
   * Your base-price calculation above is untouched.
   */
  const previewTotal =
    previewBasePrice +
    Number(formData.additional_charge || 0) -
    Number(formData.discount_price || 0);

  const previewDuePayment =
    previewTotal - Number(formData.advance_payment || 0);

  return (
    <section className="overflow-hidden rounded-md border border-gray-200 bg-white">
      {!isOpen ? (
        /*
         * CLOSED STATE
         */
        <div className="flex flex-col items-center gap-5 px-5 py-6 text-center sm:px-6 lg:flex-row lg:justify-between lg:text-left">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#b60018]">
              Invoice
            </p>

            <h2 className="mt-0.5 text-lg font-semibold text-gray-950">
              Create Customer Invoice
            </h2>

            <p className="mt-0.5 text-sm text-gray-500">
              Generate invoice for accepted hire.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpen}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#b60018] px-5 text-sm font-semibold text-white transition hover:bg-[#960014] lg:w-auto"
          >
            Create Invoice
          </button>
        </div>
      ) : (
        /*
         * OPEN FORM
         */
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="border-b border-gray-200 px-5 py-4 sm:px-6">
            <h2 className="text-lg font-semibold text-gray-950">
              Create Invoice
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Complete the invoice information below.
            </p>
          </div>

          {/* API Error */}
          {apiError ? (
            <div className="mx-5 mt-5 border-l-2 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700 sm:mx-6">
              {getErrorMessage(apiError)}
            </div>
          ) : null}

          <div className="px-5 py-5 sm:px-6">
            {/* =====================================
                BOOKING / SHIFT SECTION
            ====================================== */}
            <div className="pb-6">
              <InvoiceSlotShifts
                bookingRows={pricedBookingRows}
                slotShifts={formData.slot_shifts}
                errors={validationErrors}
                loading={createLoading}
                onChange={handleSlotShiftChange}
              />
            </div>

            {/* =====================================
                PAYMENT FORM
            ====================================== */}
            <InvoiceFormFields
              formData={formData}
              validationErrors={validationErrors}
              loading={createLoading}
              today={today}
              hasAdditionalCharge={hasAdditionalCharge}
              onChange={handleChange}
              basePrice={previewBasePrice}
              total={previewTotal}
              duePayment={previewDuePayment}
            />

            {/* =====================================
                TERMS & CONDITIONS
            ====================================== */}
            <div className="mt-6 pt-6">
              <TermsConditions
                terms={formData.terms_conditions}
                errors={validationErrors.terms_conditions}
                loading={createLoading}
                onAdd={handleAddTerm}
                onChange={handleTermChange}
                onRemove={handleRemoveTerm}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-end">
              {/* Cancel */}
              <button
                type="button"
                onClick={handleCancel}
                disabled={createLoading}
                className="inline-flex h-11 w-full items-center justify-center rounded-md border border-gray-300 bg-white px-6 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                Cancel
              </button>

              {/* Create Invoice */}
              <button
                type="submit"
                disabled={createLoading}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#b60018] px-7 text-sm font-semibold text-white transition hover:bg-[#960014] focus:outline-none focus:ring-2 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {createLoading ? "Creating Invoice..." : "Create Invoice"}
              </button>
            </div>
          </div>
        </form>
      )}
    </section>
  );
};

export default CreateInvoiceSection;
