import { useEffect, useMemo, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import {
  fetchHires,
  selectHires,
  selectHireListError,
  selectHireListLoading,
} from "@/store/features/hire/hireSlice";

import SellerHireRequestCard from "../components/SellerHireRequestCard";

const HIRE_TABS = [
  {
    key: "all",
    label: "Total",
    countKey: "total",
    activeClass: "border-gray-950 bg-gray-950 text-white",
    countClass: "text-gray-950",
  },
  {
    key: "pending",
    label: "Pending",
    countKey: "pending",
    activeClass: "border-amber-700 bg-amber-700 text-white",
    countClass: "text-amber-700",
  },
  {
    key: "accepted",
    label: "Accepted",
    countKey: "accepted",
    activeClass: "border-green-700 bg-green-700 text-white",
    countClass: "text-green-700",
  },
  {
    key: "rejected",
    label: "Rejected",
    countKey: "rejected",
    activeClass: "border-red-600 bg-red-600 text-white",
    countClass: "text-red-600",
  },
  {
    key: "cancelled",
    label: "Cancelled",
    countKey: "cancelled",
    activeClass: "border-gray-600 bg-gray-600 text-white",
    countClass: "text-gray-600",
  },
  {
    key: "completed",
    label: "Completed",
    countKey: "completed",
    activeClass: "border-blue-700 bg-blue-700 text-white",
    countClass: "text-blue-700",
  },
];

const SellerHireRequestsPage = () => {
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState("all");

  const hires = useSelector(selectHires);
  const loading = useSelector(selectHireListLoading);
  const error = useSelector(selectHireListError);

  useEffect(() => {
    dispatch(fetchHires());
  }, [dispatch]);

  const counts = useMemo(() => {
    return hires.reduce(
      (result, hire) => {
        result.total += 1;

        if (Object.prototype.hasOwnProperty.call(result, hire.status)) {
          result[hire.status] += 1;
        }

        return result;
      },
      {
        total: 0,
        pending: 0,
        accepted: 0,
        rejected: 0,
        cancelled: 0,
        completed: 0,
      },
    );
  }, [hires]);

  const filteredHires = useMemo(() => {
    if (activeTab === "all") {
      return hires;
    }

    return hires.filter((hire) => hire.status === activeTab);
  }, [activeTab, hires]);

  const activeTabLabel =
    HIRE_TABS.find((tab) => tab.key === activeTab)?.label || "Hire Requests";

  const handleRefresh = () => {
    if (!loading) {
      dispatch(fetchHires());
    }
  };

  if (loading && hires.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-gray-600">Loading hire requests...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-950">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-5 border-b border-gray-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
              Seller Dashboard
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
              Hire Requests
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
              Review all booking requests received for your event services.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="border border-gray-950 bg-white px-5 py-2.5 text-sm font-semibold text-gray-950 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh Requests"}
          </button>
        </header>

        <section
          role="tablist"
          aria-label="Filter hire requests by status"
          className="grid grid-cols-2 gap-3 py-8 sm:grid-cols-3 lg:grid-cols-6"
        >
          {HIRE_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = counts[tab.countKey];

            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.key)}
                className={`border px-4 py-4 text-left transition ${
                  isActive
                    ? tab.activeClass
                    : "border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50"
                }`}
              >
                <span
                  className={`block text-xs font-medium uppercase tracking-wide ${
                    isActive ? "text-current" : "text-gray-500"
                  }`}
                >
                  {tab.label}
                </span>

                <span
                  className={`mt-2 block text-2xl font-semibold ${
                    isActive ? "text-current" : tab.countClass
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </section>

        {error?.message ? (
          <div
            role="alert"
            className="mb-6 flex flex-col gap-4 border-l-2 border-red-600 bg-red-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-sm text-red-700">{error.message}</p>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="self-start text-sm font-semibold text-red-700 underline underline-offset-4 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
            >
              Try Again
            </button>
          </div>
        ) : null}

        {hires.length > 0 ? (
          <div className="mb-5 flex items-center justify-between border-b border-gray-200 pb-3">
            <h2 className="text-lg font-semibold text-gray-950">
              {activeTabLabel} Requests
            </h2>

            <p className="text-sm text-gray-500">
              {filteredHires.length}{" "}
              {filteredHires.length === 1 ? "request" : "requests"}
            </p>
          </div>
        ) : null}

        {!loading && hires.length === 0 ? (
          <section className="border border-dashed border-gray-300 px-6 py-16 text-center">
            <p className="text-lg font-semibold text-gray-950">
              No hire requests yet
            </p>

            <p className="mt-2 text-sm text-gray-600">
              Customer booking requests for your services will appear here.
            </p>
          </section>
        ) : null}

        {!loading && hires.length > 0 && filteredHires.length === 0 ? (
          <section className="border border-dashed border-gray-300 px-6 py-16 text-center">
            <p className="text-lg font-semibold text-gray-950">
              No {activeTabLabel.toLowerCase()} requests
            </p>

            <p className="mt-2 text-sm text-gray-600">
              There are currently no hire requests with this status.
            </p>
          </section>
        ) : null}

        {filteredHires.length > 0 ? (
          <section
            role="tabpanel"
            className="space-y-5"
            aria-label={`${activeTabLabel} hire requests`}
          >
            {filteredHires.map((hire) => (
              <SellerHireRequestCard key={hire.id} hire={hire} />
            ))}
          </section>
        ) : null}
      </main>
    </div>
  );
};

export default SellerHireRequestsPage;
