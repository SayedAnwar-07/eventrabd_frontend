import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchHires,
  selectHires,
  selectHireError,
  selectHireListLoading,
} from "@/store/features/hire/hireSlice";

import SellerHireRequestCard from "../components/SellerHireRequestCard";

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

  return "Unable to load hire requests.";
};

const SellerHireRequestsPage = () => {
  const dispatch = useDispatch();

  const hires = useSelector(selectHires);
  const loading = useSelector(selectHireListLoading);
  const error = useSelector(selectHireError);

  useEffect(() => {
    dispatch(fetchHires());
  }, [dispatch]);

  const counts = useMemo(() => {
    return hires.reduce(
      (result, hire) => {
        result.total += 1;

        if (hire.status in result) {
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

  const handleRefresh = () => {
    dispatch(fetchHires());
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

        <section className="grid grid-cols-2 gap-3 py-8 sm:grid-cols-3 lg:grid-cols-6">
          <div className="border border-gray-200 px-4 py-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Total
            </p>

            <p className="mt-2 text-2xl font-semibold text-gray-950">
              {counts.total}
            </p>
          </div>

          <div className="border border-gray-200 px-4 py-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Pending
            </p>

            <p className="mt-2 text-2xl font-semibold text-amber-700">
              {counts.pending}
            </p>
          </div>

          <div className="border border-gray-200 px-4 py-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Accepted
            </p>

            <p className="mt-2 text-2xl font-semibold text-green-700">
              {counts.accepted}
            </p>
          </div>

          <div className="border border-gray-200 px-4 py-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Rejected
            </p>

            <p className="mt-2 text-2xl font-semibold text-red-600">
              {counts.rejected}
            </p>
          </div>

          <div className="border border-gray-200 px-4 py-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Cancelled
            </p>

            <p className="mt-2 text-2xl font-semibold text-gray-600">
              {counts.cancelled}
            </p>
          </div>

          <div className="border border-gray-200 px-4 py-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Completed
            </p>

            <p className="mt-2 text-2xl font-semibold text-blue-700">
              {counts.completed}
            </p>
          </div>
        </section>

        {error ? (
          <div className="mb-6 flex flex-col gap-4 border-l-2 border-red-600 bg-red-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-red-700">{getErrorMessage(error)}</p>

            <button
              type="button"
              onClick={handleRefresh}
              className="self-start text-sm font-semibold text-red-700 underline underline-offset-4 sm:self-auto"
            >
              Try Again
            </button>
          </div>
        ) : null}

        {!loading && !error && hires.length === 0 ? (
          <section className="border border-dashed border-gray-300 px-6 py-16 text-center">
            <p className="text-lg font-semibold text-gray-950">
              No hire requests yet
            </p>

            <p className="mt-2 text-sm text-gray-600">
              Customer booking requests for your services will appear here.
            </p>
          </section>
        ) : (
          <section className="space-y-5">
            {hires.map((hire) => (
              <SellerHireRequestCard key={hire.id} hire={hire} />
            ))}
          </section>
        )}
      </main>
    </div>
  );
};

export default SellerHireRequestsPage;
