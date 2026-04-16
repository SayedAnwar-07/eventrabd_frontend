import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function EmptyState({
  title,
  description,
  buttonLabel,
  buttonTo,
}) {
  return (
    <div className="rounded-3xl border border-dashed bg-white p-10 text-center shadow-sm">
      <div className="mx-auto max-w-md space-y-3">
        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
        <p className="text-sm leading-6 text-slate-600">{description}</p>
        {buttonLabel && buttonTo ? (
          <Button asChild className="mt-3 rounded-xl px-5">
            <Link to={buttonTo}>{buttonLabel}</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
