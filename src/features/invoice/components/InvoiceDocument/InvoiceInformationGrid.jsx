import InformationRow from "./InformationRow";
import InformationSection from "./InformationSection";

import { formatInvoiceNumber } from "../../utils/formatInvoiceNumber";

export default function InvoiceInformationGrid({
  invoice,
  customerName,
  customerWhatsApp,
  normalizedCustomerWhatsApp,
  venueName,
  venueAddress,
  bookingSlots = [],
  eventDate,
  formatDate,
}) {
  const shortInvoiceNumber = formatInvoiceNumber(invoice?.invoice_number);

  const serviceSummary = invoice?.service_summary || {};

  const breakdown = Array.isArray(serviceSummary?.breakdown)
    ? serviceSummary.breakdown
    : [];

  const validBookingSlots = Array.isArray(bookingSlots)
    ? bookingSlots.filter(
        (slot) => slot?.starts_at || slot?.venue_name || slot?.venue_address,
      )
    : [];

  const bookingSlotCount =
    validBookingSlots.length > 0
      ? validBookingSlots.length
      : Number(serviceSummary?.slot_count) > 0
        ? Number(serviceSummary.slot_count)
        : breakdown.length;

  const hasMultipleBookings = bookingSlotCount > 1;

  const fallbackVenueName = venueName?.trim() || "Unknown venue";

  const fallbackVenueAddress = venueAddress?.trim() || "Address not provided";

  const displayCustomerName =
    customerName?.trim() || "Customer name not available";

  const displayCustomerWhatsApp =
    customerWhatsApp?.trim() || "WhatsApp not available";

  const displayEventDate = eventDate || "Date not available";

  return (
    <div className="invoice-information invoice-section mt-9 grid min-w-0 grid-cols-[minmax(0,1.35fr)_minmax(220px,0.75fr)] gap-9">
      {/* LEFT SIDE */}
      <div className="min-w-0">
        <InformationSection title="Bill To">
          <InformationRow label="Name" value={displayCustomerName} />

          <InformationRow
            label="WhatsApp"
            value={displayCustomerWhatsApp}
            href={
              normalizedCustomerWhatsApp
                ? `https://wa.me/${normalizedCustomerWhatsApp}`
                : ""
            }
          />
        </InformationSection>

        <InformationSection
          title="Venue Information"
          className="mt-7"
          rightContent={
            bookingSlotCount > 0 ? (
              <span className="text-[9px] font-semibold uppercase tracking-[0.04em] text-gray-400 sm:text-[10px]">
                {bookingSlotCount}{" "}
                {bookingSlotCount === 1 ? "Booking" : "Bookings"}
              </span>
            ) : null
          }
        >
          <InformationRow
            label="Venue"
            value={
              validBookingSlots.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {validBookingSlots.map((slot, index) => (
                    <span key={slot?.id || `venue-${index}`}>
                      {index + 1}){" "}
                      <strong>
                        {slot?.venue_name?.trim() || "Venue not provided"}
                        {index < validBookingSlots.length - 1 ? "," : ""}
                      </strong>
                    </span>
                  ))}
                </div>
              ) : (
                fallbackVenueName
              )
            }
          />

          <InformationRow
            label="Address"
            value={
              validBookingSlots.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {validBookingSlots.map((slot, index) => (
                    <span key={slot?.id || `address-${index}`}>
                      {index + 1}){" "}
                      <strong>
                        {slot?.venue_address?.trim() || "Address not provided"}
                        {index < validBookingSlots.length - 1 ? "," : ""}
                      </strong>
                    </span>
                  ))}
                </div>
              ) : (
                fallbackVenueAddress
              )
            }
          />
        </InformationSection>
      </div>

      {/* RIGHT SIDE */}
      <div className="min-w-0">
        <InformationSection title="Invoice Information">
          <InformationRow
            label="Invoice No"
            value={shortInvoiceNumber || "Invoice number not available"}
            title={invoice?.invoice_number}
            compact
          />

          <InformationRow
            label="Invoice Date"
            value={
              invoice?.issue_date
                ? formatDate(invoice.issue_date)
                : "Date not available"
            }
            compact
          />

          <InformationRow
            label={hasMultipleBookings ? "Event Dates" : "Event Date"}
            value={displayEventDate}
            compact
          />

          <InformationRow
            label="Due Date"
            value={
              invoice?.due_payment_last_date
                ? formatDate(invoice.due_payment_last_date)
                : "Due date not available"
            }
            compact
          />
        </InformationSection>
      </div>
    </div>
  );
}
