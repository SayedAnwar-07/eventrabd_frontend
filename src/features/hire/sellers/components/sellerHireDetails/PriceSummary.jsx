const formatAmount = (value) => {
  const amount = Number(value || 0);

  return amount.toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export default function PriceSummary({ service, summary }) {
  const serviceName =
    service?.service_display_name || service?.service_name || "Service";

  const slotCount = summary?.slot_count || 0;
  const hourPerSlot = summary?.shift_hour_per_slot || service?.shift_hour || 0;

  const totalHours = summary?.total_shift_hours || hourPerSlot * slotCount;

  const chargePerSlot =
    summary?.shift_charge_per_slot || service?.shift_charge || 0;

  const totalAmount =
    summary?.total_amount || Number(chargePerSlot) * slotCount;

  return (
    <aside className="h-full">
      <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-950 dark:text-white">
          Service Summary
        </h3>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Service
          </span>

          <span className="text-right text-sm font-semibold text-gray-950 dark:text-white">
            {serviceName}
          </span>
        </div>

        <div className="h-px bg-gray-200 dark:bg-gray-800" />

        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Booking Slots
          </span>

          <span className="text-sm font-semibold text-gray-950 dark:text-white">
            {slotCount}
          </span>
        </div>

        <div className="h-px bg-gray-200 dark:bg-gray-800" />

        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Shift Duration
          </span>

          <span className="text-sm font-semibold text-gray-950 dark:text-white">
            {hourPerSlot} Hours × {slotCount}
          </span>
        </div>

        <div className="h-px bg-gray-200 dark:bg-gray-800" />

        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Total Duration
          </span>

          <span className="text-sm font-semibold text-gray-950 dark:text-white">
            {totalHours} Hours
          </span>
        </div>

        <div className="h-px bg-gray-200 dark:bg-gray-800" />

        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Charge Per Slot
          </span>

          <span className="text-sm font-semibold text-gray-950 dark:text-white">
            {formatAmount(chargePerSlot)} taka
          </span>
        </div>

        <div className="rounded-md bg-gray-950 p-4 text-white dark:bg-white dark:text-gray-950 mt-6">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-medium uppercase tracking-wide opacity-70">
              Total Amount
            </span>

            <span className="text-lg font-bold">
              {formatAmount(totalAmount)} taka
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
