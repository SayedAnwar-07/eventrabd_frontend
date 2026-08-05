const VARIANT_STYLES = {
  default: {
    row: "py-2.5",
    label: "text-gray-600",
    value: "font-semibold text-gray-950",
  },

  discount: {
    row: "py-2.5",
    label: "text-gray-600",
    value: "font-semibold text-amber-600",
  },

  paid: {
    row: "py-2.5",
    label: "text-gray-600",
    value: "font-semibold text-emerald-600",
  },

  total: {
    row: "mt-1 border-t border-gray-200 pb-2.5 pt-3",
    label: "font-bold text-gray-950",
    value: "text-base font-bold text-gray-950",
  },

  due: {
    row: `
      mt-2 rounded-md border border-rose-100
      bg-rose-50/70 px-4 py-3.5
    `,
    label: "font-bold text-gray-950",
    value: "text-lg font-extrabold text-rose-600 ",
  },
};

export default function SummaryRow({ label, value, variant = "default" }) {
  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.default;

  return (
    <div
      className={`flex items-center justify-between gap-6 text-sm ${styles.row}`}
    >
      <span className={styles.label}>{label}</span>

      <span
        className={`shrink-0 whitespace-nowrap tabular-nums ${styles.value}`}
      >
        {value}
      </span>
    </div>
  );
}
