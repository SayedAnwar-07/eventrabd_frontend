import { Check, Info, Minus, Plus } from "lucide-react";

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

  const quantity = Number(item.quantity || 1);

  const itemTotal = Number.isFinite(Number(unitPrice))
    ? Number(unitPrice) * quantity
    : null;

  const quantityError =
    fieldErrors[`booking_items.${itemIndex}.quantity`] || "";

  return (
    <div className="space-y-3">
      <section className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-md">
        <div className="p-4 sm:p-5">
          {/* Package heading and total */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center gap-2">
                <span className="inline-flex items-center rounded-md bg-[#F8F5F2] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#756A62]">
                  Booking {itemIndex + 1}
                </span>
              </div>

              <h4 className="text-base font-semibold leading-6 text-[#3D3530] sm:text-lg">
                {title || "Photography Package"}
              </h4>

              <p className="mt-1 text-xs text-[#756A62] sm:text-sm">
                {formatPrice(unitPrice) || "Price unavailable"} per booking
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-[10px] font-medium uppercase tracking-wider text-[#8A817A]">
                Total
              </p>

              <p className="mt-1 text-base font-bold text-[#3D3530] sm:text-lg">
                {itemTotal !== null ? formatPrice(itemTotal) : "Unavailable"}
              </p>
            </div>
          </div>

          <div className="my-4 border-t border-[#F0EAE4]" />

          {/* Quantity */}
          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#3D3530]">Quantity</p>

              <p className="mt-1 text-[11px] text-[#8A817A]">
                Maximum {MAX_BOOKING_SLOTS} bookings
              </p>
            </div>

            <div className="mx-2 min-w-8 flex-1 border-t border-dashed border-[#D8C9BD]" />

            {canChangeQuantity ? (
              <div className="flex shrink-0 items-center rounded-md border border-[#E5DDD5] bg-white">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  disabled={loading || Number(item.quantity) <= 1}
                  onClick={onDecreaseQuantity}
                  className="flex h-9 w-9 items-center bg-gray-50 cursor-pointer justify-center rounded-l-md text-[#756A62] transition-colors hover:bg-[#F8F5F2] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <Minus size={15} />
                </button>

                <span className="flex h-9 min-w-10 items-center justify-center border-x border-[#E5DDD5] px-3 text-sm font-semibold text-[#3D3530]">
                  {item.quantity}
                </span>

                <button
                  type="button"
                  aria-label="Increase quantity"
                  disabled={
                    loading || Number(item.quantity) >= MAX_BOOKING_SLOTS
                  }
                  onClick={onIncreaseQuantity}
                  className="flex h-9 w-9 items-center bg-gray-50 cursor-pointer justify-center rounded-r-md text-[#756A62] transition-colors hover:bg-[#F8F5F2] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <Plus size={15} />
                </button>
              </div>
            ) : (
              <span className="shrink-0 text-sm font-semibold text-[#3D3530]">
                {item.quantity}
              </span>
            )}
          </div>

          {quantityError && (
            <p role="alert" className="mt-2 text-xs font-medium text-red-600">
              {quantityError}
            </p>
          )}

          {/* Multiple package information */}
          {!canChangeQuantity && (
            <div className="mt-3 flex items-start gap-2 rounded-md bg-[#F8F5F2] px-3 py-2.5">
              <Info size={15} className="mt-0.5 shrink-0 text-[#8A817A]" />

              <p className="text-xs leading-5 text-[#756A62]">
                Quantity adjustment is unavailable while multiple packages are
                selected. To change the quantity, select only one package.
              </p>
            </div>
          )}

          {quantityError && (
            <p role="alert" className="mt-2 text-xs font-medium text-red-600">
              {quantityError}
            </p>
          )}
        </div>
      </section>

      {/* Event details */}
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
