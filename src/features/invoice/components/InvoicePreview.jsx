import { formatMoney } from "../utils/currency";

const PreviewItem = ({ label, value, displayValue, emphasized = false }) => {
  return (
    <div
      className={
        emphasized
          ? "rounded-xl bg-[#b60018] p-4 text-white"
          : "rounded-xl border border-gray-200 bg-white p-4"
      }
    >
      <p
        className={`text-[10px] font-bold uppercase tracking-[0.12em] ${
          emphasized ? "text-red-100" : "text-gray-500"
        }`}
      >
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold">
        {displayValue ?? formatMoney(value)}
      </p>
    </div>
  );
};

const InvoicePreview = ({
  basePrice,
  additionalCharge,
  discount,
  advance,
  total,
  duePayment,
  backendOnly = false,
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
      <h3 className="font-semibold text-gray-950">
        {backendOnly ? "Current Backend Values" : "Financial Preview"}
      </h3>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <PreviewItem label="Base Price" value={basePrice} />

        <PreviewItem label="Additional Charge" value={additionalCharge} />

        <PreviewItem label="Discount" value={discount} />

        <PreviewItem label="Advance" value={advance} />

        <PreviewItem label="Total" value={total} />

        <PreviewItem label="Due Payment" value={duePayment} emphasized />
      </div>
    </div>
  );
};

export default InvoicePreview;
