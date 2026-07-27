const STATUS_STYLES = {
  pending: "border-amber-300 bg-amber-50 text-amber-800",
  accepted: "border-green-300 bg-green-50 text-green-800",
  rejected: "border-red-300 bg-red-50 text-red-700",
  cancelled: "border-gray-300 bg-gray-100 text-gray-700",
  completed: "border-blue-300 bg-blue-50 text-blue-700",
};

const formatStatus = (status = "") => {
  if (!status) {
    return "Unknown";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
};

const HireStatusBadge = ({ status }) => {
  const style = STATUS_STYLES[status] || STATUS_STYLES.cancelled;

  return (
    <span
      className={`inline-flex border px-2.5 py-1 text-xs ${"font-semibold uppercase tracking-wide"} ${style}`}
    >
      {formatStatus(status)}
    </span>
  );
};

export default HireStatusBadge;
