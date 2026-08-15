import HireBookingSlotFields from "./HireBookingSlotFields";

import { formatPrice, MAX_BOOKING_SLOTS } from "../utils/hireFormUtils";

const HireBookingItemCard = ({
  item,
  itemIndex,
  bookingItemsCount,
  minimumDateTime,
  loading = false,
  fieldErrors = {},
  title,
  unitPrice,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onEventTypeChange,
  onBookingFieldChange,
}) => {
  const canChangeQuantity = bookingItemsCount === 1;

  const itemTotal = Number.isFinite(Number(unitPrice))
    ? Number(unitPrice) * Number(item.quantity || 1)
    : null;

  const quantityError =
    fieldErrors[`booking_items.${itemIndex}.quantity`] || "";

  return (
    <div className="border border-green-700 bg-white">
      {/* ================================
          HEADER
      ================================= */}
      <div className="border-b border-green-200 bg-green-50 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-green-700">
              Booking {itemIndex + 1}
            </p>

            <h4 className="mt-1 text-lg font-semibold text-green-950">
              {title}
            </h4>

            <p className="mt-1 text-sm font-semibold text-green-700">
              {formatPrice(unitPrice) || "Price unavailable"} per booking
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Amount
            </p>

            <p className="mt-1 text-xl font-bold text-green-800">
              {itemTotal !== null ? formatPrice(itemTotal) : "Unavailable"}
            </p>
          </div>
        </div>

        {/* ================================
            QUANTITY
        ================================= */}
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-600">
            Quantity
          </p>

          {canChangeQuantity ? (
            <>
              <div className="flex w-fit items-center border border-green-700 bg-white">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  disabled={loading || Number(item.quantity) <= 1}
                  onClick={onDecreaseQuantity}
                  className="flex h-10 w-10 items-center justify-center text-xl font-semibold text-green-800 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:text-gray-300"
                >
                  −
                </button>

                <span className="flex h-10 min-w-14 items-center justify-center border-x border-green-700 px-4 font-bold text-green-900">
                  {item.quantity}
                </span>

                <button
                  type="button"
                  aria-label="Increase quantity"
                  disabled={
                    loading || Number(item.quantity) >= MAX_BOOKING_SLOTS
                  }
                  onClick={onIncreaseQuantity}
                  className="flex h-10 w-10 items-center justify-center text-xl font-semibold text-green-800 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:text-gray-300"
                >
                  +
                </button>
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Maximum {MAX_BOOKING_SLOTS} events.
              </p>
            </>
          ) : (
            <div className="inline-flex flex-wrap items-center gap-2 border border-green-200 bg-white px-4 py-2">
              <span className="text-sm font-semibold text-green-800">
                Quantity 1
              </span>

              <span className="text-xs text-gray-500">
                Quantity cannot be increased while multiple packages are
                selected.
              </span>
            </div>
          )}

          {quantityError && (
            <p className="mt-2 text-xs text-red-600">{quantityError}</p>
          )}
        </div>
      </div>

      {/* ================================
          SLOT / EVENT FIELDS
      ================================= */}
      <HireBookingSlotFields
        item={item}
        itemIndex={itemIndex}
        minimumDateTime={minimumDateTime}
        loading={loading}
        fieldErrors={fieldErrors}
        onEventTypeChange={onEventTypeChange}
        onBookingFieldChange={onBookingFieldChange}
      />
    </div>
  );
};

export default HireBookingItemCard;
