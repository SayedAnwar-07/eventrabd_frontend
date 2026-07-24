import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchHires,
  selectHires,
  selectHireError,
  selectHireListLoading,
} from "@/store/features/hire/hireSlice";

const statusFilters = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const statusStyles = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  accepted: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-red-200 bg-red-50 text-red-700",
  cancelled: "border-gray-200 bg-gray-100 text-gray-600",
  completed: "border-blue-200 bg-blue-50 text-blue-700",
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

  return "Unable to load your booking requests.";
};

const formatDate = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatTime = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
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

  return `৳${amount.toLocaleString("en-BD")}`;
};

const getFirstBookingSlot = (bookingSlots = []) => {
  if (!Array.isArray(bookingSlots) || bookingSlots.length === 0) {
    return null;
  }

  return [...bookingSlots].sort(
    (first, second) =>
      new Date(first.starts_at).getTime() -
      new Date(second.starts_at).getTime(),
  )[0];
};

const CustomerHireCard = ({ hire }) => {
  const firstBookingSlot = getFirstBookingSlot(hire.booking_slots);

  const serviceName =
    hire.service?.service_display_name ||
    hire.service?.service_name ||
    "Event service";

  const brandName = hire.brand?.brand_name || "Service provider";

  const bookingCount = hire.booking_slots?.length || 0;

  const normalizedStatus = hire.status?.toLowerCase() || "pending";

  return (
    <article className="border border-gray-200 bg-white transition hover:border-gray-300">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                  statusStyles[normalizedStatus] ||
                  "border-gray-200 bg-gray-50 text-gray-600"
                }`}
              >
                {normalizedStatus}
              </span>

              <span className="text-xs text-gray-500">
                Requested {formatDate(hire.created_at)}
              </span>
            </div>

            <h2 className="mt-4 text-lg font-semibold tracking-tight text-gray-950 sm:text-xl">
              {serviceName}
            </h2>

            <p className="mt-1 text-sm text-gray-600">{brandName}</p>
          </div>

          <Link
            to={String(hire.id)}
            className="inline-flex shrink-0 items-center justify-center border border-gray-950 px-4 py-2.5 text-sm font-semibold text-gray-950 transition hover:bg-gray-950 hover:text-white"
          >
            View details
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 border-t border-gray-100 pt-5 sm:grid-cols-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-gray-500">
              Booking date
            </p>

            {firstBookingSlot ? (
              <>
                <p className="mt-1.5 text-sm font-semibold text-gray-950">
                  {formatDate(firstBookingSlot.starts_at)}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {formatTime(firstBookingSlot.starts_at)}
                  {firstBookingSlot.ends_at
                    ? ` – ${formatTime(firstBookingSlot.ends_at)}`
                    : ""}
                </p>
              </>
            ) : (
              <p className="mt-1.5 text-sm text-gray-500">
                Schedule unavailable
              </p>
            )}
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-gray-500">
              Service charge
            </p>

            <p className="mt-1.5 text-sm font-semibold text-gray-950">
              {formatPrice(hire.service?.shift_charge)}
            </p>

            {hire.service?.shift_hour ? (
              <p className="mt-1 text-xs text-gray-500">
                {hire.service.shift_hour} hours per shift
              </p>
            ) : null}
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-gray-500">
              Booking slots
            </p>

            <p className="mt-1.5 text-sm font-semibold text-gray-950">
              {bookingCount} {bookingCount === 1 ? "date" : "dates"}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Included in this request
            </p>
          </div>
        </div>
      </div>
    </article>
  );
};

const CustomerHireRequestsPage = () => {
  const dispatch = useDispatch();

  const hires = useSelector(selectHires);
  const loading = useSelector(selectHireListLoading);
  const error = useSelector(selectHireError);

  const [activeStatus, setActiveStatus] = useState("all");

  useEffect(() => {
    dispatch(fetchHires());
  }, [dispatch]);

  const filteredHires = useMemo(() => {
    if (activeStatus === "all") {
      return hires;
    }

    return hires.filter(
      (hire) => hire.status?.toLowerCase() === activeStatus,
    );
  }, [activeStatus, hires]);

  const filterCounts = useMemo(() => {
    return hires.reduce(
      (counts, hire) => {
        const status = hire.status?.toLowerCase();

        counts.all += 1;

        if (status && Object.hasOwn(counts, status)) {
          counts[status] += 1;
        }

        return counts;
      },
      {
        all: 0,
        pending: 0,
        accepted: 0,
        rejected: 0,
        completed: 0,
        cancelled: 0,
      },
    );
  }, [hires]);

  const handleRefresh = () => {
    dispatch(fetchHires());
  };

  return (
    <div className="min-h-screen bg-white text-gray-950">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <header className="flex flex-col gap-5 border-b border-gray-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
              Customer Dashboard
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
              My Bookings
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-600">
              Track your service requests and review their current status.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center justify-center border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 transition hover:border-gray-950 hover:text-gray-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </header>

        <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {statusFilters.map((filter) => {
              const isActive = activeStatus === filter.value;

              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setActiveStatus(filter.value)}
                  aria-pressed={isActive}
                  className={`shrink-0 border px-3 py-2 text-xs font-semibold transition ${
                    isActive
                      ? "border-gray-950 bg-gray-950 text-white"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-400 hover:text-gray-950"
                  }`}
                >
                  {filter.label}
                  <span
                    className={`ml-2 ${
                      isActive ? "text-gray-300" : "text-gray-400"
                    }`}
                  >
                    {filterCounts[filter.value]}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="shrink-0 text-sm text-gray-500">
            {filteredHires.length}{" "}
            {filteredHires.length === 1 ? "booking" : "bookings"}
          </p>
        </div>

        {error ? (
          <div className="mb-6 flex flex-col gap-3 border border-red-200 bg-red-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-red-700">
              {getErrorMessage(error)}
            </p>

            <button
              type="button"
              onClick={handleRefresh}
              className="self-start text-sm font-semibold text-red-700 underline underline-offset-4 sm:self-auto"
            >
              Try again
            </button>
          </div>
        ) : null}

        {loading && hires.length === 0 ? (
          <section className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse border border-gray-200 p-6"
              >
                <div className="h-4 w-24 bg-gray-200" />
                <div className="mt-5 h-6 w-52 bg-gray-200" />
                <div className="mt-3 h-4 w-32 bg-gray-100" />

                <div className="mt-6 grid grid-cols-1 gap-5 border-t border-gray-100 pt-5 sm:grid-cols-3">
                  <div className="h-12 bg-gray-100" />
                  <div className="h-12 bg-gray-100" />
                  <div className="h-12 bg-gray-100" />
                </div>
              </div>
            ))}
          </section>
        ) : null}

        {!loading && !error && hires.length === 0 ? (
          <section className="border border-dashed border-gray-300 px-6 py-16 text-center">
            <p className="text-lg font-semibold text-gray-950">
              No bookings yet
            </p>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600">
              Your submitted service requests will appear here.
            </p>
          </section>
        ) : null}

        {!loading &&
        !error &&
        hires.length > 0 &&
        filteredHires.length === 0 ? (
          <section className="border border-dashed border-gray-300 px-6 py-14 text-center">
            <p className="font-semibold text-gray-950">
              No {activeStatus} bookings
            </p>

            <button
              type="button"
              onClick={() => setActiveStatus("all")}
              className="mt-3 text-sm font-semibold text-gray-700 underline underline-offset-4"
            >
              View all bookings
            </button>
          </section>
        ) : null}

        {filteredHires.length > 0 ? (
          <section className="space-y-4">
            {filteredHires.map((hire) => (
              <CustomerHireCard key={hire.id} hire={hire} />
            ))}
          </section>
        ) : null}
      </main>
    </div>
  );
};

export default CustomerHireRequestsPage;