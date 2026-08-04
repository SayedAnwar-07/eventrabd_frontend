import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import CustomerInvoiceDetails from "@/features/invoice/components/CustomerInvoiceDetails";

import BookingSlots from "../components/BookingSlots";
import ErrorState from "../components/ErrorState";
import HireTimeline from "../components/HireTimeline";
import LoadingState from "../components/LoadingState";
import PeopleInformation from "../components/PeopleInformation";
import { useHireDetails } from "../hooks/useHireDetails";

export default function CustomerHireRequestDetailsPage() {
  const { id } = useParams();

  const { hire, loading, error, retry } = useHireDetails(id);

  if (loading && !hire) {
    return <LoadingState />;
  }

  if (error && !hire) {
    return <ErrorState error={error} loading={loading} onRetry={retry} />;
  }

  if (!hire) {
    return (
      <div className="min-h-screen">
        <main className="mx-auto max-w-3xl px-4 py-16">
          <section className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <h1 className="text-xl font-semibold text-gray-950 dark:text-white">
              Hire request not found
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
              This booking may have been removed or you may not have permission
              to view it.
            </p>

            <Link
              to="/customer/hire-requests"
              className="mt-6 inline-flex rounded-full border border-red-600 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-600 hover:text-white"
            >
              Back to Bookings
            </Link>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-6xl px-4 py-8 lg:py-10">
        <Link
          to="/customer/hire-requests"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-950 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Bookings
        </Link>

        {error?.message ? (
          <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-5 py-4 dark:border-red-950 dark:bg-red-950/30">
            <p className="text-sm text-red-700 dark:text-red-400">
              {error.message}
            </p>
          </div>
        ) : null}

        <section className="mt-6">
          <HireTimeline hire={hire} />
        </section>

        <section className="mt-12">
          <BookingSlots hire={hire} />
        </section>

        <section className="mt-10">
          <PeopleInformation hire={hire} />
        </section>

        <section className="mt-10">
          <CustomerInvoiceDetails key={hire.id} hire={hire} />
        </section>
      </main>
    </div>
  );
}
