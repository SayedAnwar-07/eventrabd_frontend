import { Badge } from "@/components/ui/badge";

import { getReportStatusConfig } from "../utils/reportUtils";

export default function ReportStatusBadge({ status }) {
  const config = getReportStatusConfig(status);

  return (
    <Badge
      variant="outline"
      className={`rounded-full px-2.5 py-1 font-medium ${config.className}`}
    >
      {config.label}
    </Badge>
  );
}
