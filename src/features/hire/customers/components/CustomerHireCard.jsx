import { Link } from "react-router-dom";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const formatDate = (value) => {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatTime = (value) => {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

const getWhatsAppNumber = (contactNumber) => {
  const digits = String(contactNumber || "").replace(/\D/g, "");

  if (digits.startsWith("01")) {
    return `88${digits}`;
  }

  return digits;
};

const SellerContactDialog = ({ brandName, sellerName, contactNumber }) => {
  const normalizedContactNumber = String(contactNumber || "").trim();

  const whatsappNumber = getWhatsAppNumber(normalizedContactNumber);

  if (!normalizedContactNumber) {
    return (
      <button
        type="button"
        disabled
        className="border border-border px-3 py-2 text-xs font-medium text-muted-foreground opacity-50"
      >
        Contact unavailable
      </button>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex w-full items-center justify-center border border-foreground px-4 py-3 text-sm font-semibold text-foreground transition hover:opacity-70 cursor-pointer"
        >
          {contactNumber || "Contact number unavailable"}
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contact seller</DialogTitle>

          <DialogDescription>
            Choose how you want to contact this seller.
          </DialogDescription>
        </DialogHeader>

        <div className="border-y border-border py-5">
          <p className="text-sm font-semibold text-foreground">{brandName}</p>

          <p className="mt-1 text-sm text-muted-foreground">{sellerName}</p>

          <p className="mt-4 text-sm font-medium text-foreground">
            {normalizedContactNumber}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <a
            href={`tel:${normalizedContactNumber}`}
            className="inline-flex items-center justify-center border border-foreground px-4 py-2.5 text-sm font-semibold text-foreground transition hover:opacity-70"
          >
            Call seller
          </a>

          {whatsappNumber ? (
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center border border-foreground px-4 py-2.5 text-sm font-semibold text-foreground transition hover:opacity-70"
            >
              Open WhatsApp
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground opacity-50"
            >
              WhatsApp unavailable
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const CustomerHireCard = ({ hire }) => {
  const bookingSlots = Array.isArray(hire?.booking_slots)
    ? hire.booking_slots
    : [];

  const sortedBookingSlots = [...bookingSlots].sort((first, second) => {
    const firstTime = new Date(first?.starts_at).getTime();
    const secondTime = new Date(second?.starts_at).getTime();

    return firstTime - secondTime;
  });

  const brandName =
    hire?.brand?.brand_name ||
    hire?.service?.brand?.brand_name ||
    "Service provider";

  const sellerName = hire?.seller?.full_name || "Not available";

  const contactNumber = hire?.seller?.contact_number || "";

  return (
    <article className="border border-border transition hover:border-foreground/40">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Brand and seller */}
        <div className="border-b border-border p-5 sm:p-6 lg:col-span-5 lg:border-b-0 lg:border-r">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Brand
          </p>

          <h2 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
            {brandName}
          </h2>

          <div className="mt-6">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Seller
            </p>

            <p className="mt-2 text-sm font-medium text-foreground">
              {sellerName}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {contactNumber || "Contact number unavailable"}
            </p>
          </div>
        </div>

        {/* Booking dates */}
        <div className="border-b border-border p-5 sm:p-6 lg:col-span-4 lg:border-b-0 lg:border-r">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Date & time
          </p>

          {sortedBookingSlots.length > 0 ? (
            <div className="mt-3 divide-y divide-border">
              {sortedBookingSlots.map((slot, index) => (
                <div
                  key={
                    slot?.id || `${slot?.starts_at || "booking-slot"}-${index}`
                  }
                  className="py-3 first:pt-0 last:pb-0"
                >
                  <p className="text-sm font-semibold text-foreground">
                    {formatDate(slot?.starts_at)}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatTime(slot?.starts_at)}

                    {slot?.ends_at ? ` – ${formatTime(slot.ends_at)}` : ""}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Date and time unavailable
            </p>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col items-center justify-between p-5 sm:p-6 lg:col-span-3">
          <div className="w-full">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Seller
            </p>

            <p className="text-sm font-medium text-foreground">{sellerName}</p>
            <SellerContactDialog
              brandName={brandName}
              sellerName={sellerName}
              contactNumber={contactNumber}
            />
          </div>
          <Link
            to={String(hire?.id)}
            className="inline-flex w-full items-center justify-center border border-foreground px-4 py-3 text-sm font-semibold text-foreground transition hover:opacity-70"
          >
            View hire details
          </Link>
        </div>
      </div>
    </article>
  );
};

export default CustomerHireCard;
