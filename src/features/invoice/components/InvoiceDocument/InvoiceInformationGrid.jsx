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
  eventDate,
  formatDate,
}) {
  const shortInvoiceNumber = formatInvoiceNumber(invoice?.invoice_number);

  const serviceSummary = invoice?.service_summary || {};

  const breakdown = Array.isArray(serviceSummary?.breakdown)
    ? serviceSummary.breakdown
    : [];

  const bookingSlotCount =
    Number(serviceSummary?.slot_count) > 0
      ? Number(serviceSummary.slot_count)
      : breakdown.length;

  const hasMultipleBookings = bookingSlotCount > 1;

  return (
    <div className="invoice-information invoice-section mt-9 grid min-w-0 grid-cols-[minmax(0,1.35fr)_minmax(220px,0.75fr)] gap-9">
      {/* LEFT SIDE */}
      <div className="min-w-0">
        <InformationSection title="Bill To">
          <InformationRow label="Name" value={customerName} />

          <InformationRow
            label="WhatsApp"
            value={customerWhatsApp}
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
            hasMultipleBookings ? (
              <span className="text-[9px] font-semibold uppercase tracking-[0.04em] text-gray-400 sm:text-[10px]">
                {bookingSlotCount} Bookings
              </span>
            ) : null
          }
        >
          <InformationRow
            label={hasMultipleBookings ? "Venue" : "Venue Name"}
            value={venueName}
          />

          <InformationRow label="Address" value={venueAddress} />
        </InformationSection>
      </div>

      {/* RIGHT SIDE */}
      <div className="min-w-0">
        <InformationSection title="Invoice Information">
          <InformationRow
            label="Invoice No"
            value={shortInvoiceNumber}
            title={invoice?.invoice_number}
            compact
          />

          <InformationRow
            label="Invoice Date"
            value={formatDate(invoice?.issue_date)}
            compact
          />

          <InformationRow
            label={hasMultipleBookings ? "Event Dates" : "Event Date"}
            value={eventDate}
            compact
          />

          <InformationRow
            label="Due Date"
            value={formatDate(invoice?.due_payment_last_date)}
            compact
          />
        </InformationSection>
      </div>
    </div>
  );
}
