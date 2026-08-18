import {
  Building2,
  CalendarDays,
  Clock3,
  FileText,
  ImageIcon,
  LockKeyhole,
  Mail,
  Phone,
  User,
} from "lucide-react";

import ReportImagePreview from "./ReportImagePreview";
import ReportStatusBadge from "./ReportStatusBadge";

import {
  formatReportDate,
  getReportBrandName,
  getReportServiceName,
} from "../utils/reportUtils";

function DetailRow({ icon, label, children }) {
  if (!children) return null;

  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>

        <div className="mt-0.5 text-sm font-medium text-foreground">
          {children}
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ icon, title }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="text-muted-foreground">{icon}</span>
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
    </div>
  );
}

export default function ReportDetails({ report }) {
  if (!report) {
    return null;
  }

  const serviceName = getReportServiceName(report);
  const brandName = getReportBrandName(report);
  const seller = report.service?.seller;
  const reporter = report.reporter;

  const showUpdatedAt =
    report.updated_at && report.updated_at !== report.created_at;

  return (
    <div className="mx-auto w-full space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4 shrink-0" />
            <span className="truncate">{brandName}</span>
          </div>

          <h1 className="mt-1 truncate text-xl font-semibold tracking-tight sm:text-2xl">
            {serviceName}
          </h1>
        </div>

        <div className="shrink-0">
          <ReportStatusBadge status={report.status} />
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
        <DetailRow
          icon={<CalendarDays className="h-4 w-4" />}
          label="Submitted"
        >
          {formatReportDate(report.created_at)}
        </DetailRow>

        {showUpdatedAt && (
          <DetailRow icon={<Clock3 className="h-4 w-4" />} label="Last updated">
            {formatReportDate(report.updated_at)}
          </DetailRow>
        )}

        {reporter?.full_name && (
          <DetailRow icon={<User className="h-4 w-4" />} label="Reported by">
            {reporter.full_name}
          </DetailRow>
        )}

        {reporter?.email && (
          <DetailRow icon={<Mail className="h-4 w-4" />} label="Reporter email">
            <span className="break-all">{reporter.email}</span>
          </DetailRow>
        )}

        {seller?.full_name && (
          <DetailRow icon={<User className="h-4 w-4" />} label="Seller">
            {seller.full_name}
          </DetailRow>
        )}

        {(seller?.whatsapp_number || seller?.contact_number) && (
          <DetailRow
            icon={<Phone className="h-4 w-4" />}
            label="Seller contact"
          >
            {seller?.whatsapp_number || seller?.contact_number}
          </DetailRow>
        )}
      </div>

      <div className="h-px bg-border/60" />

      {/* Message */}
      <div>
        <SectionHeading
          icon={<FileText className="h-4 w-4" />}
          title="Report details"
        />

        <p className="whitespace-pre-wrap wrap-break-word rounded-md bg-muted/30 p-4 text-sm leading-7 text-foreground/90">
          {report.message}
        </p>
      </div>

      {/* Image */}
      {report.image_url && (
        <>
          <div className="h-px bg-border/60" />

          <div>
            <SectionHeading
              icon={<ImageIcon className="h-4 w-4" />}
              title="Submitted image"
            />

            <div className="overflow-hidden rounded-md">
              <ReportImagePreview
                src={report.image_url}
                alt={`Attachment for ${serviceName} report`}
                readOnly
              />
            </div>
          </div>
        </>
      )}

      {/* Footer note */}
      <div className="flex items-start gap-2 rounded-md bg-muted/30 px-4 py-3 text-xs leading-5 text-muted-foreground">
        <LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <p>
          This report is read-only after submission. Its status is managed
          through the report review process.
        </p>
      </div>
    </div>
  );
}
