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

  return (
    <div className="invoice-section mt-9 grid grid-cols-[minmax(0,1.35fr)_minmax(220px,0.75fr)] gap-9">
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

        <InformationSection title="Venue Information" className="mt-7">
          <InformationRow label="Venue Name" value={venueName} />

          <InformationRow label="Address" value={venueAddress} />
        </InformationSection>
      </div>

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

        <InformationRow label="Event Date" value={eventDate} compact />

        <InformationRow
          label="Due Date"
          value={formatDate(invoice?.due_payment_last_date)}
          compact
        />
      </InformationSection>
    </div>
  );
}
