import { useEffect, useMemo, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import CustomerHireCard from "../components/CustomerHireCard";

import {
  fetchHires,
  selectHires,
  selectHireListError,
  selectHireListLoading,
} from "@/store/features/hire/hireSlice";
import GlobalErrorMessage from "@/components/common/GlobalErrorMessage";

const EMPTY_HIRES = [];

const STATUS_FILTERS = [
  {
    value: "all",
    label: "All",
  },
  {
    value: "pending",
    label: "Pending",
  },
  {
    value: "accepted",
    label: "Accepted",
  },
  {
    value: "rejected",
    label: "Rejected",
  },
  {
    value: "completed",
    label: "Completed",
  },
  {
    value: "cancelled",
    label: "Cancelled",
  },
];

const CustomerHireRequestsPage = () => {
  const dispatch = useDispatch();

  const selectedHires = useSelector(selectHires);
  const loading = useSelector(selectHireListLoading);
  const error = useSelector(selectHireListError);

  const hires = Array.isArray(selectedHires) ? selectedHires : EMPTY_HIRES;

  const [activeStatus, setActiveStatus] = useState("all");

  useEffect(() => {
    dispatch(fetchHires());
  }, [dispatch]);

  const filteredHires = useMemo(() => {
    if (activeStatus === "all") {
      return hires;
    }

    return hires.filter((hire) => {
      return hire?.status?.toLowerCase() === activeStatus;
    });
  }, [activeStatus, hires]);

  const filterCounts = useMemo(() => {
    return hires.reduce(
      (counts, hire) => {
        const status = hire?.status?.toLowerCase();

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
    if (!loading) {
      dispatch(fetchHires());
    }
  };

  return (
    <div className="min-h-screen text-foreground">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {/* Header unchanged */}
        <header className="flex flex-col gap-5 border-b border-border pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Customer Dashboard
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              My Bookings
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              Track your service requests and review their current status.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center justify-center border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:border-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </header>

        {/* Filters unchanged */}
        <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {STATUS_FILTERS.map((filter) => {
              const isActive = activeStatus === filter.value;

              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setActiveStatus(filter.value)}
                  aria-pressed={isActive}
                  className={`shrink-0 border px-3 py-2 text-xs font-semibold transition ${
                    isActive
                      ? "border-foreground text-foreground"
                      : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {filter.label}

                  <span className="ml-2 opacity-60">
                    {filterCounts[filter.value]}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="shrink-0 text-sm text-muted-foreground">
            {filteredHires.length}{" "}
            {filteredHires.length === 1 ? "booking" : "bookings"}
          </p>
        </div>

        {/* Error */}
        {error ? <GlobalErrorMessage error={error} /> : null}

        {/* Initial loading */}
        {loading && hires.length === 0 ? (
          <section className="border border-border px-6 py-16 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              Loading bookings...
            </p>
          </section>
        ) : null}

        {/* No bookings */}
        {!loading && !error && hires.length === 0 ? (
          <section className="border border-dashed border-border px-6 py-16 text-center">
            <p className="text-lg font-semibold text-foreground">
              No bookings yet
            </p>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Your submitted service requests will appear here.
            </p>
          </section>
        ) : null}

        {/* No booking for selected filter */}
        {!loading &&
        !error &&
        hires.length > 0 &&
        filteredHires.length === 0 ? (
          <section className="border border-dashed border-border px-6 py-14 text-center">
            <p className="font-semibold text-foreground">
              No {activeStatus} bookings
            </p>

            <button
              type="button"
              onClick={() => setActiveStatus("all")}
              className="mt-3 text-sm font-semibold text-muted-foreground underline underline-offset-4"
            >
              View All Bookings
            </button>
          </section>
        ) : null}

        {/* Booking cards */}
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
