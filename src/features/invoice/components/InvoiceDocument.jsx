import SummaryRow from "./InvoiceDocument/SummaryRow";
import InvoiceInformationGrid from "./InvoiceDocument/InvoiceInformationGrid";
import ResponsiveInvoicePreview from "./InvoiceDocument/ResponsiveInvoicePreview";

const formatMoney = (value) => {
  if (value === null || value === undefined || value === "") {
    return "৳0.00";
  }

  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return `৳${value}`;
  }

  return `৳${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (value) => {
  if (!value) {
    return "Not available";
  }

  const normalizedValue = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value}T00:00:00`
    : value;

  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatLabel = (value) => {
  if (!value) {
    return "Not available";
  }

  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const normalizeWhatsAppNumber = (value) => {
  const digits = String(value || "").replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.startsWith("01")) {
    return `88${digits}`;
  }

  return digits;
};

const formatShiftDuration = (value) => {
  const hours = Number(value);

  if (!Number.isFinite(hours) || hours <= 0) {
    return "Not available";
  }

  return `${hours} ${hours === 1 ? "Hour" : "Hours"}`;
};

const InvoiceDocument = ({
  invoice,
  hire,
  actions = null,
  documentRef = null,
}) => {
  const bookingSlots = Array.isArray(hire?.booking_slots)
    ? hire.booking_slots
    : [];

  const firstSlot = bookingSlots[0] || {};

  const serviceSummary = invoice?.service_summary || {};

  const backendSlotCount = Number(serviceSummary.slot_count || 0);

  const slotCount = bookingSlots.length || backendSlotCount || 1;

  const shiftHourPerSlot = Number(
    serviceSummary.shift_hour_per_slot || hire?.service?.shift_hour || 0,
  );

  const fallbackShiftCharge =
    slotCount > 0
      ? Number(invoice?.service_price || 0) / slotCount
      : Number(invoice?.service_price || 0);

  const shiftChargePerSlot =
    serviceSummary.shift_charge_per_slot ||
    hire?.service?.shift_charge ||
    fallbackShiftCharge;

  const serviceName =
    invoice?.service?.service_name ||
    hire?.service?.service_display_name ||
    hire?.service?.service_name ||
    "Event service";

  const brandName =
    invoice?.brand?.brand_name || hire?.brand?.brand_name || "Service Provider";

  const sellerName =
    invoice?.seller?.full_name || hire?.seller?.full_name || "Not available";

  const sellerEmail =
    hire?.seller?.email || hire?.brand?.email || invoice?.seller?.email || "";

  const sellerWhatsApp =
    hire?.brand?.whatsapp_number ||
    invoice?.seller?.contact_number ||
    hire?.seller?.contact_number ||
    "";

  const normalizedSellerWhatsApp = normalizeWhatsAppNumber(sellerWhatsApp);

  const customerName =
    invoice?.customer?.full_name ||
    hire?.customer?.full_name ||
    "Not available";

  const customerWhatsApp =
    invoice?.customer?.whatsapp_number ||
    firstSlot?.customer_whatsapp_number ||
    "";

  const normalizedCustomerWhatsApp = normalizeWhatsAppNumber(customerWhatsApp);

  const venueName = firstSlot?.venue_name || "Not available";

  const venueAddress = firstSlot?.venue_address || "Not available";

  const eventDate = firstSlot?.starts_at
    ? bookingSlots.length > 1
      ? `${formatDate(firstSlot.starts_at)} (+${bookingSlots.length - 1} more)`
      : formatDate(firstSlot.starts_at)
    : "Not available";

  const eventRows =
    bookingSlots.length > 0
      ? bookingSlots.map((slot, index) => ({
          id: slot?.id || `${invoice?.id}-slot-${index}`,
          date: formatDate(slot?.starts_at),
          duration: formatShiftDuration(shiftHourPerSlot),
          charge: formatMoney(shiftChargePerSlot),
          service: formatLabel(serviceName),
        }))
      : [
          {
            id: `${invoice?.id}-fallback-slot`,
            date: "Not available",
            duration: formatShiftDuration(shiftHourPerSlot),
            charge: formatMoney(shiftChargePerSlot),
            service: formatLabel(serviceName),
          },
        ];

  const servicePrice = invoice?.service_price || "0.00";
  const discountPrice = invoice?.discount_price || "0.00";

  const calculatedSubtotal = Math.max(
    Number(servicePrice || 0) - Number(discountPrice || 0),
    0,
  );

  const subtotal = invoice?.sub_total ?? calculatedSubtotal;

  return (
    <section className="invoice-document mx-auto w-full max-w-[210mm]">
      <div className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] print:rounded-none print:border-0 print:shadow-none">
        <ResponsiveInvoicePreview>
          <div
            ref={documentRef}
            data-invoice-pdf="true"
            className="invoice-pdf-content mx-auto box-border flex h-[297mm] w-[210mm] min-w-[210mm] max-w-[210mm] flex-col overflow-hidden bg-white px-[12mm] py-[8mm] text-gray-950"
          >
            {/* Header contacts */}

            <div className="grid grid-cols-3 items-center gap-4">
              <div className="text-left">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                  Seller Email
                </p>

                {sellerEmail ? (
                  <a
                    href={`mailto:${sellerEmail}`}
                    className="mt-1 block break-all text-xs font-medium text-[#b60018] hover:underline"
                  >
                    {sellerEmail}
                  </a>
                ) : (
                  <p className="mt-1 text-xs text-gray-600">Not available</p>
                )}
              </div>

              <div className="text-center">
                <h1 className="font-serif text-2xl font-bold text-[#b60018]">
                  Eventra BD
                </h1>

                <p className="mt-1 text-xs font-semibold text-gray-700">
                  {brandName}
                </p>

                <p className="mt-0.5 text-[11px] text-gray-500">{sellerName}</p>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                  Seller WhatsApp
                </p>

                {normalizedSellerWhatsApp ? (
                  <a
                    href={`https://wa.me/${normalizedSellerWhatsApp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block text-xs font-medium text-[#b60018] hover:underline"
                  >
                    {sellerWhatsApp}
                  </a>
                ) : (
                  <p className="mt-1 text-xs text-gray-600">Not available</p>
                )}
              </div>
            </div>

            {/* Information */}

            <InvoiceInformationGrid
              invoice={invoice}
              customerName={customerName}
              customerWhatsApp={customerWhatsApp}
              normalizedCustomerWhatsApp={normalizedCustomerWhatsApp}
              venueName={venueName}
              venueAddress={venueAddress}
              eventDate={eventDate}
              formatDate={formatDate}
            />

            {/* Event details */}

            <div className="mt-4 break-inside-avoid">
              <h2 className="font-serif text-base font-bold text-gray-950">
                Event Details
              </h2>

              <div className="mt-2">
                <table className="w-full table-fixed border-collapse">
                  <thead>
                    <tr className="bg-[#b60018] text-white">
                      <th className="border-r border-white/60 px-3 py-1.5 text-left text-xs font-bold uppercase">
                        Date
                      </th>

                      <th className="border-r border-white/60 px-3 py-1.5 text-left text-xs font-bold uppercase">
                        Shift Duration
                      </th>

                      <th className="border-r border-white/60 px-3 py-1.5 text-left text-xs font-bold uppercase">
                        Shift Charge
                      </th>

                      <th className="px-3 py-1.5 text-left text-xs font-bold uppercase">
                        Service Type
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {eventRows.map((row) => (
                      <tr key={row.id} className="border-b border-gray-200">
                        <td className="border-r border-gray-200 px-3 py-2 text-xs text-gray-700">
                          {row.date}
                        </td>

                        <td className="border-r border-gray-200 px-3 py-2 text-xs text-gray-700">
                          {row.duration}
                        </td>

                        <td className="border-r border-gray-200 px-3 py-2 text-left text-sm font-medium text-gray-950">
                          {row.charge}
                        </td>

                        <td className="px-3 py-2 text-xs text-gray-700">
                          {row.service}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Agreement and summary */}

            <div className="mt-20 grid grid-cols-[1fr_280px] gap-8 break-inside-avoid">
              <div className="flex min-w-0 flex-col items-start justify-end">
                <p className="max-w-full border-b pb-2 text-sm">
                  {invoice?.customer_agreed
                    ? `${
                        invoice?.customer?.full_name || "Not available"
                      } ( I agree )`
                    : "Pending Confirmation"}
                </p>

                <p className="pt-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#b60018]">
                  Customer Agreement
                </p>
              </div>

              <div className="invoice-summary min-w-0">
                <div className="mb-2 flex items-center justify-between gap-5 border-b border-gray-200 pb-2 text-xs">
                  <span className="font-semibold text-gray-600">
                    Due Payment Date
                  </span>

                  <span className="whitespace-nowrap font-bold text-gray-950">
                    {formatDate(invoice?.due_payment_last_date)}
                  </span>
                </div>

                <SummaryRow
                  label="Service Price"
                  value={formatMoney(servicePrice)}
                />

                <SummaryRow label="Subtotal" value={formatMoney(subtotal)} />

                <SummaryRow
                  label="Discount"
                  value={`− ${formatMoney(discountPrice)}`}
                  variant="discount"
                />

                <SummaryRow
                  label="Total"
                  value={formatMoney(invoice?.total)}
                  variant="total"
                />

                <SummaryRow
                  label="Advance Payment"
                  value={`− ${formatMoney(invoice?.advance_payment)}`}
                  variant="paid"
                />

                <SummaryRow
                  label="Due Payment"
                  value={formatMoney(invoice?.due_payment)}
                  variant="due"
                />
              </div>
            </div>

            {/* Footer */}

            <div className="mt-auto border-t border-gray-200 pt-2 text-center">
              <p className="text-[11px] text-gray-500">
                This invoice was generated electronically by Eventra BD.
              </p>
            </div>
          </div>
        </ResponsiveInvoicePreview>

        {actions ? (
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-4 sm:px-8 sm:py-5 print:hidden">
            {actions}
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default InvoiceDocument;
