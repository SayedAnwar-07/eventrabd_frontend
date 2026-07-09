import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <section className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-primary">
          404 Error
        </p>

        <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Page not found
        </h1>

        <p className="mx-auto mb-8 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
          The page you are looking for does not exist, was removed, or the link
          may be incorrect.
        </p>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex h-11 items-center justify-center gap-2 border border-primary bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            <Home size={17} />
            Go Home
          </Link>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex h-11 items-center justify-center gap-2 border border-border bg-background px-5 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            <ArrowLeft size={17} />
            Go Back
          </button>
        </div>
      </div>
    </section>
  );
}
