export default function StatusAlert({ type = "info", title, message }) {
  const styles = {
    info: "border-blue-200 bg-blue-50 text-blue-800",
    error: "border-red-200 bg-red-50 text-red-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
  };

  return (
    <div className={`rounded-2xl border px-4 py-3 ${styles[type]}`}>
      {title ? <p className="font-medium">{title}</p> : null}
      {message ? <p className="mt-1 text-sm">{message}</p> : null}
    </div>
  );
}
