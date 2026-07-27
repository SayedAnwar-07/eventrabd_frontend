import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import SellerHireInvoiceSection from "@/features/invoice/components/SellerHireInvoiceSection";

import {
  fetchHireDetails,
  selectHireDetailsLoading,
  selectSelectedHire,
} from "@/store/features/hire/hireSlice";

const formatMoney = (value) => {
  if (value === null || value === undefined || value === "") {
    return "Not available";
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

const formatDateTime = (value) => {
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

const formatServiceName = (value = "") => {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const InformationItem = ({ label, value, capitalize = false }) => {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <p
        className={`mt-1 wrap-break-word font-medium ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {value || "Not available"}
      </p>
    </div>
  );
};

const SellerHireDetailsPage = () => {
  const { hireId } = useParams();
  const dispatch = useDispatch();

  const hire = useSelector(selectSelectedHire);
  const loading = useSelector(selectHireDetailsLoading);

  useEffect(() => {
    if (!hireId) {
      return undefined;
    }

    const request = dispatch(fetchHireDetails(hireId));

    return () => {
      request.abort?.();
    };
  }, [dispatch, hireId]);

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-5 py-8">
        <div className="border border-border p-6">
          <p className="text-sm text-muted-foreground">
            Loading hire details...
          </p>
        </div>
      </main>
    );
  }

  if (!hire) {
    return (
      <main className="mx-auto max-w-5xl px-5 py-8">
        <div className="border border-border p-6">
          <p className="text-sm text-muted-foreground">
            Hire request not found.
          </p>
        </div>
      </main>
    );
  }

  const bookingSlots = Array.isArray(hire.booking_slots)
    ? hire.booking_slots
    : [];

  const serviceName =
    hire.service?.service_display_name ||
    formatServiceName(hire.service?.service_name) ||
    "Event Service";

  return (
    <main className="mx-auto max-w-5xl px-5 py-8">
      <div className="border border-border">
        {/* Header */}
        <header className="border-b border-border px-6 py-5">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Hire Details
          </p>

          <h1 className="mt-2 text-2xl font-semibold text-foreground">
            {serviceName}
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Customer: {hire.customer?.full_name || "Unknown customer"}
          </p>
        </header>

        {/* Main information */}
        <section className="grid gap-6 p-6 md:grid-cols-2">
          <InformationItem label="Brand" value={hire.brand?.brand_name} />

          <InformationItem label="Status" value={hire.status} capitalize />

          <InformationItem
            label="Service Charge"
            value={formatMoney(hire.service?.shift_charge)}
          />

          <InformationItem
            label="Shift Duration"
            value={
              hire.service?.shift_hour
                ? `${hire.service.shift_hour} ${
                    Number(hire.service.shift_hour) === 1 ? "hour" : "hours"
                  }`
                : "Not available"
            }
          />

          <InformationItem
            label="Booking Dates"
            value={`${bookingSlots.length} ${
              bookingSlots.length === 1 ? "booking" : "bookings"
            }`}
          />

          <InformationItem
            label="Accepted At"
            value={formatDateTime(hire.accepted_at)}
          />
        </section>

        {/* Customer information */}
        <section className="border-t border-border px-6 py-5">
          <h2 className="font-semibold text-foreground">
            Customer Information
          </h2>

          <div className="mt-4 grid gap-5 md:grid-cols-3">
            <InformationItem label="Name" value={hire.customer?.full_name} />

            <InformationItem label="Email" value={hire.customer?.email} />

            <InformationItem
              label="Contact Number"
              value={hire.customer?.contact_number}
            />
          </div>
        </section>

        {/* Booking schedule */}
        <section className="border-t border-border px-6 py-5">
          <h2 className="font-semibold text-foreground">Booking Schedule</h2>

          {bookingSlots.length > 0 ? (
            <div className="mt-4 space-y-4">
              {bookingSlots.map((slot, index) => (
                <article
                  key={slot.id || `${slot.starts_at}-${index}`}
                  className="border border-border p-4"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Booking {index + 1}
                  </p>

                  <h3 className="mt-2 font-semibold text-foreground">
                    {slot.venue_name || "Venue not provided"}
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {slot.venue_address || "Address not provided"}
                  </p>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <InformationItem
                      label="Starts"
                      value={formatDateTime(slot.starts_at)}
                    />

                    <InformationItem
                      label="Ends"
                      value={formatDateTime(slot.ends_at)}
                    />
                  </div>

                  {slot.location_note ? (
                    <div className="mt-4 border-t border-border pt-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Location Note
                      </p>

                      <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                        {slot.location_note}
                      </p>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              No booking schedule is available.
            </p>
          )}
        </section>

        {/* Notes */}
        {hire.customer_note || hire.seller_note ? (
          <section className="border-t border-border px-6 py-5">
            <h2 className="font-semibold text-foreground">Notes</h2>

            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Customer Note
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
                  {hire.customer_note || "No customer note"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Seller Note
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
                  {hire.seller_note || "No seller note"}
                </p>
              </div>
            </div>
          </section>
        ) : null}

        {/* Existing invoice or create invoice */}
        <SellerHireInvoiceSection key={hire.id} hire={hire} />
      </div>
    </main>
  );
};

export default SellerHireDetailsPage;
