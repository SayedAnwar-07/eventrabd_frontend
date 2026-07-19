const STATUS_STYLES = {
  pending: "border-amber-300 bg-amber-50 text-amber-800",
  accepted: "border-green-300 bg-green-50 text-green-800",
  rejected: "border-red-300 bg-red-50 text-red-700",
  cancelled: "border-gray-300 bg-gray-100 text-gray-700",
};

const formatStatus = (status = "") => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const HireStatusBadge = ({ status }) => {
  return (
    <span
      className={`inline-flex border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
        STATUS_STYLES[status] || STATUS_STYLES.cancelled
      }`}
    >
      {formatStatus(status)}
    </span>
  );
};

export default HireStatusBadge;
