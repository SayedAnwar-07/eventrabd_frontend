import SummaryRow from "./InvoiceDocument/SummaryRow";
import InvoiceInformationGrid from "./InvoiceDocument/InvoiceInformationGrid";
import ResponsiveInvoicePreview from "./InvoiceDocument/ResponsiveInvoicePreview";
import TermsConditions from "./InvoiceDocument/TermsConditions";

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

  if (value === "akhd_walima") {
    return "Akhd/Walima";
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

const getFallbackBookingTitle = ({ invoice, hire, serviceSummary }) => {
  const backendBookingTitle =
    invoice?.booking_title ||
    serviceSummary?.booking_title ||
    invoice?.package_snapshot_title ||
    serviceSummary?.package_snapshot_title ||
    invoice?.package_title ||
    serviceSummary?.package_title ||
    invoice?.package?.title ||
    hire?.package?.title;

  if (backendBookingTitle) {
    return String(backendBookingTitle);
  }

  const serviceTitle =
    invoice?.service?.service_display_name ||
    invoice?.service?.service_name ||
    serviceSummary?.service_display_name ||
    serviceSummary?.service_name ||
    hire?.service?.service_display_name ||
    hire?.service?.service_name;

  return serviceTitle ? formatLabel(serviceTitle) : "Event Service";
};

const getBookingItemFromHire = (hire, bookingItemId) => {
  const bookingItems = Array.isArray(hire?.booking_items)
    ? hire.booking_items
    : [];

  if (!bookingItemId) {
    return null;
  }

  return (
    bookingItems.find((item) => String(item?.id) === String(bookingItemId)) ||
    null
  );
};

const getBookingSlotFromHire = (hire, bookingSlotId) => {
  const bookingSlots = Array.isArray(hire?.booking_slots)
    ? hire.booking_slots
    : [];

  if (!bookingSlotId) {
    return null;
  }

  return (
    bookingSlots.find((slot) => String(slot?.id) === String(bookingSlotId)) ||
    null
  );
};

const getUniqueValues = (values = []) => {
  return [
    ...new Set(
      values.map((value) => String(value || "").trim()).filter(Boolean),
    ),
  ];
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

  const serviceSummary = invoice?.service_summary || {};

  /*
   * This is the authoritative invoice booking breakdown.
   *
   * Every row may have a different:
   * - booking item
   * - package
   * - unit price
   * - shift count
   * - total amount
   */
  const breakdown = Array.isArray(serviceSummary?.breakdown)
    ? serviceSummary.breakdown
    : [];

  const fallbackBookingTitle = getFallbackBookingTitle({
    invoice,
    hire,
    serviceSummary,
  });

  const shiftHourPerSlot = Number(
    serviceSummary?.shift_hour_per_slot || hire?.service?.shift_hour || 0,
  );

  const brandName =
    invoice?.brand?.display_name ||
    invoice?.display_name_snapshot ||
    invoice?.brand_name_snapshot ||
    hire?.brand?.display_name ||
    "Service Provider";

  const sellerName =
    invoice?.seller?.full_name ||
    invoice?.seller_name_snapshot ||
    hire?.seller?.full_name ||
    "Not available";

  const sellerEmail =
    invoice?.seller?.email || hire?.seller?.email || hire?.brand?.email || "";

  const sellerWhatsApp =
    invoice?.brand?.whatsapp_number ||
    hire?.brand?.whatsapp_number ||
    invoice?.seller_contact_snapshot ||
    invoice?.seller?.contact_number ||
    hire?.seller?.contact_number ||
    "";

  const normalizedSellerWhatsApp = normalizeWhatsAppNumber(sellerWhatsApp);

  const customerName =
    invoice?.customer?.full_name ||
    invoice?.customer_name_snapshot ||
    hire?.customer?.full_name ||
    "Not available";

  /*
   * Prefer Invoice-returned/snapshot customer information.
   * Do not recreate historical invoice contact information from current data
   * unless the invoice response does not contain it.
   */
  const customerWhatsApp =
    invoice?.customer?.whatsapp_number ||
    invoice?.customer_whatsapp_snapshot ||
    hire?.customer_whatsapp_number ||
    "";

  const normalizedCustomerWhatsApp = normalizeWhatsAppNumber(customerWhatsApp);

  /*
   * Build event rows primarily from backend invoice service_summary.breakdown.
   *
   * Hire data is only used as a fallback for missing display information.
   * It is NEVER used to override backend invoice pricing.
   */
  const eventRows =
    breakdown.length > 0
      ? breakdown.map((entry, index) => {
          const bookingSlot = getBookingSlotFromHire(
            hire,
            entry?.booking_slot_id,
          );

          const bookingItem = getBookingItemFromHire(
            hire,
            entry?.booking_item_id,
          );

          const shiftCount = Number(entry?.shift_count || 1);

          const shiftHours = Number(
            entry?.shift_hours || entry?.total_shift_hours || 0,
          );

          const displayShiftHours =
            shiftHours > 0
              ? shiftHours
              : shiftHourPerSlot > 0
                ? shiftHourPerSlot * shiftCount
                : 0;

          /*
           * IMPORTANT:
           * entry.booking_title is the first choice.
           *
           * This is what makes multiple-package invoices work correctly.
           */
          const bookingTitle =
            entry?.booking_title ||
            bookingItem?.booking_title ||
            bookingItem?.package?.package_title ||
            bookingItem?.package?.title ||
            fallbackBookingTitle;

          const eventType =
            entry?.event_type || bookingSlot?.event_type || "event";

          /*
           * Pricing displayed here comes from backend invoice breakdown.
           *
           * No authoritative frontend package/service price calculation.
           */
          const unitPrice = entry?.unit_price ?? null;

          const amount = entry?.amount ?? null;

          return {
            id:
              entry?.booking_slot_id ||
              bookingSlot?.id ||
              `${invoice?.id}-slot-${index}`,

            bookingSlotId: entry?.booking_slot_id || bookingSlot?.id || null,

            bookingItemId: entry?.booking_item_id || bookingItem?.id || null,

            bookingTitle,

            eventType: formatLabel(eventType),

            date: entry?.date || formatDate(bookingSlot?.starts_at),

            duration: formatShiftDuration(displayShiftHours),

            shiftCount,

            unitPrice,

            amount,

            venueName: entry?.venue_name || bookingSlot?.venue_name || "",

            venueAddress:
              entry?.venue_address || bookingSlot?.venue_address || "",
          };
        })
      : bookingSlots.length > 0
        ? bookingSlots.map((slot, index) => {
            const matchingBookingItem = Array.isArray(hire?.booking_items)
              ? hire.booking_items.find((item) =>
                  Array.isArray(item?.booking_slots)
                    ? item.booking_slots.some(
                        (itemSlot) => String(itemSlot?.id) === String(slot?.id),
                      )
                    : false,
                )
              : null;

            const bookingTitle =
              matchingBookingItem?.booking_title ||
              matchingBookingItem?.package?.package_title ||
              matchingBookingItem?.package?.title ||
              fallbackBookingTitle;

            return {
              id: slot?.id || `${invoice?.id}-slot-${index}`,

              bookingSlotId: slot?.id || null,

              bookingItemId: matchingBookingItem?.id || null,

              bookingTitle,

              eventType: formatLabel(slot?.event_type),

              date: formatDate(slot?.starts_at),

              duration: formatShiftDuration(shiftHourPerSlot),

              shiftCount: 1,

              unitPrice: null,

              amount: null,

              venueName: slot?.venue_name || "",

              venueAddress: slot?.venue_address || "",
            };
          })
        : [
            {
              id: `${invoice?.id}-fallback-slot`,

              bookingSlotId: null,

              bookingItemId: null,

              bookingTitle: fallbackBookingTitle,

              eventType: "Event",

              date: "Not available",

              duration: formatShiftDuration(
                Number(serviceSummary?.total_shift_hours),
              ),

              shiftCount: Number(serviceSummary?.shift_count) || 1,

              unitPrice: null,

              amount: null,

              venueName: "",

              venueAddress: "",
            },
          ];

  /*
   * Invoice Information summary.
   *
   * Do not present the first booking's venue as if it applies
   * to every booking in a multi-booking invoice.
   */
  const uniqueVenueNames = getUniqueValues(
    eventRows.map((row) => row.venueName),
  );

  const uniqueVenueAddresses = getUniqueValues(
    eventRows.map((row) => row.venueAddress),
  );

  const venueName =
    eventRows.length > 1
      ? uniqueVenueNames.length === 1
        ? uniqueVenueNames[0]
        : uniqueVenueNames.length > 1
          ? "Multiple venues"
          : "See event details"
      : uniqueVenueNames[0] || "Not available";

  const venueAddress =
    eventRows.length > 1
      ? uniqueVenueAddresses.length === 1
        ? uniqueVenueAddresses[0]
        : uniqueVenueAddresses.length > 1
          ? "See event details"
          : "Not available"
      : uniqueVenueAddresses[0] || "Not available";

  const eventDate =
    eventRows.length > 0
      ? eventRows.length === 1
        ? eventRows[0].date
        : `${eventRows[0].date} (+${eventRows.length - 1} more)`
      : "Not available";

  /*
   * Financial values:
   *
   * Backend Invoice response is the ONLY source of truth.
   *
   * Never calculate:
   * - service_price
   * - total
   * - due_payment
   * from Hire/package data here.
   */
  const servicePrice = invoice?.service_price ?? "0.00";

  const additionalCharge = invoice?.additional_charge ?? "0.00";

  const additionalChargeReason = String(
    invoice?.additional_charge_reason || "",
  ).trim();

  const discountPrice = invoice?.discount_price ?? "0.00";

  const total = invoice?.total ?? "0.00";

  const advancePayment = invoice?.advance_payment ?? "0.00";

  const duePayment = invoice?.due_payment ?? "0.00";

  const hasAdditionalCharge = Number(additionalCharge) > 0;

  return (
    <section className="invoice-document w-full min-w-0">
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
                  {brandName}
                </h1>

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
              bookingSlots={bookingSlots}
              eventDate={eventDate}
              formatDate={formatDate}
            />

            {/* Event details */}
            <div className="invoice-section mt-4 break-inside-avoid">
              <h2 className="font-serif text-base font-bold text-gray-950">
                Event Details
              </h2>

              <div className="mt-2">
                <table className="w-full table-fixed border-collapse">
                  <thead>
                    <tr className="bg-[#b60018] text-white">
                      <th className="w-[14%] border-r border-white/60 px-2 py-1.5 text-left text-[10px] font-bold uppercase">
                        Event
                      </th>

                      <th className="w-[18%] border-r border-white/60 px-2 py-1.5 text-left text-[10px] font-bold uppercase">
                        Event Date
                      </th>

                      <th className="w-[16%] border-r border-white/60 px-2 py-1.5 text-left text-[10px] font-bold uppercase">
                        Duration
                      </th>

                      <th className="w-[10%] border-r border-white/60 px-2 py-1.5 text-center text-[10px] font-bold uppercase">
                        Shifts
                      </th>

                      <th className="w-[22%] border-r border-white/60 px-2 py-1.5 text-left text-[10px] font-bold uppercase">
                        Service / Package
                      </th>

                      <th className="w-[20%] px-2 py-1.5 text-right text-[10px] font-bold uppercase">
                        Price
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {eventRows.map((row) => (
                      <tr key={row.id} className="border-b border-gray-200">
                        <td className="border-r border-gray-200 px-2 py-2 text-[10px] font-medium leading-4 text-gray-700">
                          {row.eventType}
                        </td>

                        <td className="border-r border-gray-200 px-2 py-2 text-[10px] leading-4 text-gray-700">
                          {row.date}
                        </td>

                        <td className="border-r border-gray-200 px-2 py-2 text-[10px] font-medium leading-4 text-gray-700">
                          {row.duration}
                        </td>

                        <td className="border-r border-gray-200 px-2 py-2 text-center text-[10px] font-semibold text-gray-950">
                          {row.shiftCount}
                        </td>

                        <td className="border-r border-gray-200 px-2 py-2">
                          <p className="wrap-break-word text-[10px] font-semibold leading-4 text-gray-800">
                            {row.bookingTitle}
                          </p>
                        </td>

                        <td className="px-2 py-2 text-right">
                          {row.unitPrice !== null ? (
                            <>
                              <p className="whitespace-nowrap text-[9px] leading-4 text-gray-500">
                                {formatMoney(row.unitPrice)} × {row.shiftCount}
                              </p>

                              {row.amount !== null ? (
                                <p className="mt-0.5 whitespace-nowrap text-[10px] font-bold text-gray-950">
                                  {formatMoney(row.amount)}
                                </p>
                              ) : null}
                            </>
                          ) : row.amount !== null ? (
                            <p className="whitespace-nowrap text-[10px] font-bold text-gray-950">
                              {formatMoney(row.amount)}
                            </p>
                          ) : (
                            <p className="text-[10px] text-gray-500">
                              Included
                            </p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-16">
              {/* Agreement + financial summary */}
              <div className="grid grid-cols-[1fr_280px] gap-8 break-inside-avoid">
                <div className="flex min-w-0 flex-col items-start justify-between">
                  <TermsConditions
                    terms={invoice?.terms_conditions}
                    brandName={brandName}
                  />

                  <div>
                    <p className="max-w-full border-b pb-2 text-sm">
                      {invoice?.customer_agreed
                        ? `${
                            invoice?.customer?.full_name ||
                            invoice?.customer_name_snapshot ||
                            "Not available"
                          } ( I agree )`
                        : invoice?.customer_agreed === false
                          ? "Customer Disagreed"
                          : "Pending Confirmation"}
                    </p>

                    <p className="pt-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#b60018]">
                      Customer Agreement
                    </p>
                  </div>
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
                    label="Base Price"
                    value={formatMoney(servicePrice)}
                  />

                  <SummaryRow
                    label="Additional Charge"
                    value={
                      hasAdditionalCharge
                        ? `+ ${formatMoney(additionalCharge)}`
                        : formatMoney(additionalCharge)
                    }
                  />

                  {additionalChargeReason ? (
                    <div className="mb-2 border-b border-gray-200 pb-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Additional Charge Reason
                      </p>

                      <p className="mt-1 wrap-break-word text-[11px] leading-4 text-gray-700">
                        {additionalChargeReason}
                      </p>
                    </div>
                  ) : null}

                  <SummaryRow
                    label="Discount"
                    value={`− ${formatMoney(discountPrice)}`}
                    variant="discount"
                  />

                  <SummaryRow
                    label="Total"
                    value={formatMoney(total)}
                    variant="total"
                  />

                  <SummaryRow
                    label="Advance Payment"
                    value={`− ${formatMoney(advancePayment)}`}
                    variant="paid"
                  />

                  <SummaryRow
                    label="Due Payment"
                    value={formatMoney(duePayment)}
                    variant="due"
                  />
                </div>
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
