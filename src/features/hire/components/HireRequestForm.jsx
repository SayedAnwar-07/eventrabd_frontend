import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import GlobalErrorMessage from "@/components/common/GlobalErrorMessage";

import {
  clearHireOperationError,
  createHire,
  selectCreateHireError,
  selectCreateHireLoading,
} from "@/store/features/hire/hireSlice";

import HireBookingOptions from "./HireBookingOptions";
import HireBookingItemCard from "./HireBookingItemCard";
import HireBookingSummary from "./HireBookingSummary";

import {
  createBookingItem,
  createEmptySlot,
  getMinimumDateTime,
  MAX_BOOKING_SLOTS,
  normalizeItemToQuantityOne,
  normalizeOptionalText,
  PACKAGE_SUPPORTED_SERVICES,
} from "../utils/hireFormUtils";

const HireRequestForm = ({
  serviceId,
  serviceName,
  serviceCharge,
  packages = [],
  packagesLoading = false,
  packagesError = null,
  onSuccess,
}) => {
  const dispatch = useDispatch();

  const loading = useSelector(selectCreateHireLoading);

  const apiError = useSelector(selectCreateHireError);

  const supportsPackages = PACKAGE_SUPPORTED_SERVICES.includes(serviceName);

  /*
   * Stable value without useEffect/useMemo.
   */
  const [minimumDateTime] = useState(getMinimumDateTime);

  /*
   * Photography/Videography:
   * user first chooses normal or package.
   *
   * Other services:
   * normal booking is automatically active.
   */
  const [bookingMode, setBookingMode] = useState(() =>
    supportsPackages ? "" : "normal",
  );

  const [bookingItems, setBookingItems] = useState(() =>
    supportsPackages ? [] : [createBookingItem(null)],
  );

  const [customerWhatsappNumber, setCustomerWhatsappNumber] = useState("");

  const [customerNote, setCustomerNote] = useState("");

  const [fieldErrors, setFieldErrors] = useState({});

  const [formError, setFormError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const availablePackages = Array.isArray(packages) ? packages : [];

  /* =====================================
     HELPERS
  ====================================== */

  const clearCreateError = () => {
    if (apiError) {
      dispatch(clearHireOperationError("create"));
    }
  };

  const clearMessages = () => {
    setFormError("");
    setSuccessMessage("");
    clearCreateError();
  };

  const clearFieldError = (path) => {
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [path]: "",
    }));
  };

  const getPackageById = (packageId) => {
    return availablePackages.find(
      (item) => String(item?.id) === String(packageId),
    );
  };

  const getBookingItemInfo = (item) => {
    /*
     * packageId null = normal service.
     */
    if (!item.packageId) {
      return {
        title: "Book Service Normally",
        unitPrice: Number(serviceCharge),
      };
    }

    const selectedPackage = getPackageById(item.packageId);

    return {
      title: selectedPackage?.package_title || "Selected Package",

      unitPrice: Number(selectedPackage?.package_price),
    };
  };

  /* =====================================
     CALCULATED VALUES
  ====================================== */

  const totalQuantity = bookingItems.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0,
  );

  const pricesAvailable =
    bookingItems.length > 0 &&
    bookingItems.every((item) => {
      const { unitPrice } = getBookingItemInfo(item);

      return Number.isFinite(unitPrice);
    });

  const grandTotal = pricesAvailable
    ? bookingItems.reduce((total, item) => {
        const { unitPrice } = getBookingItemInfo(item);

        return total + unitPrice * Number(item.quantity || 1);
      }, 0)
    : null;

  /* =====================================
     NORMAL SERVICE
  ====================================== */

  const handleNormalServiceSelect = () => {
    if (loading) {
      return;
    }

    /*
     * Normal and packages are mutually exclusive.
     */
    setBookingMode("normal");

    setBookingItems([createBookingItem(null)]);

    setFieldErrors({});

    clearMessages();
  };

  /* =====================================
     PACKAGE MULTI SELECT
  ====================================== */

  const handlePackageToggle = (packageId) => {
    if (loading) {
      return;
    }

    const normalizedId = String(packageId);

    const alreadySelected =
      bookingMode === "packages" &&
      bookingItems.some((item) => String(item.packageId) === normalizedId);

    /*
     * Deselect package.
     */
    if (alreadySelected) {
      const nextItems = bookingItems.filter(
        (item) => String(item.packageId) !== normalizedId,
      );

      setBookingItems(nextItems);

      if (nextItems.length === 0) {
        setBookingMode("");
      }

      setFieldErrors({});

      clearMessages();

      return;
    }

    /*
     * First package.
     * Replaces normal service if selected.
     */
    if (bookingMode !== "packages") {
      setBookingMode("packages");

      setBookingItems([createBookingItem(normalizedId)]);

      setFieldErrors({});

      clearMessages();

      return;
    }

    if (bookingItems.length >= MAX_BOOKING_SLOTS) {
      setFormError(`Maximum ${MAX_BOOKING_SLOTS} packages can be selected.`);

      return;
    }

    /*
     * Important:
     * When another different package is selected,
     * all package quantities become 1.
     */
    const normalizedExistingItems = bookingItems.map(
      normalizeItemToQuantityOne,
    );

    setBookingItems([
      ...normalizedExistingItems,
      createBookingItem(normalizedId),
    ]);

    setFieldErrors({});

    clearMessages();
  };

  /* =====================================
     QUANTITY
  ====================================== */

  const handleIncreaseQuantity = () => {
    if (loading || bookingItems.length !== 1) {
      return;
    }

    const currentItem = bookingItems[0];

    if (currentItem.quantity >= MAX_BOOKING_SLOTS) {
      setFormError(`Maximum quantity is ${MAX_BOOKING_SLOTS}.`);

      return;
    }

    setBookingItems([
      {
        ...currentItem,

        quantity: currentItem.quantity + 1,

        eventTypes: [...currentItem.eventTypes, ""],

        bookingSlots: [...currentItem.bookingSlots, createEmptySlot()],
      },
    ]);

    setFieldErrors({});

    clearMessages();
  };

  const handleDecreaseQuantity = () => {
    if (loading || bookingItems.length !== 1) {
      return;
    }

    const currentItem = bookingItems[0];

    if (currentItem.quantity <= 1) {
      return;
    }

    setBookingItems([
      {
        ...currentItem,

        quantity: currentItem.quantity - 1,

        eventTypes: currentItem.eventTypes.slice(0, -1),

        bookingSlots: currentItem.bookingSlots.slice(0, -1),
      },
    ]);

    setFieldErrors({});

    clearMessages();
  };

  /* =====================================
     EVENT TYPE
  ====================================== */

  const handleEventTypeChange = (itemIndex, slotIndex, value) => {
    setBookingItems((currentItems) =>
      currentItems.map((item, currentItemIndex) => {
        if (currentItemIndex !== itemIndex) {
          return item;
        }

        const nextEventTypes = [...item.eventTypes];

        nextEventTypes[slotIndex] = value;

        return {
          ...item,
          eventTypes: nextEventTypes,
        };
      }),
    );

    clearFieldError(`booking_items.${itemIndex}.event_types.${slotIndex}`);

    clearFieldError(`booking_items.${itemIndex}.event_types`);

    clearMessages();
  };

  /* =====================================
     SLOT FIELDS
  ====================================== */

  const updateBookingField = (itemIndex, slotIndex, field, value) => {
    setBookingItems((currentItems) =>
      currentItems.map((item, currentItemIndex) => {
        if (currentItemIndex !== itemIndex) {
          return item;
        }

        const nextSlots = item.bookingSlots.map((slot, currentSlotIndex) =>
          currentSlotIndex === slotIndex
            ? {
                ...slot,
                [field]: value,
              }
            : slot,
        );

        return {
          ...item,
          bookingSlots: nextSlots,
        };
      }),
    );

    clearFieldError(
      `booking_items.${itemIndex}.booking_slots.${slotIndex}.${field}`,
    );

    clearMessages();
  };

  /* =====================================
     WHATSAPP
  ====================================== */

  const handleWhatsappChange = (value) => {
    let digitsOnly = value.replace(/\D/g, "");

    /*
     * User may paste +880...
     * Keep local 01XXXXXXXXX.
     */
    if (digitsOnly.startsWith("880")) {
      digitsOnly = digitsOnly.slice(2);
    }

    digitsOnly = digitsOnly.slice(0, 11);

    setCustomerWhatsappNumber(digitsOnly);

    clearFieldError("customer_whatsapp_number");

    clearMessages();
  };

  /* =====================================
     VALIDATION
  ====================================== */

  const validateForm = () => {
    const errors = {};

    if (bookingItems.length === 0) {
      errors.booking_option = "Choose normal service or at least one package.";
    }

    if (totalQuantity > MAX_BOOKING_SLOTS) {
      errors.booking_items = `Maximum ${MAX_BOOKING_SLOTS} bookings are allowed.`;
    }

    /*
     * Multiple different packages:
     * quantity must be exactly 1.
     */
    if (bookingItems.length > 1) {
      bookingItems.forEach((item, itemIndex) => {
        if (item.quantity !== 1) {
          errors[`booking_items.${itemIndex}.quantity`] =
            "Quantity must be 1 when multiple packages are selected.";
        }
      });
    }

    const usedDateTimes = new Set();

    bookingItems.forEach((item, itemIndex) => {
      /* -------------------------
           Quantity relationship
        -------------------------- */

      if (item.eventTypes.length !== item.quantity) {
        errors[`booking_items.${itemIndex}.event_types`] =
          "Event type count must match quantity.";
      }

      if (item.bookingSlots.length !== item.quantity) {
        errors[`booking_items.${itemIndex}.booking_slots`] =
          "Booking slot count must match quantity.";
      }

      /* -------------------------
           Event types
        -------------------------- */

      const selectedEvents = item.eventTypes.filter(Boolean);

      if (selectedEvents.length !== new Set(selectedEvents).size) {
        errors[`booking_items.${itemIndex}.event_types`] =
          "The same event type cannot be selected twice for the same booking option.";
      }

      item.eventTypes.forEach((eventType, slotIndex) => {
        if (!eventType) {
          errors[`booking_items.${itemIndex}.event_types.${slotIndex}`] =
            `Select an event type for Event ${slotIndex + 1}.`;
        }
      });

      /* -------------------------
           Booking slots
        -------------------------- */

      item.bookingSlots.forEach((slot, slotIndex) => {
        /*
         * Only first slot of whole Hire
         * is mandatory.
         */
        const isFirstBooking = itemIndex === 0 && slotIndex === 0;

        const startsAtPath = `booking_items.${itemIndex}.booking_slots.${slotIndex}.starts_at`;

        const venueNamePath = `booking_items.${itemIndex}.booking_slots.${slotIndex}.venue_name`;

        const venueAddressPath = `booking_items.${itemIndex}.booking_slots.${slotIndex}.venue_address`;

        if (isFirstBooking && !slot.starts_at) {
          errors[startsAtPath] = "Start date and time are required.";
        }

        if (isFirstBooking && !String(slot.venue_name || "").trim()) {
          errors[venueNamePath] = "Venue name is required.";
        }

        if (isFirstBooking && !String(slot.venue_address || "").trim()) {
          errors[venueAddressPath] = "Venue address is required.";
        }

        /* -------------------------
               Date validation
            -------------------------- */

        if (slot.starts_at) {
          const startsAt = new Date(slot.starts_at);

          if (Number.isNaN(startsAt.getTime())) {
            errors[startsAtPath] = "Enter a valid start date and time.";
          } else if (startsAt.getTime() <= Date.now()) {
            errors[startsAtPath] = "Start date and time must be in the future.";
          }

          if (usedDateTimes.has(slot.starts_at)) {
            errors[startsAtPath] = "This booking date and time is duplicated.";
          }

          usedDateTimes.add(slot.starts_at);
        }
      });
    });

    if (!customerWhatsappNumber.trim()) {
      errors.customer_whatsapp_number = "WhatsApp number is required.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  /* =====================================
     SUBMIT
  ====================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");
    setSuccessMessage("");

    clearCreateError();

    if (!serviceId) {
      setFormError("The selected service is unavailable.");

      return;
    }

    if (!validateForm()) {
      setFormError("Fix the highlighted fields before submitting.");

      return;
    }

    /*
     * New backend structure:
     *
     * Hire
     *   -> booking_items
     *      -> event_types
     *      -> booking_slots
     */
    const payload = {
      service: serviceId,

      customer_whatsapp_number: `+88${customerWhatsappNumber.trim()}`,

      customer_note: customerNote.trim(),

      booking_items: bookingItems.map((item) => ({
        /*
         * null = normal service
         * ID   = package
         */
        package: item.packageId || null,

        quantity: item.quantity,

        event_types: [...item.eventTypes],

        booking_slots: item.bookingSlots.map((slot) => ({
          starts_at: slot.starts_at
            ? new Date(slot.starts_at).toISOString()
            : null,

          venue_name: normalizeOptionalText(slot.venue_name),

          venue_address: normalizeOptionalText(slot.venue_address),

          google_map_link: normalizeOptionalText(slot.google_map_link),
        })),
      })),
    };

    try {
      const createdHire = await dispatch(createHire(payload)).unwrap();

      /*
       * Reset form after success.
       */
      if (supportsPackages) {
        setBookingMode("");
        setBookingItems([]);
      } else {
        setBookingMode("normal");

        setBookingItems([createBookingItem(null)]);
      }

      setCustomerWhatsappNumber("");
      setCustomerNote("");

      setFieldErrors({});

      setFormError("");

      setSuccessMessage("Your hire request was submitted successfully.");

      onSuccess?.(createdHire);
    } catch {
      /*
       * Redux keeps the API error.
       * GlobalErrorMessage displays it.
       */
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-8">
        {/* =====================================
            BOOKING OPTIONS
        ====================================== */}

        {supportsPackages && (
          <HireBookingOptions
            bookingMode={bookingMode}
            bookingItems={bookingItems}
            serviceCharge={serviceCharge}
            packages={availablePackages}
            packagesLoading={packagesLoading}
            packagesError={packagesError}
            loading={loading}
            bookingOptionError={fieldErrors.booking_option}
            onNormalServiceSelect={handleNormalServiceSelect}
            onPackageToggle={handlePackageToggle}
          />
        )}

        {/* =====================================
            SELECTED BOOKINGS
        ====================================== */}

        {bookingItems.length > 0 && (
          <section className="space-y-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-green-700">
                Selected Booking
              </p>

              <h3 className="mt-1 text-lg font-semibold text-gray-950">
                Your Booking Selection
              </h3>

              {bookingItems.length > 1 && (
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  Each package has its own event and booking information.
                  Quantity stays at 1 while multiple packages are selected.
                </p>
              )}
            </div>

            {bookingItems.map((item, itemIndex) => {
              const { title, unitPrice } = getBookingItemInfo(item);

              return (
                <HireBookingItemCard
                  key={item.key}
                  item={item}
                  itemIndex={itemIndex}
                  bookingItemsCount={bookingItems.length}
                  minimumDateTime={minimumDateTime}
                  loading={loading}
                  fieldErrors={fieldErrors}
                  title={title}
                  unitPrice={unitPrice}
                  onIncreaseQuantity={handleIncreaseQuantity}
                  onDecreaseQuantity={handleDecreaseQuantity}
                  onEventTypeChange={handleEventTypeChange}
                  onBookingFieldChange={updateBookingField}
                />
              );
            })}

            {/* =================================
                BOOKING SUMMARY
            ================================== */}

            <HireBookingSummary
              bookingOptionCount={bookingItems.length}
              totalQuantity={totalQuantity}
              grandTotal={grandTotal}
            />

            {/* =================================
                WHATSAPP
            ================================== */}

            <div>
              <label
                htmlFor="customer-whatsapp-number"
                className="mb-2 block text-sm font-medium text-gray-950"
              >
                WhatsApp Number
              </label>

              <div
                className={`flex h-11 w-full overflow-hidden ${
                  fieldErrors.customer_whatsapp_number
                    ? "border border-red-600"
                    : customerWhatsappNumber
                      ? "border border-green-700 bg-green-50"
                      : "border border-gray-300 bg-white"
                }`}
              >
                <span className="flex shrink-0 items-center pl-3 text-sm font-medium text-gray-700">
                  +88
                </span>

                <input
                  id="customer-whatsapp-number"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  value={customerWhatsappNumber}
                  disabled={loading}
                  placeholder="01XXXXXXXXX"
                  maxLength={11}
                  onChange={(event) => handleWhatsappChange(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent pl-1 pr-3 text-sm outline-none disabled:bg-gray-100"
                />
              </div>

              {fieldErrors.customer_whatsapp_number && (
                <p className="mt-2 text-xs text-red-600">
                  {fieldErrors.customer_whatsapp_number}
                </p>
              )}

              <p className="mt-1 text-xs text-gray-500">
                One WhatsApp number will be used for the entire hire request.
              </p>
            </div>

            {/* =================================
                CUSTOMER NOTE
            ================================== */}

            <div>
              <label
                htmlFor="customer-note"
                className="mb-2 block text-sm font-medium text-gray-950"
              >
                Customer Note
              </label>

              <textarea
                id="customer-note"
                rows={4}
                maxLength={1000}
                value={customerNote}
                disabled={loading}
                onChange={(event) => {
                  setCustomerNote(event.target.value);

                  clearMessages();
                }}
                className={`w-full resize-none rounded-none px-3 py-3 text-sm outline-none ${
                  customerNote.trim()
                    ? "border border-green-700 bg-green-50"
                    : "border border-gray-300 bg-white"
                }`}
              />

              <p className="mt-1 text-right text-xs text-gray-500">
                {customerNote.length}/1000
              </p>
            </div>
          </section>
        )}

        {/* =====================================
            GENERAL ERRORS
        ====================================== */}

        {fieldErrors.booking_items && (
          <div className="border-l-2 border-red-600 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">{fieldErrors.booking_items}</p>
          </div>
        )}

        {formError && (
          <div className="border-l-2 border-red-600 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">{formError}</p>
          </div>
        )}

        {apiError && <GlobalErrorMessage error={apiError} />}

        {successMessage && (
          <div className="border-l-2 border-green-700 bg-green-50 px-4 py-3">
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        )}

        {/* =====================================
            SUBMIT
        ====================================== */}

        <button
          type="submit"
          disabled={loading || !serviceId || bookingItems.length === 0}
          className="w-full bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {loading ? "Submitting Request..." : "Submit Hire Request"}
        </button>
      </div>
    </form>
  );
};

export default HireRequestForm;
