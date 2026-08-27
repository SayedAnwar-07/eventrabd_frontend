import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { FilePenLine, Save } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import InvoiceFormFields from "./InvoiceFormFields";
import TermsConditions from "./TermsConditions";

import {
  clearInvoiceError,
  clearInvoiceSuccessMessage,
  selectInvoiceError,
  selectInvoiceUpdateLoading,
  updateInvoice,
} from "@/store/features/invoice/invoiceSlice";

import { getLocalToday } from "../utils/date";

import { toDecimalString } from "../utils/currency";

import { getErrorMessage } from "../utils/validation";
import InvoiceSlotShifts from "./InvoiceSlotShifts";

const MAX_TERMS_CONDITIONS = 3;
const MAX_TERM_LENGTH = 300;
const MAX_ADDITIONAL_CHARGE_REASON_LENGTH = 255;

const normalizeTermsConditions = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.slice(0, MAX_TERMS_CONDITIONS).map((term) => String(term ?? ""));
};

const buildInitialSlotShifts = (breakdown = []) => {
  const slotShifts = {};

  breakdown.forEach((entry) => {
    if (!entry?.booking_slot_id) {
      return;
    }

    slotShifts[entry.booking_slot_id] = String(entry.shift_count ?? 1);
  });

  return slotShifts;
};

const toIntegerString = (value) => {
  if (value === null || value === undefined || value === "") return "";

  const number = Number(value);

  return Number.isFinite(number) ? String(Math.trunc(number)) : "";
};

const getInitialFormData = (invoice, breakdown = []) => ({
  due_payment_last_date: invoice?.due_payment_last_date || "",

  slot_shifts: buildInitialSlotShifts(breakdown),

  additional_charge: toIntegerString(invoice?.additional_charge),

  additional_charge_reason: invoice?.additional_charge_reason || "",

  discount_price: toIntegerString(invoice?.discount_price),

  advance_payment: toIntegerString(invoice?.advance_payment),

  seller_note: invoice?.seller_note || "",

  terms_conditions: normalizeTermsConditions(invoice?.terms_conditions),
});

const EditInvoiceDialog = ({ invoice }) => {
  const dispatch = useDispatch();

  const updateLoading = useSelector(selectInvoiceUpdateLoading);

  const apiError = useSelector(selectInvoiceError);

  const breakdown = Array.isArray(invoice?.service_summary?.breakdown)
    ? invoice.service_summary.breakdown.filter((entry) =>
        Boolean(entry?.booking_slot_id),
      )
    : [];

  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState(() =>
    getInitialFormData(invoice, breakdown),
  );

  const [validationErrors, setValidationErrors] = useState({});

  const [localMessage, setLocalMessage] = useState("");

  const today = getLocalToday();

  const additionalChargeAmount =
    formData.additional_charge === "" ? 0 : Number(formData.additional_charge);

  const hasAdditionalCharge =
    Number.isFinite(additionalChargeAmount) && additionalChargeAmount > 0;

  const handleOpenChange = (nextOpen) => {
    if (updateLoading) {
      return;
    }

    if (nextOpen) {
      setFormData(getInitialFormData(invoice, breakdown));

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

      ...(name === "additional_charge"
        ? {
            additional_charge_reason: null,
          }
        : {}),
    }));

    setLocalMessage("");

    if (apiError) {
      dispatch(clearInvoiceError());
    }
  };

  const handleSlotShiftChange = (slotId, value) => {
    setFormData((currentData) => ({
      ...currentData,

      slot_shifts: {
        ...currentData.slot_shifts,
        [slotId]: value,
      },
    }));

    setValidationErrors((currentErrors) => {
      if (!currentErrors.slot_shifts) {
        return currentErrors;
      }

      const currentSlotErrors = {
        ...currentErrors.slot_shifts,
      };

      delete currentSlotErrors[slotId];

      return {
        ...currentErrors,

        slot_shifts: currentSlotErrors,
      };
    });

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

    setValidationErrors((currentErrors) => ({
      ...currentErrors,

      terms_conditions: Array.isArray(currentErrors.terms_conditions)
        ? currentErrors.terms_conditions.filter(
            (_, termIndex) => termIndex !== index,
          )
        : null,
    }));

    setLocalMessage("");

    if (apiError) {
      dispatch(clearInvoiceError());
    }
  };

  const validateForm = () => {
    const errors = {};

    const currentDiscountPrice = Number(formData.discount_price);

    const currentAdvancePayment = Number(formData.advance_payment);

    const currentAdditionalCharge =
      formData.additional_charge === ""
        ? 0
        : Number(formData.additional_charge);

    const currentAdditionalChargeReason =
      formData.additional_charge_reason.trim();

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
    }

    if (breakdown.length === 0) {
      errors.slot_shifts_general =
        "The invoice response has no service_summary.breakdown entries to edit.";
    } else {
      const slotErrors = {};

      breakdown.forEach((entry) => {
        const rawValue = formData.slot_shifts[entry.booking_slot_id];

        const shiftValue = Number(rawValue);

        if (
          rawValue === "" ||
          rawValue === undefined ||
          !Number.isInteger(shiftValue) ||
          shiftValue < 1
        ) {
          slotErrors[entry.booking_slot_id] =
            "Enter at least 1 shift for this event.";
        }
      });

      if (Object.keys(slotErrors).length > 0) {
        errors.slot_shifts = slotErrors;
      }
    }

    if (
      !Number.isFinite(currentAdditionalCharge) ||
      currentAdditionalCharge < 0
    ) {
      errors.additional_charge = "Additional charge cannot be negative.";
    }

    if (
      currentAdditionalChargeReason.length > MAX_ADDITIONAL_CHARGE_REASON_LENGTH
    ) {
      errors.additional_charge_reason = `Additional charge reason cannot contain more than ${MAX_ADDITIONAL_CHARGE_REASON_LENGTH} characters.`;
    } else if (currentAdditionalCharge > 0 && !currentAdditionalChargeReason) {
      errors.additional_charge_reason =
        "Additional charge reason is required when additional charge is greater than zero.";
    }

    if (
      formData.discount_price === "" ||
      !Number.isFinite(currentDiscountPrice) ||
      currentDiscountPrice < 0
    ) {
      errors.discount_price = "Discount price cannot be negative.";
    }

    if (
      formData.advance_payment === "" ||
      !Number.isFinite(currentAdvancePayment) ||
      currentAdvancePayment < 0
    ) {
      errors.advance_payment = "Advance payment cannot be negative.";
    }

    setValidationErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const getChangedSlotShifts = () => {
    const nextSlotShifts = breakdown.map((entry) => ({
      booking_slot: entry.booking_slot_id,
      shift_count: Number(formData.slot_shifts[entry.booking_slot_id]),
    }));

    const currentSlotShifts = breakdown.map((entry) => ({
      booking_slot: entry.booking_slot_id,

      shift_count: Number(entry.shift_count),
    }));

    const hasChanged =
      JSON.stringify(nextSlotShifts) !== JSON.stringify(currentSlotShifts);

    return hasChanged ? nextSlotShifts : null;
  };

  const getChangedFields = () => {
    const changedFields = {};

    const changedSlotShifts = getChangedSlotShifts();

    if (changedSlotShifts) {
      changedFields.slot_shifts = changedSlotShifts;
    }

    const nextAdditionalCharge = toDecimalString(formData.additional_charge);

    const currentAdditionalCharge = toDecimalString(invoice?.additional_charge);

    if (nextAdditionalCharge !== currentAdditionalCharge) {
      changedFields.additional_charge = nextAdditionalCharge;
    }

    const nextAdditionalChargeReason = formData.additional_charge_reason.trim();

    const currentAdditionalChargeReason = String(
      invoice?.additional_charge_reason || "",
    ).trim();

    if (nextAdditionalChargeReason !== currentAdditionalChargeReason) {
      changedFields.additional_charge_reason = nextAdditionalChargeReason;
    }

    const nextDiscountPrice = toDecimalString(formData.discount_price);

    const currentDiscountPrice = toDecimalString(invoice?.discount_price);

    if (nextDiscountPrice !== currentDiscountPrice) {
      changedFields.discount_price = nextDiscountPrice;
    }

    const nextAdvancePayment = toDecimalString(formData.advance_payment);

    const currentAdvancePayment = toDecimalString(invoice?.advance_payment);

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
      // Redux handles API error
    }
  };

  const calculatePreviewPrice = () => {
    return breakdown.reduce((total, entry) => {
      const shiftCount =
        Number(formData.slot_shifts[entry.booking_slot_id]) || 1;

      const unitPrice =
        entry?.unit_price === null ||
        entry?.unit_price === undefined ||
        entry?.unit_price === ""
          ? 0
          : Number(entry.unit_price);

      if (!Number.isFinite(unitPrice)) {
        return total;
      }

      return total + unitPrice * shiftCount;
    }, 0);
  };

  const calculatedBasePrice = calculatePreviewPrice();

  const previewBasePrice =
    calculatedBasePrice > 0
      ? calculatedBasePrice
      : Number(invoice?.total_booking_price || 0);

  const previewTotal =
    previewBasePrice +
    Number(formData.additional_charge || 0) -
    Number(formData.discount_price || 0);

  const previewDuePayment =
    previewTotal - Number(formData.advance_payment || 0);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          disabled={!invoice?.can_edit}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#b60018] px-6 text-sm font-semibold text-white transition hover:bg-[#960014] disabled:bg-gray-300 lg:w-auto"
        >
          Edit Invoice
        </button>
      </DialogTrigger>

      <DialogContent className="max-h-[92vh] overflow-y-auto border-gray-200 bg-white p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-gray-200 px-6 py-5 text-left sm:px-8">
          <DialogTitle className="text-xl text-gray-950">
            Edit Invoice
          </DialogTitle>

          <DialogDescription>
            Update payment information for{" "}
            <span className="font-semibold">{invoice?.invoice_number}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6 sm:px-8">
          {apiError ? (
            <div className="border-l-2 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700">
              {getErrorMessage(apiError)}
            </div>
          ) : null}

          {localMessage ? (
            <div className="border-l-2 border-amber-600 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {localMessage}
            </div>
          ) : null}

          <InvoiceSlotShifts
            bookingRows={breakdown}
            slotShifts={formData.slot_shifts}
            errors={validationErrors}
            loading={updateLoading}
            onChange={handleSlotShiftChange}
          />

          <InvoiceFormFields
            formData={formData}
            validationErrors={validationErrors}
            loading={updateLoading}
            today={today}
            hasAdditionalCharge={hasAdditionalCharge}
            onChange={handleChange}
            basePrice={previewBasePrice}
            total={previewTotal}
            duePayment={previewDuePayment}
          />

          <TermsConditions
            terms={formData.terms_conditions}
            errors={validationErrors.terms_conditions}
            loading={updateLoading}
            onAdd={handleAddTerm}
            onChange={handleTermChange}
            onRemove={handleRemoveTerm}
          />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              disabled={updateLoading}
              onClick={() => handleOpenChange(false)}
              className="h-11 rounded-lg border border-gray-300 px-6 text-sm font-semibold text-gray-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={updateLoading || !invoice?.can_edit}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#b60018] px-6 text-sm font-semibold text-white"
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
