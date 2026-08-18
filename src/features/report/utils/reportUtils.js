export const REPORT_MAX_MESSAGE_LENGTH = 3000;

export const REPORT_STATUS_CONFIG = {
  pending: {
    label: "Pending",
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300",
  },

  under_review: {
    label: "Under Review",
    className:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-300",
  },

  resolved: {
    label: "Resolved",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300",
  },

  dismissed: {
    label: "Dismissed",
    className:
      "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300",
  },
};

export const getReportStatusConfig = (status) => {
  return (
    REPORT_STATUS_CONFIG[status] ?? {
      label: status || "Unknown",
      className: "border-border bg-muted text-muted-foreground",
    }
  );
};

export const formatReportDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

export const getReportServiceName = (report) => {
  return (
    report?.service?.service_display_name ||
    report?.service?.service_name ||
    "Service"
  );
};

export const getReportBrandName = (report) => {
  return (
    report?.service?.brand_display_name ||
    report?.service?.brand_name ||
    "Event Service Provider"
  );
};

export const getReportHireId = (report) => {
  return report?.hire_id ?? report?.hire?.id ?? report?.hire ?? null;
};

export const findReportByHireId = (reports = [], hireId) => {
  if (!hireId) {
    return null;
  }

  return (
    reports.find(
      (report) => String(getReportHireId(report)) === String(hireId),
    ) ?? null
  );
};

export const canCustomerReport = ({ hire, invoice }) => {
  return hire?.status === "completed" && invoice?.customer_agreed === true;
};
