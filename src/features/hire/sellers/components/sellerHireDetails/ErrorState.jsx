import { XCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function ErrorState({
  error,
  loading,
  onRetry,
  backTo = "/customer/hire-requests",
  backLabel = "Back to Bookings",
}) {
  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-3xl px-4 py-16">
        <section
          role="alert"
          className="rounded-2xl border border-red-100 bg-white px-6 py-12 text-center shadow-sm dark:border-red-950 dark:bg-gray-950"
        >
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40">
            <XCircle className="h-6 w-6 text-red-600" />
          </span>

          <h1 className="mt-4 text-xl font-semibold text-gray-950 dark:text-white">
            Unable to load request
          </h1>

          <p className="mt-2 text-sm text-red-700 dark:text-red-400">
            {error?.message || "Unable to load the hire request."}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={onRetry}
              disabled={loading}
              className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Loading..." : "Try Again"}
            </button>

            <Link
              to={backTo}
              className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-950 transition hover:border-gray-950 dark:border-gray-700 dark:text-white"
            >
              {backLabel}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
