import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CalendarDays, Check, FilePlus2, Save, X } from "lucide-react";

import InvoiceDocument from "./InvoiceDocument";

import InvoiceFormFields from "./InvoiceFormFields";
import TermsConditions from "./TermsConditions";
import InvoicePreview from "./InvoicePreview";

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
import InvoiceSlotShifts from "./InvoiceSlotShifts";

const MAX_TERMS_CONDITIONS = 3;
const MAX_TERM_LENGTH = 300;

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

  console.log(hire, bookingRows);

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

  const calculatePreviewPrice = () => {
    return (hire?.booking_items || []).reduce((total, item, index) => {
      const slotId = bookingRows[index]?.id;

      const shiftCount = Number(formData.slot_shifts[slotId]) || 1;

      return total + Number(item.unit_price || 0) * shiftCount;
    }, 0);
  };

  const previewBasePrice = calculatePreviewPrice();

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {!isOpen ? (
        <div className="flex items-center justify-between px-6 py-7">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
              <FilePlus2 className="h-6 w-6 text-[#b60018]" />
            </div>

            <div>
              <p className="text-xs font-bold uppercase text-[#b60018]">
                Invoice
              </p>

              <h2 className="text-xl font-semibold text-gray-950">
                Create Customer Invoice
              </h2>

              <p className="text-sm text-gray-600">
                Generate invoice for accepted hire.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpen}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#b60018] px-6 text-sm font-semibold text-white"
          >
            <FilePlus2 className="h-4 w-4" />
            Create Invoice
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
          {apiError ? (
            <div className="border-l-2 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700">
              {getErrorMessage(apiError)}
            </div>
          ) : null}

          <InvoiceSlotShifts
            bookingRows={bookingRows || []}
            slotShifts={formData.slot_shifts}
            errors={validationErrors}
            loading={createLoading}
            onChange={handleSlotShiftChange}
          />

          <InvoiceFormFields
            formData={formData}
            validationErrors={validationErrors}
            loading={createLoading}
            today={today}
            hasAdditionalCharge={hasAdditionalCharge}
            onChange={handleChange}
          />

          <TermsConditions
            terms={formData.terms_conditions}
            errors={validationErrors.terms_conditions}
            loading={createLoading}
            onAdd={handleAddTerm}
            onChange={handleTermChange}
            onRemove={handleRemoveTerm}
          />

          <InvoicePreview
            basePrice={previewBasePrice}
            additionalCharge={formData.additional_charge}
            discount={formData.discount_price}
            advance={formData.advance_payment}
            total={
              previewBasePrice +
              Number(formData.additional_charge || 0) -
              Number(formData.discount_price || 0)
            }
            duePayment={
              previewBasePrice +
              Number(formData.additional_charge || 0) -
              Number(formData.discount_price || 0) -
              Number(formData.advance_payment || 0)
            }
          />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={createLoading}
              className="h-11 rounded-lg border border-gray-300 px-6 text-sm font-semibold text-gray-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={createLoading}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#b60018] px-6 text-sm font-semibold text-white"
            >
              <Save className="h-4 w-4" />

              {createLoading ? "Creating..." : "Create Invoice"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
};

export default CreateInvoiceSection;
