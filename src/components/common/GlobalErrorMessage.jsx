import { getApiErrorMessage } from "@/store/constant/getApiErrorMessage";

export default function GlobalErrorMessage({ error, className = "" }) {
  if (!error) {
    return null;
  }

  const message = typeof error === "string" ? error : getApiErrorMessage(error);

  return (
    <div
      className={`border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400 ${className}`}
      role="alert"
    >
      {message}
    </div>
  );
}
