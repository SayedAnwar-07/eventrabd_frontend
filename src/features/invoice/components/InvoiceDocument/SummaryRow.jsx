const VARIANT_STYLES = {
  default: {
    row: "py-2 sm:py-2.5",
    label: "text-gray-600",
    value: "font-semibold text-gray-950",
  },

  discount: {
    row: "py-2 sm:py-2.5",
    label: "text-gray-600",
    value: "font-semibold text-amber-600",
  },

  paid: {
    row: "py-2 sm:py-2.5",
    label: "text-gray-600",
    value: "font-semibold text-emerald-600",
  },

  total: {
    row: "mt-1 border-t border-gray-200 pb-2.5 pt-3",
    label: "font-bold text-gray-950",
    value: "text-sm font-bold text-gray-950 sm:text-base",
  },

  due: {
    row: `
      mt-2 rounded-md border border-rose-100
      bg-rose-50/70 px-3 py-3 sm:px-4 sm:py-3.5
    `,
    label: "font-bold text-gray-950",
    value: "text-base font-extrabold text-rose-600 sm:text-lg",
  },
};

export default function SummaryRow({ label, value, variant = "default" }) {
  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.default;

  return (
    <div
      className={`flex min-w-0 items-start justify-between gap-3 text-xs sm:items-center sm:gap-6 sm:text-sm ${styles.row}`}
    >
      <span className={`min-w-0 leading-5 ${styles.label}`}>{label}</span>

      <span
        className={`max-w-[60%] shrink-0 whitespace-nowrap text-right leading-5 tabular-nums ${styles.value}`}
      >
        {value}
      </span>
    </div>
  );
}
