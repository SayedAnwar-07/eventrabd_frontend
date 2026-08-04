const PAYMENT_STATUS_CONFIG = {
  paid: {
    label: "Paid",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  partially_paid: {
    label: "Partially Paid",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  unpaid: {
    label: "Unpaid",
    className: "border-gray-200 bg-gray-50 text-gray-700",
  },
  overdue: {
    label: "Overdue",
    className: "border-red-200 bg-red-50 text-red-700",
  },
};

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

const InformationRow = ({ label, value, href }) => {
  const content = value || "Not available";

  return (
    <div className="grid grid-cols-[88px_12px_1fr] gap-1 text-xs leading-5 text-gray-700">
      <span className="font-semibold text-gray-950">{label}</span>

      <span>:</span>

      {href && value ? (
        <a
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
          className="wrap-break-word transition hover:text-[#b60018] hover:underline"
        >
          {content}
        </a>
      ) : (
        <span className="wrap-break-word">{content}</span>
      )}
    </div>
  );
};

const SummaryRow = ({ label, value, strong = false }) => {
  return (
    <div
      className={`flex items-center justify-between gap-6 py-2 text-sm ${
        strong
          ? "border-t border-gray-900 pt-3 font-bold text-gray-950"
          : "text-gray-700"
      }`}
    >
      <span>{label}</span>

      <span className={strong ? "text-base" : "font-medium text-gray-950"}>
        {value}
      </span>
    </div>
  );
};

const PaymentStatusBadge = ({ status }) => {
  const normalizedStatus = String(status || "unpaid").toLowerCase();

  const config =
    PAYMENT_STATUS_CONFIG[normalizedStatus] || PAYMENT_STATUS_CONFIG.unpaid;

  return (
    <span
      className={`inline-flex border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${config.className}`}
    >
      {config.label}
    </span>
  );
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

  const customerEmail = invoice?.customer?.email || hire?.customer?.email || "";

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
    <section className="invoice-document overflow-hidden rounded-md border border-gray-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)] print:rounded-none print:border-0 print:shadow-none">
      <div
        ref={documentRef}
        className="invoice-pdf-content bg-white px-5 py-8 text-gray-950 sm:px-8 lg:px-12 lg:py-12"
      >
        {/* Header contacts */}

        <div className="grid gap-5 sm:grid-cols-3 sm:items-center">
          <div className="text-center sm:text-left">
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
            <h1 className="font-serif text-3xl font-bold text-[#b60018]">
              Eventra BD
            </h1>

            <p className="mt-1 text-xs font-semibold text-gray-700">
              {brandName}
            </p>

            <p className="mt-0.5 text-[11px] text-gray-500">{sellerName}</p>
          </div>

          <div className="text-center sm:text-right">
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

        {/* Customer, venue and invoice meta */}

        <div className="mt-10 grid gap-8 border-t border-gray-100 pt-8 md:grid-cols-3">
          <div>
            <h2 className="inline-block border-b border-[#b60018] pb-1 font-serif text-sm font-bold uppercase text-[#b60018]">
              Bill To
            </h2>

            <div className="mt-4 space-y-2">
              <InformationRow label="Name" value={customerName} />

              <InformationRow
                label="Email"
                value={customerEmail}
                href={customerEmail ? `mailto:${customerEmail}` : ""}
              />

              <InformationRow
                label="WhatsApp"
                value={customerWhatsApp}
                href={
                  normalizedCustomerWhatsApp
                    ? `https://wa.me/${normalizedCustomerWhatsApp}`
                    : ""
                }
              />
            </div>
          </div>

          <div>
            <h2 className="inline-block border-b border-[#b60018] pb-1 font-serif text-sm font-bold text-[#b60018]">
              Venue
            </h2>

            <div className="mt-4 space-y-2">
              <InformationRow label="Venue Name" value={venueName} />

              <InformationRow label="Address" value={venueAddress} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-sm font-bold text-[#b60018]">
                Invoice Information
              </h2>

              <PaymentStatusBadge status={invoice?.payment_status} />
            </div>

            <div className="mt-4 space-y-2">
              <InformationRow
                label="Invoice No"
                value={invoice?.invoice_number}
              />

              <InformationRow
                label="Invoice Date"
                value={formatDate(invoice?.issue_date)}
              />

              <InformationRow label="Event Date" value={eventDate} />
            </div>
          </div>
        </div>

        {/* Event details */}

        <div className="mt-12">
          <h2 className="font-serif text-base font-bold text-gray-950">
            Event Details
          </h2>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-190 border-collapse">
              <thead>
                <tr className="bg-[#b60018] text-white">
                  <th className="border-r border-white/60 px-4 py-3 text-left text-xs font-bold uppercase">
                    Date
                  </th>

                  <th className="border-r border-white/60 px-4 py-3 text-left text-xs font-bold uppercase">
                    Shift Duration
                  </th>

                  <th className="border-r border-white/60 px-4 py-3 text-right text-xs font-bold uppercase">
                    Shift Charge
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-bold uppercase">
                    Service Type
                  </th>
                </tr>
              </thead>

              <tbody>
                {eventRows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-200">
                    <td className="border-r border-gray-200 px-4 py-4 text-sm text-gray-700">
                      {row.date}
                    </td>

                    <td className="border-r border-gray-200 px-4 py-4 text-sm text-gray-700">
                      {row.duration}
                    </td>

                    <td className="border-r border-gray-200 px-4 py-4 text-right text-sm font-medium text-gray-950">
                      {row.charge}
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-700">
                      {row.service}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes and totals */}

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[#b60018]">
              Seller Note
            </h3>

            <p className="mt-3 max-w-xl whitespace-pre-line text-sm leading-6 text-gray-600">
              {invoice?.seller_note ||
                "No additional note was provided by the seller."}
            </p>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between gap-5 border-b border-gray-200 pb-3 text-xs">
              <span className="font-semibold text-gray-600">
                Due Payment Date
              </span>

              <span className="font-semibold text-gray-950">
                {formatDate(invoice?.due_payment_last_date)}
              </span>
            </div>

            <SummaryRow
              label="Service Price"
              value={formatMoney(servicePrice)}
            />

            <SummaryRow
              label="Discount"
              value={`- ${formatMoney(discountPrice)}`}
            />

            <SummaryRow label="Subtotal" value={formatMoney(subtotal)} />

            <SummaryRow
              label="Advance Payment"
              value={`- ${formatMoney(invoice?.advance_payment)}`}
            />

            <SummaryRow
              label="Due Payment"
              value={formatMoney(invoice?.due_payment)}
            />

            <SummaryRow
              label="Total"
              value={formatMoney(invoice?.total)}
              strong
            />
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-5 text-center">
          <p className="text-[11px] text-gray-500">
            This invoice was generated electronically by Eventra BD.
          </p>
        </div>
      </div>

      {actions ? (
        <div className="border-t border-gray-200 bg-gray-50 px-5 py-5 sm:px-8 print:hidden">
          {actions}
        </div>
      ) : null}
    </section>
  );
};

export default InvoiceDocument;
