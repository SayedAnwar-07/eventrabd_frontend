import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CalendarDays,
  Check,
  CircleDollarSign,
  FilePlus2,
  ListChecks,
  Plus,
  Save,
  Trash2,
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

const MAX_TERMS_CONDITIONS = 3;
const MAX_TERM_LENGTH = 300;
const MAX_ADDITIONAL_CHARGE_REASON_LENGTH = 255;

const getLocalToday = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getServiceName = (hire) => {
  return (
    hire?.service?.service_display_name ||
    hire?.service?.service_name ||
    hire?.service?.name ||
    "Service"
  );
};

const getLegacyBookingTitle = (hire) => {
  return (
    hire?.package_title_snapshot ||
    hire?.booking_title ||
    getServiceName(hire) ||
    "Booking"
  );
};

const getLegacyUnitPrice = (hire) => {
  const isPackageHire = Boolean(hire?.package || hire?.is_package_hire);

  if (isPackageHire) {
    return hire?.package_price_snapshot ?? null;
  }

  return hire?.service?.shift_charge ?? null;
};

/*
 * New Hire source of truth:
 * booking_items -> booking_slots.
 *
 * The top-level booking_slots array is still used when present because the
 * Hire detail response may expose the same slots in flattened form. Each slot
 * is enriched with its exact booking item's title/unit_price by matching IDs.
 */
const buildBookingRows = (hire) => {
  const bookingItems = Array.isArray(hire?.booking_items)
    ? hire.booking_items
    : [];

  const topLevelSlots = Array.isArray(hire?.booking_slots)
    ? hire.booking_slots
    : [];

  const itemById = new Map();
  const itemMetaBySlotId = new Map();
  const nestedSlots = [];

  bookingItems.forEach((item) => {
    if (item?.id) {
      itemById.set(String(item.id), item);
    }

    const itemSlots = Array.isArray(item?.booking_slots)
      ? item.booking_slots
      : [];

    itemSlots.forEach((slot) => {
      if (!slot?.id) {
        return;
      }

      nestedSlots.push(slot);
      itemMetaBySlotId.set(String(slot.id), {
        item,
        nestedSlot: slot,
      });
    });
  });

  const sourceSlots = topLevelSlots.length > 0 ? topLevelSlots : nestedSlots;

  return sourceSlots
    .filter((slot) => Boolean(slot?.id))
    .map((slot) => {
      const slotId = String(slot.id);
      const nestedMeta = itemMetaBySlotId.get(slotId);

      const rawBookingItemId =
        slot?.booking_item_id ||
        (typeof slot?.booking_item === "string"
          ? slot.booking_item
          : slot?.booking_item?.id) ||
        nestedMeta?.item?.id ||
        null;

      const bookingItem =
        nestedMeta?.item ||
        (rawBookingItemId ? itemById.get(String(rawBookingItemId)) : undefined);

      const mergedSlot = {
        ...(nestedMeta?.nestedSlot || {}),
        ...slot,
      };

      const isPackage = bookingItem
        ? (bookingItem?.is_package ?? Boolean(bookingItem?.package))
        : Boolean(hire?.package || hire?.is_package_hire);

      const bookingTitle =
        bookingItem?.booking_title || getLegacyBookingTitle(hire);

      const unitPrice =
        bookingItem?.unit_price ??
        (bookingItem
          ? isPackage
            ? null
            : (hire?.service?.shift_charge ?? null)
          : getLegacyUnitPrice(hire));

      return {
        ...mergedSlot,
        booking_item_id: bookingItem?.id || rawBookingItemId,
        booking_title: bookingTitle,
        unit_price: unitPrice,
        is_package: isPackage,
      };
    });
};

// One row per required Hire booking slot:
// { [booking_slot_id]: "shift count string" }
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

const toDecimalString = (value) => {
  if (value === "" || value === null || value === undefined) {
    return "0.00";
  }

  const amount = Number(value);

  return Number.isFinite(amount) ? amount.toFixed(2) : "0.00";
};

const formatMoney = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return null;
  }

  return `৳${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatSlotDate = (slot) => {
  const rawDate = slot?.starts_at || slot?.date || slot?.booking_date;

  if (!rawDate) {
    return "Date not set";
  }

  const parsedDate = new Date(rawDate);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(rawDate);
  }

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatEventType = (value) => {
  if (!value) {
    return "Event";
  }

  if (value === "akhd_walima") {
    return "Akhd/Walima";
  }

  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const getBookingTitle = (hire, bookingRows) => {
  if (hire?.booking_title) {
    return hire.booking_title;
  }

  const uniqueTitles = [
    ...new Set(
      bookingRows
        .map((row) => row?.booking_title)
        .filter((title) => Boolean(title)),
    ),
  ];

  if (uniqueTitles.length === 1) {
    return uniqueTitles[0];
  }

  if (uniqueTitles.length > 1) {
    return `${getServiceName(hire)} (${uniqueTitles.length} booking options)`;
  }

  return getLegacyBookingTitle(hire);
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

const FormField = ({
  id,
  label,
  icon: Icon,
  error,
  optionalText,
  children,
}) => {
  return (
    <div>
      <label
        htmlFor={id}
        className="flex items-center gap-2 text-sm font-semibold text-gray-800"
      >
        {Icon ? <Icon className="h-4 w-4 text-[#b60018]" /> : null}

        <span>{label}</span>

        {optionalText ? (
          <span className="text-xs font-normal text-gray-500">
            {optionalText}
          </span>
        ) : null}
      </label>

      {children}

      {error ? <p className="mt-1.5 text-sm text-red-600">{error}</p> : null}
    </div>
  );
};

const PreviewItem = ({ label, value, displayValue, emphasized = false }) => {
  const content =
    displayValue !== undefined ? displayValue : formatMoney(value) || "৳0.00";

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
          emphasized
            ? "text-sm font-bold sm:text-base"
            : "text-sm font-semibold text-gray-950"
        }`}
      >
        {content}
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

  /*
   * IMPORTANT:
   * Do not filter out starts_at = null slots.
   * The backend requires one slot_shifts entry for every required booking slot,
   * and currently requires every selected booking slot to have starts_at before
   * an invoice can be created.
   */
  const bookingRows = buildBookingRows(hire);
  const undatedBookingRows = bookingRows.filter((slot) => !slot?.starts_at);

  const [formData, setFormData] = useState(() =>
    getInitialFormData(bookingRows),
  );

  const [validationErrors, setValidationErrors] = useState({});

  const today = getLocalToday();

  const slotCount = bookingRows.length;

  const shiftHourPerSlot = Number(hire?.service?.shift_hour || 0);

  const totalShiftCount = bookingRows.reduce((sum, slot) => {
    const value = Number(formData.slot_shifts[slot.id]);

    return sum + (Number.isFinite(value) ? value : 0);
  }, 0);

  const bookedTotalShiftHours = shiftHourPerSlot * slotCount;
  const totalShiftHours = shiftHourPerSlot * totalShiftCount;

  const additionalChargeAmount =
    formData.additional_charge === "" ? 0 : Number(formData.additional_charge);

  const hasAdditionalCharge =
    Number.isFinite(additionalChargeAmount) && additionalChargeAmount > 0;

  const hasAllPreviewUnitPrices =
    bookingRows.length > 0 &&
    bookingRows.every((slot) => {
      if (
        slot?.unit_price === null ||
        slot?.unit_price === undefined ||
        slot?.unit_price === ""
      ) {
        return false;
      }

      return Number.isFinite(Number(slot.unit_price));
    });

  const previewBasePrice = hasAllPreviewUnitPrices
    ? bookingRows.reduce((total, slot) => {
        const unitPrice = Number(slot.unit_price);
        const shiftCount = Number(formData.slot_shifts[slot.id]);

        if (
          !Number.isFinite(unitPrice) ||
          !Number.isFinite(shiftCount) ||
          shiftCount < 1
        ) {
          return total;
        }

        return total + unitPrice * shiftCount;
      }, 0)
    : null;

  const previewAdditionalCharge = Number.isFinite(
    Number(formData.additional_charge),
  )
    ? Number(formData.additional_charge)
    : 0;

  const previewDiscount = Number.isFinite(Number(formData.discount_price))
    ? Number(formData.discount_price)
    : 0;

  const previewAdvance = Number.isFinite(Number(formData.advance_payment))
    ? Number(formData.advance_payment)
    : 0;

  const previewTotal =
    previewBasePrice !== null
      ? previewBasePrice + previewAdditionalCharge - previewDiscount
      : null;

  const previewDuePayment =
    previewTotal !== null ? previewTotal - previewAdvance : null;

  const bookingTitle = getBookingTitle(hire, bookingRows);

  const isEligible =
    hire?.status === "accepted" &&
    hire?.is_accept === true &&
    hire?.can_create_invoice === true;

  const canStartInvoice =
    isEligible && bookingRows.length > 0 && undatedBookingRows.length === 0;

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

    if (bookingRows.length === 0) {
      setValidationErrors({
        slot_shifts_general:
          "This hire has no booking slots. An invoice cannot be created until the Hire has its required booking slots.",
      });
      return;
    }

    if (undatedBookingRows.length > 0) {
      setValidationErrors({
        slot_shifts_general:
          "Invoice creation is blocked because one or more required Hire booking slots do not have a booking date (starts_at). This is a Hire-side workflow issue and those slots must be completed before creating the invoice.",
      });
      return;
    }

    setFormData(getInitialFormData(bookingRows));
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
      ...(name === "additional_charge"
        ? {
            additional_charge_reason: null,
          }
        : {}),
    }));

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

    setFormData((currentData) => ({
      ...currentData,
      terms_conditions: [...currentData.terms_conditions, ""],
    }));

    setValidationErrors((currentErrors) => ({
      ...currentErrors,
      terms_conditions: null,
    }));

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

    if (apiError) {
      dispatch(clearInvoiceError());
    }
  };

  const handleRemoveTerm = (index) => {
    if (createLoading) {
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

    if (apiError) {
      dispatch(clearInvoiceError());
    }
  };

  const validateForm = () => {
    const errors = {};

    const discountPrice = Number(formData.discount_price);
    const advancePayment = Number(formData.advance_payment);

    const additionalCharge =
      formData.additional_charge === ""
        ? 0
        : Number(formData.additional_charge);

    const additionalChargeReason = formData.additional_charge_reason.trim();

    if (bookingRows.length === 0) {
      errors.slot_shifts_general =
        "This hire has no booking slots. An invoice cannot be created yet.";
    } else if (undatedBookingRows.length > 0) {
      errors.slot_shifts_general =
        "Every required Hire booking slot must have starts_at before an invoice can be created. Complete the missing booking dates first.";
    } else {
      const slotErrors = {};

      bookingRows.forEach((slot) => {
        const rawValue = formData.slot_shifts[slot.id];
        const shiftValue = Number(rawValue);

        if (
          rawValue === "" ||
          rawValue === undefined ||
          !Number.isInteger(shiftValue) ||
          shiftValue < 1
        ) {
          slotErrors[slot.id] = "Enter at least 1 shift for this event.";
        }
      });

      if (Object.keys(slotErrors).length > 0) {
        errors.slot_shifts = slotErrors;
      }
    }

    const termsConditions = Array.isArray(formData.terms_conditions)
      ? formData.terms_conditions
      : [];

    const termErrors = termsConditions.map((term) => {
      const cleanedTerm = String(term || "").trim();

      if (!cleanedTerm) {
        return "Term cannot be empty.";
      }

      if (cleanedTerm.length > MAX_TERM_LENGTH) {
        return `Term cannot contain more than ${MAX_TERM_LENGTH} characters.`;
      }

      return null;
    });

    if (termsConditions.length > MAX_TERMS_CONDITIONS) {
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

    if (!Number.isFinite(additionalCharge) || additionalCharge < 0) {
      errors.additional_charge = "Additional charge cannot be negative.";
    }

    if (additionalChargeReason.length > MAX_ADDITIONAL_CHARGE_REASON_LENGTH) {
      errors.additional_charge_reason = `Additional charge reason cannot contain more than ${MAX_ADDITIONAL_CHARGE_REASON_LENGTH} characters.`;
    } else if (
      Number.isFinite(additionalCharge) &&
      additionalCharge > 0 &&
      !additionalChargeReason
    ) {
      errors.additional_charge_reason =
        "Additional charge reason is required when additional charge is greater than zero.";
    }

    if (
      formData.discount_price === "" ||
      !Number.isFinite(discountPrice) ||
      discountPrice < 0
    ) {
      errors.discount_price = "Discount price cannot be negative.";
    }

    if (
      formData.advance_payment === "" ||
      !Number.isFinite(advancePayment) ||
      advancePayment < 0
    ) {
      errors.advance_payment = "Advance payment cannot be negative.";
    }

    /*
     * Do not validate discount/advance maximums by calculating service_price
     * in the frontend. slot_shifts can change the backend service_price, so
     * the backend remains authoritative for those cross-field limits.
     */

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

    const additionalChargeReason = formData.additional_charge_reason.trim();

    const invoiceData = {
      hire: hire.id,

      /*
       * Submit exactly one entry for every required Hire booking slot.
       * No slot is silently removed from the request.
       */
      slot_shifts: bookingRows.map((slot) => ({
        booking_slot: slot.id,
        shift_count: Number(formData.slot_shifts[slot.id]),
      })),

      due_payment_last_date: formData.due_payment_last_date,

      additional_charge: toDecimalString(formData.additional_charge),

      discount_price: toDecimalString(formData.discount_price),

      advance_payment: toDecimalString(formData.advance_payment),

      seller_note: formData.seller_note.trim(),

      terms_conditions: formData.terms_conditions.map((term) => term.trim()),
    };

    if (additionalChargeReason) {
      invoiceData.additional_charge_reason = additionalChargeReason;
    }

    try {
      const invoice = await dispatch(createInvoice(invoiceData)).unwrap();

      /*
       * Backend response is the financial source of truth from here onward.
       * service_price is never submitted or authoritatively calculated here.
       */
      setCreatedInvoice(invoice);

      setIsOpen(false);
      setValidationErrors({});
    } catch {
      // Existing Redux/global API error handling stores the backend error.
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
                  This accepted hire is ready for invoice creation. Each booking
                  slot keeps its exact service/package booking item, while the
                  backend calculates the authoritative invoice price.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpen}
              disabled={!canStartInvoice}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#b60018] px-6 text-sm font-semibold text-white transition hover:bg-[#960014] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
            >
              <FilePlus2 className="h-4 w-4" />
              Create Invoice
            </button>
          </div>
        </div>

        {bookingRows.length === 0 ? (
          <div className="border-b border-amber-200 bg-amber-50 px-6 py-4 text-sm leading-6 text-amber-800 sm:px-8">
            Invoice creation is blocked because this Hire has no booking slots.
          </div>
        ) : null}

        {undatedBookingRows.length > 0 ? (
          <div className="border-b border-amber-200 bg-amber-50 px-6 py-4 text-sm leading-6 text-amber-800 sm:px-8">
            Invoice creation is blocked because {undatedBookingRows.length}{" "}
            required booking slot{undatedBookingRows.length === 1 ? "" : "s"}{" "}
            {undatedBookingRows.length === 1 ? "does" : "do"} not have a booking
            date yet. This must be resolved in the Hire workflow before creating
            the invoice.
          </div>
        ) : null}

        <div className="grid gap-5 px-6 py-6 sm:grid-cols-3 sm:px-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">
              Booking Slots
            </p>

            <p className="mt-1 text-lg font-semibold text-gray-950">
              {slotCount}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">
              Base Shift Hours
            </p>

            <p className="mt-1 text-lg font-semibold text-gray-950">
              {bookedTotalShiftHours} Hours
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">
              Base Price
            </p>

            <p className="mt-1 text-sm font-semibold text-[#b60018]">
              Calculated by backend
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
                  {bookingTitle}
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

        {validationErrors.slot_shifts_general ? (
          <div
            role="alert"
            className="mb-6 border-l-2 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {validationErrors.slot_shifts_general}
          </div>
        ) : null}

        {/* Per-booking-slot shift counts */}
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-[#b60018]" />

            <h3 className="text-sm font-semibold text-gray-800">
              Shift Count per Booked Event
            </h3>
          </div>

          <p className="mt-1 text-xs leading-5 text-gray-500">
            Set the shift count for every Hire booking slot. Each row keeps its
            exact normal-service/package booking item. Final pricing is
            calculated and validated by the backend.
          </p>

          <div className="mt-4 space-y-3">
            {bookingRows.map((slot) => {
              const slotError = validationErrors.slot_shifts?.[slot.id];

              const eventLabel = formatEventType(slot?.event_type);
              const eventDate = formatSlotDate(slot);
              const unitPrice = formatMoney(slot?.unit_price);

              return (
                <div
                  key={slot.id}
                  className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50">
                      <CalendarDays className="h-4 w-4 text-[#b60018]" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-950">
                        {slot?.booking_title || "Booking"}
                      </p>

                      <p className="mt-0.5 text-xs text-gray-600">
                        {eventLabel} · {eventDate}
                      </p>

                      <p className="mt-1 text-xs font-medium text-[#b60018]">
                        {unitPrice
                          ? `${unitPrice} per shift`
                          : "Unit price will be resolved by backend"}
                      </p>
                    </div>
                  </div>

                  <div className="sm:w-40">
                    <label
                      htmlFor={`slot-shift-${slot.id}`}
                      className="sr-only"
                    >
                      Shift count for {slot?.booking_title || eventLabel} on{" "}
                      {eventDate}
                    </label>

                    <input
                      id={`slot-shift-${slot.id}`}
                      type="number"
                      min="1"
                      step="1"
                      inputMode="numeric"
                      value={formData.slot_shifts[slot.id] ?? ""}
                      onChange={(event) =>
                        handleSlotShiftChange(slot.id, event.target.value)
                      }
                      disabled={createLoading}
                      aria-invalid={Boolean(slotError)}
                      className={`h-10 w-full rounded-lg border bg-white px-3 text-sm text-gray-950 outline-none transition disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60 ${
                        slotError
                          ? "border-red-400 focus:border-red-600 focus:ring-2 focus:ring-red-100"
                          : "border-gray-300 focus:border-[#b60018] focus:ring-2 focus:ring-red-100"
                      }`}
                    />

                    {slotError ? (
                      <p className="mt-1 text-xs text-red-600">{slotError}</p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-3 text-xs text-gray-500">
            {totalShiftCount} Total Shift
            {totalShiftCount === 1 ? "" : "s"} · {shiftHourPerSlot} Hours ×{" "}
            {totalShiftCount} Shifts = {totalShiftHours} Hours
          </p>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
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
              inputMode="decimal"
              value={formData.additional_charge}
              onChange={handleChange}
              disabled={createLoading}
              aria-invalid={Boolean(validationErrors.additional_charge)}
              className="mt-2 h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-950 outline-none transition focus:border-[#b60018] focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60"
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
              maxLength={MAX_ADDITIONAL_CHARGE_REASON_LENGTH}
              value={formData.additional_charge_reason}
              onChange={handleChange}
              disabled={createLoading}
              required={hasAdditionalCharge}
              aria-invalid={Boolean(validationErrors.additional_charge_reason)}
              placeholder={
                hasAdditionalCharge
                  ? "Explain why this additional charge is being added."
                  : "Optional reason for the additional charge."
              }
              className="mt-2 w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-gray-950 outline-none transition focus:border-[#b60018] focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60"
            />

            <div className="mt-1 flex justify-end">
              <p className="text-[11px] text-gray-400">
                {formData.additional_charge_reason.length}/
                {MAX_ADDITIONAL_CHARGE_REASON_LENGTH}
              </p>
            </div>
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
                createLoading ||
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
                    key={`invoice-term-${index}`}
                    className="rounded-xl border border-gray-200 bg-gray-50 p-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-50 text-xs font-bold text-[#b60018]">
                        {index + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <label
                          htmlFor={`invoice-term-${index}`}
                          className="sr-only"
                        >
                          Term {index + 1}
                        </label>

                        <textarea
                          id={`invoice-term-${index}`}
                          rows={2}
                          maxLength={MAX_TERM_LENGTH}
                          value={term}
                          onChange={(event) =>
                            handleTermChange(index, event.target.value)
                          }
                          disabled={createLoading}
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
                        disabled={createLoading}
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

        <div className="mt-7 rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
          <div>
            <h3 className="font-semibold text-gray-950">Financial Preview</h3>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              Base price, total and due payment are calculated by the backend.
              The frontend never submits service_price and does not combine
              booking-item prices into an authoritative invoice total.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <PreviewItem
              label="Base Price"
              value={previewBasePrice ?? 0}
              displayValue={
                previewBasePrice === null ? "Backend calculated" : undefined
              }
            />

            <PreviewItem
              label="Additional Charge"
              value={formData.additional_charge || 0}
            />

            <PreviewItem label="Discount" value={formData.discount_price} />

            <PreviewItem label="Advance" value={formData.advance_payment} />

            <PreviewItem
              label="Total"
              value={previewTotal ?? 0}
              displayValue={
                previewTotal === null ? "Backend calculated" : undefined
              }
            />

            <PreviewItem
              label="Due Payment"
              value={previewDuePayment ?? 0}
              displayValue={
                previewDuePayment === null ? "Backend calculated" : undefined
              }
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
