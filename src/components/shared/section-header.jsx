import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function SectionHeader({ title, description, ctaLabel, ctaTo }) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="text-sm text-slate-600 sm:text-base">{description}</p>
        ) : null}
      </div>

      {ctaLabel && ctaTo ? (
        <Button asChild className="h-11 rounded-xl px-5">
          <Link to={ctaTo}>{ctaLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
