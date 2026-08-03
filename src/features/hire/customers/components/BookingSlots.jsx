import BookingSlotCard from "./BookingSlotCard";

export default function BookingSlots({ hire }) {
  const bookingSlots = Array.isArray(hire?.booking_slots)
    ? hire.booking_slots
    : [];

  return (
    <section className="w-full md:w-6/8">
      <div className="flex items-center gap-3 border-b border-gray-100 py-4">
        <h2 className="font-semibold">Booking Slot</h2>

        <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
          {bookingSlots.length} {bookingSlots.length === 1 ? "Slot" : "Slots"}
        </span>
      </div>

      {bookingSlots.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-sm text-gray-500">
            No booking schedule is available.
          </p>
        </div>
      ) : (
        bookingSlots.map((slot, index) => (
          <BookingSlotCard
            key={slot?.id || `${slot?.starts_at}-${index}`}
            slot={slot}
            brand={hire?.brand}
            index={index}
          />
        ))
      )}
    </section>
  );
}
