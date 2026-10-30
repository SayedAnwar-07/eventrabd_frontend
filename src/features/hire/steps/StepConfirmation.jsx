
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
  Phone,
  StickyNote,
  ExternalLink,
  Loader2,
} from "lucide-react";

import {
  formatPrice,
  getEventTypeLabel,
} from "../utils/hireFormUtils";

// Format local date/time without timezone conversion
const formatEventDate = (value) => {
  if (!value) return "Not selected";

  const [datePart, timePart = ""] = value.split("T");
  const [year, month, day] = datePart.split("-").map(Number);

  if (!year || !month || !day) return "Not selected";

  const date = new Date(year, month - 1, day);

  const formattedDate = new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);

  if (!timePart) return formattedDate;

  const [hour, minute] = timePart.split(":").map(Number);

  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return formattedDate;
  }

  const time = new Date(
    year,
    month - 1,
    day,
    hour,
    minute
  );

  const formattedTime = new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(time);

  return `${formattedDate} · ${formattedTime}`;
};

// Format WhatsApp number
const formatWhatsapp = (value) => {
  const digits = String(value || "").replace(/\D/g, "");

  if (!digits) return "Not provided";

  if (digits.startsWith("880")) return `+${digits}`;
  if (digits.startsWith("0")) return `+88${digits}`;
  if (digits.length === 10) return `+880${digits}`;

  return `+${digits}`;
};

// Validate Google Maps URL
const getSafeMapUrl = (value) => {
  if (!value) return null;

  try {
    const url = new URL(value);

    if (
      url.protocol !== "https:" &&
      url.protocol !== "http:"
    ) {
      return null;
    }

    return url.href;
  } catch {
    return null;
  }
};

// Reusable section heading
const SectionHeading = ({
  icon: Icon,
  title,
  meta,
}) => (
  <div className="flex items-center justify-between gap-3 border-b border-[#F0EAE4] px-4 py-3.5 sm:px-5">
    <div className="flex items-center gap-2.5">
      <Icon
        size={17}
        strokeWidth={1.8}
        className="shrink-0 text-[#756A62]"
      />

      <h3 className="text-sm font-semibold text-[#3D3530]">
        {title}
      </h3>
    </div>

    {meta && (
      <span className="shrink-0 text-xs text-[#9B9087]">
        {meta}
      </span>
    )}
  </div>
);

const StepConfirmation = ({
  bookingItems = [],
  getBookingItemInfo,
  grandTotal = null,
  customerWhatsappNumber = "",
  customerNote = "",
  onConfirm,
  loading = false,
}) => {
  // Flatten booking slots into one event list.
  // This ensures event numbering stays sequential
  // across different services and packages.
  const allEvents = bookingItems.flatMap(
    (item, itemIndex) =>
      (item.bookingSlots || []).map(
        (slot, slotIndex) => ({
          item,
          itemIndex,
          slot,
          slotIndex,
        })
      )
  );

  const totalEvents = allEvents.length;

  const cardClass =
    "overflow-hidden rounded-md border border-[#E5DDD5] bg-white shadow-[0_1px_2px_rgba(61,53,48,0.04),0_8px_24px_-12px_rgba(61,53,48,0.10)]";

  const totalAvailable =
    grandTotal !== null &&
    grandTotal !== undefined &&
    Number.isFinite(Number(grandTotal));

  return (
    <section className="mx-auto w-full space-y-5 pb-3">

      {/* HEADER */}
      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#756A62]">
          Final Step
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-[#3D3530] sm:text-2xl">
          Review & Confirm
        </h2>

        <p className="text-sm leading-relaxed text-[#756A62]">
          Please review your booking details before confirming.
        </p>
      </div>

      {/* EVENT DETAILS */}
      <div className={cardClass}>
        <SectionHeading
          icon={CalendarDays}
          title="Event details"
          meta={`${totalEvents} ${
            totalEvents === 1 ? "event" : "events"
          }`}
        />

        <div className="divide-y divide-[#F0EAE4]">
          {allEvents.map(
            (
              { item, itemIndex, slot, slotIndex },
              eventIndex
            ) => {
              const { title } = getBookingItemInfo(item);

              const quantity =
                Number(item.quantity) || 1;

              const eventType =
                item.eventTypes?.[slotIndex];

              const eventLabel = eventType
                ? getEventTypeLabel(eventType)
                : "Event not selected";

              const mapUrl = getSafeMapUrl(
                slot.google_map_link
              );

              return (
                <div
                  key={`${item.key}-${slotIndex}`}
                  className="px-4 py-4 sm:px-5"
                >
                  {/* EVENT TITLE + SERVICE NAME */}
                  <div className="flex items-start gap-3">
                    {/* Global event number */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#F5F0EB] text-xs font-semibold text-[#51463E]">
                      {String(eventIndex + 1).padStart(
                        2,
                        "0"
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <h4 className="text-sm font-semibold text-[#3D3530]">
                        {eventLabel}
                      </h4>

                      <p className="break-words text-xs leading-relaxed text-[#756A62]">
                        {title}
                      </p>

                      {bookingItems.length > 1 && (
                        <p className="text-[11px] text-[#9B9087]">
                          Booking {itemIndex + 1}
                        </p>
                      )}
                    </div>

                    {quantity > 1 && (
                      <span className="shrink-0 rounded-md bg-[#F3ECE5] px-2 py-1 text-[11px] font-medium text-[#51463E]">
                        Qty {quantity}
                      </span>
                    )}
                  </div>

                  {/* EVENT SCHEDULE AND VENUE */}
                  <div className="mt-4 space-y-4 border-t border-[#F0EAE4] pt-4 sm:ml-12">

                    {/* DATE & TIME */}
                    <div className="flex items-start gap-3">
                      <Clock3
                        size={16}
                        strokeWidth={1.8}
                        className="mt-0.5 shrink-0 text-[#9B9087]"
                      />

                      <div className="min-w-0 space-y-1">
                        <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#9B9087]">
                          Date & Time
                        </p>

                        <p className="text-sm font-medium text-[#3D3530]">
                          {formatEventDate(
                            slot.starts_at
                          )}
                        </p>
                      </div>
                    </div>

                    {/* VENUE */}
                    <div className="flex items-start gap-3">
                      <MapPin
                        size={16}
                        strokeWidth={1.8}
                        className="mt-0.5 shrink-0 text-[#9B9087]"
                      />

                      <div className="min-w-0 space-y-1">
                        <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#9B9087]">
                          Venue
                        </p>

                        <p className="text-sm font-medium text-[#3D3530]">
                          {slot.venue_name ||
                            "Not provided"}
                        </p>

                        {slot.venue_address && (
                          <p className="break-words text-xs leading-relaxed text-[#756A62]">
                            {slot.venue_address}
                          </p>
                        )}

                        {mapUrl && (
                          <a
                            href={mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 pt-1 text-xs font-medium text-[#8B735F] transition-colors hover:text-[#3D3530] hover:underline"
                          >
                            View on Google Maps
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* CONTACT DETAILS */}
      <div className={cardClass}>
        <SectionHeading
          icon={Phone}
          title="Contact details"
        />

        <div className="space-y-4 px-4 py-4 sm:px-5">
          <div>
            <p className="mb-1 text-[11px] text-[#9B9087]">
              WhatsApp number
            </p>

            <p className="text-sm font-medium text-[#3D3530]">
              {formatWhatsapp(customerWhatsappNumber)}
            </p>
          </div>

          {customerNote?.trim() && (
            <div className="border-t border-[#F0EAE4] pt-3">
              <div className="mb-2 flex items-center gap-2">
                <StickyNote
                  size={14}
                  className="text-[#9B9087]"
                />

                <p className="text-[11px] text-[#9B9087]">
                  Customer note
                </p>
              </div>

              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-[#51463E]">
                {customerNote}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* TOTAL + CONFIRM */}
      <div className="space-y-4 rounded-md border border-[#E5DDD5] bg-[#FFFCF9] p-4 sm:p-5">

        {/* TOTAL */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#3D3530]">
              Total amount
            </p>

            <p className="mt-1 text-xs text-[#756A62]">
              Final booking total
            </p>
          </div>

          <p className="text-2xl font-bold tracking-tight tabular-nums text-[#3D3530]">
            {totalAvailable
              ? formatPrice(Number(grandTotal))
              : "Unavailable"}
          </p>
        </div>

        <div className="h-px bg-[#E5DDD5]" />

        {/* CONFIRM BUTTON */}
        <button
          type="button"
          disabled={loading || !totalAvailable}
          onClick={onConfirm}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#3D3530] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#51463E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A68C78] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2
                size={17}
                className="animate-spin"
              />
              Submitting...
            </>
          ) : (
            <>
              Confirm Hire
              <ArrowRight size={17} />
            </>
          )}
        </button>

        <p className="text-center text-xs text-[#9B9087]">
          Please make sure your booking details are correct.
        </p>
      </div>
    </section>
  );
};

export default StepConfirmation;
