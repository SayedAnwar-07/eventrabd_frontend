import { Link } from "react-router-dom";

import HireDecisionDialog from "./HireDecisionDialog";
import HireStatusBadge from "./HireStatusBadge";

const formatServiceName = (name = "") => {
  return name
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const formatLocalDateTime = (value) => {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") {
    return "Not available";
  }

  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return `৳${value}`;
  }

  return `৳${amount.toLocaleString("en-US")}`;
};

const InformationItem = ({ label, value }) => {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-medium text-foreground">
        {value}
      </p>
    </div>
  );
};

const SellerHireRequestCard = ({ hire }) => {
  const slots = Array.isArray(hire?.booking_slots) ? hire.booking_slots : [];

  const firstSlot = slots[0];

  const customerName = hire?.customer?.full_name || "Unknown customer";

  const serviceName =
    hire?.service?.service_display_name ||
    formatServiceName(hire?.service?.service_name) ||
    "Event Service";

  const venue =
    firstSlot?.venue_name || firstSlot?.venue_address || "Venue not provided";

  const isPending = hire?.status === "pending";
  const canCreateInvoice = hire?.can_create_invoice === true;

  const detailsRoute = `/seller/hire-requests/${hire?.id}`;

  return (
    <article className="border border-border">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Hire Request
          </p>

          <h2 className="mt-1 truncate text-lg font-semibold text-foreground">
            {serviceName}
          </h2>
        </div>

        <HireStatusBadge status={hire?.status} />
      </div>

      {/* Six important details */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-5 px-5 py-5 md:grid-cols-3">
        <InformationItem label="Customer" value={customerName} />

        <InformationItem
          label="Event Date"
          value={formatLocalDateTime(firstSlot?.starts_at)}
        />

        <InformationItem label="Venue" value={venue} />

        <InformationItem
          label="Booking Dates"
          value={`${slots.length} ${slots.length === 1 ? "date" : "dates"}`}
        />

        <InformationItem
          label="Service Charge"
          value={formatCurrency(hire?.service?.shift_charge)}
        />

        <InformationItem
          label="Brand"
          value={hire?.brand?.brand_name || "Not available"}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-end">
        {isPending ? (
          <>
            <HireDecisionDialog
              hire={hire}
              decision="reject"
              trigger={
                <button
                  type="button"
                  className="min-h-10 border border-red-600 px-5 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  Reject
                </button>
              }
            />

            <HireDecisionDialog
              hire={hire}
              decision="accept"
              trigger={
                <button
                  type="button"
                  className="min-h-10 border border-foreground bg-foreground px-5 py-2 text-sm font-semibold text-background transition hover:opacity-85"
                >
                  Accept
                </button>
              }
            />
          </>
        ) : null}

        {canCreateInvoice ? (
          <Link
            to={detailsRoute}
            className="inline-flex min-h-10 items-center justify-center border border-foreground bg-foreground px-5 py-2 text-sm font-semibold text-background transition hover:opacity-85"
          >
            View Details & Create Invoice
          </Link>
        ) : (
          <Link
            to={detailsRoute}
            className="inline-flex min-h-10 items-center justify-center border border-border px-5 py-2 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            View Hire Details
          </Link>
        )}
      </div>
    </article>
  );
};

export default SellerHireRequestCard;
