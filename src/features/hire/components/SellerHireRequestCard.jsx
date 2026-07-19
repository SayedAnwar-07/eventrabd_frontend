import HireDecisionDialog from "./HireDecisionDialog";
import HireStatusBadge from "./HireStatusBadge";

const formatServiceName = (name = "") => {
  return name
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const formatLocalDateTime = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const SellerHireRequestCard = ({ hire }) => {
  const slots = Array.isArray(hire?.booking_slots) ? hire.booking_slots : [];

  const firstSlot = slots[0];

  const customerName = hire?.customer?.full_name || "Unknown customer";

  const serviceName =
    hire?.service?.service_display_name ||
    formatServiceName(hire?.service?.service_name);

  const isPending = hire?.status === "pending";

  return (
    <article className="border border-gray-200 bg-white">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
            Hire Request
          </p>

          <h2 className="mt-1 text-xl font-semibold tracking-tight text-gray-950">
            {serviceName || "Event Service"}
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Requested by{" "}
            <span className="font-medium text-gray-950">{customerName}</span>
          </p>
        </div>

        <HireStatusBadge status={hire?.status} />
      </div>

      {/* Main details */}
      <div className="grid grid-cols-1 gap-6 px-5 py-5 md:grid-cols-2">
        <div className="space-y-5">
          {/* Customer */}
          <div className="border-l-2 border-gray-950 pl-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Customer
            </p>

            <p className="mt-1 text-sm font-semibold text-gray-950">
              {customerName}
            </p>

            <p className="mt-1 break-all text-sm text-gray-600">
              {hire?.customer?.email || "No email"}
            </p>

            <p className="mt-1 text-sm text-gray-600">
              {hire?.customer?.contact_number || "No contact number"}
            </p>
          </div>

          {/* Created date */}
          <div className="border-l-2 border-gray-950 pl-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Request Created
            </p>

            <p className="mt-1 text-sm font-medium text-gray-950">
              {formatLocalDateTime(hire?.created_at)}
            </p>
          </div>

          {/* Brand */}
          <div className="border-l-2 border-gray-950 pl-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Brand
            </p>

            <p className="mt-1 text-sm font-semibold text-gray-950">
              {hire?.brand?.brand_name || "N/A"}
            </p>

            <p className="mt-1 text-sm text-gray-600">
              {hire?.brand?.service_area || "No service area"}
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Booking count */}
          <div className="border-l-2 border-gray-950 pl-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Booking Slots
            </p>

            <p className="mt-1 text-sm font-semibold text-gray-950">
              {slots.length} {slots.length === 1 ? "event date" : "event dates"}
            </p>
          </div>

          {/* First event */}
          {firstSlot ? (
            <div className="border-l-2 border-gray-950 pl-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                First Event Date
              </p>

              <p className="mt-1 text-sm font-medium text-gray-950">
                {formatLocalDateTime(firstSlot.starts_at)}
              </p>

              <p className="mt-1 text-sm text-gray-600">
                Ends: {formatLocalDateTime(firstSlot.ends_at)}
              </p>

              <p className="mt-2 text-sm font-medium text-gray-950">
                {firstSlot.venue_name || "Venue not provided"}
              </p>

              <p className="mt-1 text-sm leading-6 text-gray-600">
                {firstSlot.venue_address || "Venue address not provided"}
              </p>

              {firstSlot.location_note ? (
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {firstSlot.location_note}
                </p>
              ) : null}

              {slots.length > 1 ? (
                <p className="mt-3 text-xs font-medium text-gray-500">
                  +{slots.length - 1} more booking{" "}
                  {slots.length - 1 === 1 ? "date" : "dates"}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="border-l-2 border-gray-300 pl-4">
              <p className="text-sm text-gray-500">
                No booking slot information available.
              </p>
            </div>
          )}

          {/* Service charge */}
          <div className="border-l-2 border-gray-950 pl-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Service Charge
            </p>

            <p className="mt-1 text-sm font-semibold text-gray-950">
              {hire?.service?.shift_charge
                ? `৳${hire.service.shift_charge}`
                : "N/A"}
            </p>

            <p className="mt-1 text-sm text-gray-600">
              {hire?.service?.shift_hour
                ? `${hire.service.shift_hour} hours per shift`
                : "Shift duration unavailable"}
            </p>
          </div>
        </div>
      </div>

      {/* Customer note */}
      {hire?.customer_note ? (
        <div className="border-t border-gray-200 bg-gray-50 px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Customer Note
          </p>

          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-700">
            {hire.customer_note}
          </p>
        </div>
      ) : null}

      {/* Seller note after decision */}
      {hire?.seller_note && !isPending ? (
        <div className="border-t border-gray-200 px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Seller Note
          </p>

          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-700">
            {hire.seller_note}
          </p>
        </div>
      ) : null}

      {/* Decision actions */}
      {isPending ? (
        <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:justify-end">
          <HireDecisionDialog
            hire={hire}
            decision="reject"
            trigger={
              <button
                type="button"
                className="border border-red-600 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                Reject Request
              </button>
            }
          />

          <HireDecisionDialog
            hire={hire}
            decision="accept"
            trigger={
              <button
                type="button"
                className="border border-gray-950 bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Accept Request
              </button>
            }
          />
        </div>
      ) : null}

      {/* Accepted invoice state */}
      {hire?.can_create_invoice === true ? (
        <div className="flex border-t border-gray-200 px-5 py-4 sm:justify-end">
          <button
            type="button"
            className="w-full border border-gray-950 bg-white px-5 py-2.5 text-sm font-semibold text-gray-950 transition hover:bg-gray-100 sm:w-auto"
          >
            Create Invoice
          </button>
        </div>
      ) : null}
    </article>
  );
};

export default SellerHireRequestCard;
