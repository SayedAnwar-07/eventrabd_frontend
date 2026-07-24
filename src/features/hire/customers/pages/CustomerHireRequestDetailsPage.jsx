import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  Clock3,
  Mail,
  MapPin,
  Phone,
  Store,
  UserRound,
} from "lucide-react";

import {
  clearSelectedHire,
  fetchHireDetails,
  selectHireDetailsLoading,
  selectHireError,
  selectSelectedHire,
} from "@/store/features/hire/hireSlice";

const statusConfig = {
  pending: {
    label: "Pending",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    message: "Your request is waiting for the seller's response.",
  },

  accepted: {
    label: "Accepted",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    message: "The seller has accepted your hire request.",
  },

  rejected: {
    label: "Rejected",
    className: "border-red-200 bg-red-50 text-red-700",
    message: "The seller is unavailable for this booking.",
  },

  cancelled: {
    label: "Cancelled",
    className: "border-gray-200 bg-gray-100 text-gray-700",
    message: "This hire request has been cancelled.",
  },

  completed: {
    label: "Completed",
    className: "border-blue-200 bg-blue-50 text-blue-700",
    message: "This booking has been completed.",
  },
};

const getErrorMessage = (error) => {
  if (!error) return "";

  if (typeof error === "string") {
    return error;
  }

  if (error.detail) {
    return error.detail;
  }

  if (error.message) {
    return error.message;
  }

  return "Unable to load the hire request.";
};

const formatDate = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

const formatTime = (value) => {
  if (!value) return "Not available";

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

const formatDateTime = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

const formatPrice = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "Not available";
  }

  return `৳${amount.toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const DetailsLoadingState = () => {
  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-4 w-32 bg-gray-200" />

          <div className="mt-8 border border-gray-200 p-6">
            <div className="h-5 w-24 bg-gray-200" />
            <div className="mt-4 h-9 w-64 bg-gray-200" />
            <div className="mt-3 h-4 w-40 bg-gray-100" />

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="h-20 bg-gray-100" />
              <div className="h-20 bg-gray-100" />
              <div className="h-20 bg-gray-100" />
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            <div className="h-80 bg-gray-100 lg:col-span-2" />
            <div className="h-80 bg-gray-100" />
          </div>
        </div>
      </main>
    </div>
  );
};

const CustomerHireRequestDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const hire = useSelector(selectSelectedHire);
  const loading = useSelector(selectHireDetailsLoading);
  const error = useSelector(selectHireError);

  useEffect(() => {
    dispatch(clearSelectedHire());

    if (id) {
      dispatch(fetchHireDetails(id));
    }

    return () => {
      dispatch(clearSelectedHire());
    };
  }, [dispatch, id]);

  const handleRetry = () => {
    if (id) {
      dispatch(fetchHireDetails(id));
    }
  };

  if (loading && !hire) {
    return <DetailsLoadingState />;
  }

  if (error && !hire) {
    return (
      <div className="min-h-screen bg-white">
        <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <section className="border border-red-200 bg-red-50 px-6 py-10 text-center">
            <h1 className="text-xl font-semibold text-gray-950">
              Unable to load request
            </h1>

            <p className="mt-2 text-sm text-red-700">
              {getErrorMessage(error)}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={handleRetry}
                className="bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Try again
              </button>

              <Link
                to="/customer/hire-requests"
                className="border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-800 transition hover:border-gray-950"
              >
                Back to orders
              </Link>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (!hire) {
    return (
      <div className="min-h-screen bg-white">
        <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <section className="border border-gray-200 px-6 py-12 text-center">
            <h1 className="text-xl font-semibold text-gray-950">
              Hire request not found
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              This order may have been removed or is unavailable.
            </p>

            <Link
              to="/customer/hire-requests"
              className="mt-6 inline-flex border border-gray-950 px-5 py-2.5 text-sm font-semibold text-gray-950 transition hover:bg-gray-950 hover:text-white"
            >
              Back to orders
            </Link>
          </section>
        </main>
      </div>
    );
  }

  const normalizedStatus = hire.status?.toLowerCase() || "pending";

  const currentStatus = statusConfig[normalizedStatus] || statusConfig.pending;

  const serviceName =
    hire.service?.service_display_name ||
    hire.service?.service_name ||
    "Event service";

  const brandName = hire.brand?.brand_name || "Service provider";

  const bookingSlots = Array.isArray(hire.booking_slots)
    ? hire.booking_slots
    : [];

  return (
    <div className="min-h-screen bg-white text-gray-950">
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <Link
          to="/customer/hire-requests"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to my orders
        </Link>

        <section className="mt-7 border border-gray-200">
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-7">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${currentStatus.className}`}
                >
                  {currentStatus.label}
                </span>

                <span className="text-xs text-gray-500">
                  Request #{hire.id}
                </span>
              </div>

              <h1 className="mt-4 text-2xl font-semibold tracking-tight text-gray-950 sm:text-3xl">
                {serviceName}
              </h1>

              <p className="mt-2 text-sm text-gray-600">
                Provided by {brandName}
              </p>
            </div>

            <div className="sm:text-right">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-gray-500">
                Service charge
              </p>

              <p className="mt-1 text-xl font-semibold text-gray-950">
                {formatPrice(hire.service?.shift_charge)}
              </p>

              {hire.service?.shift_hour ? (
                <p className="mt-1 text-xs text-gray-500">
                  {hire.service.shift_hour} hours per shift
                </p>
              ) : null}
            </div>
          </div>

          <div className="border-t border-gray-200 bg-gray-50 px-5 py-4 sm:px-7">
            <p className="text-sm text-gray-700">{currentStatus.message}</p>
          </div>
        </section>

        {error ? (
          <div className="mt-5 border-l-2 border-red-600 bg-red-50 px-5 py-4">
            <p className="text-sm text-red-700">{getErrorMessage(error)}</p>
          </div>
        ) : null}

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <section className="border border-gray-200 lg:col-span-2">
            <div className="border-b border-gray-200 px-5 py-4 sm:px-6">
              <h2 className="font-semibold text-gray-950">Booking schedule</h2>

              <p className="mt-1 text-sm text-gray-500">
                {bookingSlots.length}{" "}
                {bookingSlots.length === 1 ? "booking slot" : "booking slots"}
              </p>
            </div>

            {bookingSlots.length === 0 ? (
              <div className="px-5 py-10 text-center sm:px-6">
                <p className="text-sm text-gray-500">
                  No booking schedule is available.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {bookingSlots.map((slot, index) => (
                  <article key={slot.id} className="p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-semibold text-gray-950">
                        Booking {index + 1}
                      </p>

                      <span className="text-xs text-gray-500">
                        {formatDate(slot.starts_at)}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                      <div className="flex gap-3">
                        <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Date
                          </p>

                          <p className="mt-1 text-sm font-medium text-gray-950">
                            {formatDate(slot.starts_at)}
                          </p>

                          {formatDate(slot.ends_at) !==
                          formatDate(slot.starts_at) ? (
                            <p className="mt-1 text-xs text-gray-500">
                              Ends {formatDate(slot.ends_at)}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Time
                          </p>

                          <p className="mt-1 text-sm font-medium text-gray-950">
                            {formatTime(slot.starts_at)} –{" "}
                            {formatTime(slot.ends_at)}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 sm:col-span-2">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Venue
                          </p>

                          <p className="mt-1 text-sm font-medium text-gray-950">
                            {slot.venue_name || "Venue not provided"}
                          </p>

                          <p className="mt-1 text-sm text-gray-600">
                            {slot.venue_address || "Address not provided"}
                          </p>

                          {slot.location_note ? (
                            <p className="mt-2 text-xs leading-5 text-gray-500">
                              {slot.location_note}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <div className="space-y-5">
            <section className="border border-gray-200">
              <div className="border-b border-gray-200 px-5 py-4">
                <h2 className="font-semibold text-gray-950">
                  Service provider
                </h2>
              </div>

              <div className="space-y-5 p-5">
                <div className="flex gap-3">
                  <Store className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Brand
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-950">
                      {brandName}
                    </p>

                    {hire.brand?.service_area ? (
                      <p className="mt-1 text-xs text-gray-500">
                        {hire.brand.service_area}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex gap-3">
                  <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Seller
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-950">
                      {hire.seller?.full_name || "Not available"}
                    </p>
                  </div>
                </div>

                {hire.seller?.email ? (
                  <div className="flex gap-3">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Email
                      </p>

                      <a
                        href={`mailto:${hire.seller.email}`}
                        className="mt-1 block truncate text-sm text-gray-700 hover:text-gray-950 hover:underline"
                      >
                        {hire.seller.email}
                      </a>
                    </div>
                  </div>
                ) : null}

                {hire.seller?.contact_number ? (
                  <div className="flex gap-3">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Contact
                      </p>

                      <a
                        href={`tel:${hire.seller.contact_number}`}
                        className="mt-1 block text-sm text-gray-700 hover:text-gray-950 hover:underline"
                      >
                        {hire.seller.contact_number}
                      </a>
                    </div>
                  </div>
                ) : null}

                {hire.brand?.whatsapp_number ? (
                  <div className="flex gap-3">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        WhatsApp
                      </p>

                      <p className="mt-1 text-sm text-gray-700">
                        {hire.brand.whatsapp_number}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </section>

            <section className="border border-gray-200">
              <div className="border-b border-gray-200 px-5 py-4">
                <h2 className="font-semibold text-gray-950">
                  Request information
                </h2>
              </div>

              <div className="space-y-5 p-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Requested
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-950">
                    {formatDateTime(hire.created_at)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Last updated
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-950">
                    {formatDateTime(hire.updated_at)}
                  </p>
                </div>

                {hire.accepted_at ? (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Accepted
                    </p>

                    <p className="mt-1 text-sm font-medium text-gray-950">
                      {formatDateTime(hire.accepted_at)}
                    </p>
                  </div>
                ) : null}

                {hire.rejected_at ? (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Rejected
                    </p>

                    <p className="mt-1 text-sm font-medium text-gray-950">
                      {formatDateTime(hire.rejected_at)}
                    </p>
                  </div>
                ) : null}

                {hire.completed_at ? (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Completed
                    </p>

                    <p className="mt-1 text-sm font-medium text-gray-950">
                      {formatDateTime(hire.completed_at)}
                    </p>
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        </div>

        {hire.customer_note || hire.seller_note ? (
          <section className="mt-5 border border-gray-200">
            <div className="border-b border-gray-200 px-5 py-4 sm:px-6">
              <h2 className="font-semibold text-gray-950">Notes</h2>
            </div>

            <div className="grid gap-6 p-5 sm:grid-cols-2 sm:p-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Your note
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-700">
                  {hire.customer_note || "No note was provided."}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Seller note
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-700">
                  {hire.seller_note || "No note was provided."}
                </p>
              </div>
            </div>
          </section>
        ) : null}

        <section className="mt-5 flex items-center gap-3 border border-gray-200 p-5">
          <Banknote className="h-5 w-5 shrink-0 text-gray-400" />

          <div>
            <p className="text-sm font-semibold text-gray-950">
              Invoice availability
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              {hire.can_create_invoice
                ? "An invoice can now be created for this accepted request."
                : "Invoice creation will become available after the request is accepted."}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default CustomerHireRequestDetailsPage;
