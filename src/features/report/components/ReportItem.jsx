import { Link } from "react-router-dom";
import { CalendarDays, ChevronRight, ImageIcon } from "lucide-react";

import ReportStatusBadge from "./ReportStatusBadge";

import {
  formatReportDate,
  getReportBrandName,
  getReportServiceName,
} from "../utils/reportUtils";

export default function ReportItem({ report }) {
  const serviceName = getReportServiceName(report);
  const brandName = getReportBrandName(report);

  return (
    <Link
      to={`/customer/reports/${report.id}`}
      className="group block rounded-xl border border-border bg-background p-4 transition-colors hover:bg-muted/30 sm:p-5"
    >
      <div className="flex gap-4">
        {report.image_url && (
          <div className="hidden h-20 w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-muted sm:block">
            <img
              src={report.image_url}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="truncate font-semibold text-foreground">
                {serviceName}
              </h2>

              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {brandName}
              </p>
            </div>

            <ReportStatusBadge status={report.status} />
          </div>

          <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {report.message}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatReportDate(report.created_at)}
            </span>

            {report.image_url && (
              <span className="flex items-center gap-1.5 sm:hidden">
                <ImageIcon className="h-3.5 w-3.5" />
                Image attached
              </span>
            )}
          </div>
        </div>

        <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
