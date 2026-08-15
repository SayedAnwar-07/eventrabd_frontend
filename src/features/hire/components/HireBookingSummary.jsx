import { formatPrice } from "../utils/hireFormUtils";

const HireBookingSummary = ({
  bookingOptionCount = 0,
  totalQuantity = 0,
  grandTotal = null,
}) => {
  if (bookingOptionCount < 1) {
    return null;
  }

  return (
    <div className="border border-green-700 bg-green-50 p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-700">
            Booking Summary
          </p>

          <p className="mt-1 text-sm text-gray-600">
            {bookingOptionCount} booking option
            {bookingOptionCount > 1 ? "s" : ""} · {totalQuantity} event
            {totalQuantity > 1 ? "s" : ""}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Total Amount
          </p>

          <p className="mt-1 text-2xl font-bold text-green-800">
            {grandTotal !== null ? formatPrice(grandTotal) : "Unavailable"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HireBookingSummary;
