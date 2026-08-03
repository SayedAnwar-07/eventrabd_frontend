import { formatPrice } from "@/components/shared/utils/currency";
import { formatServiceName } from "@/components/shared/utils/string";

export default function HireSummary({ hire }) {
  const serviceName =
    hire?.service?.service_display_name ||
    formatServiceName(hire?.service?.service_name) ||
    "Event service";

  return (
    <section className="">
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="font-semibold">Service Summary</h2>
      </div>

      <div className="p-5">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between border-b pb-2">
            <span>Service</span>

            <span className="font-medium">{serviceName}</span>
          </div>

          <div className="flex justify-between border-b pb-2">
            <span>Shift Duration</span>

            <span className="font-medium">
              {hire?.service?.shift_hour !== null &&
              hire?.service?.shift_hour !== undefined
                ? `${hire.service.shift_hour} Hours`
                : "Not available"}
            </span>
          </div>

          <div className="flex justify-between border-b pb-2">
            <span>Shift Charge</span>

            <span className="font-medium">
              {formatPrice(hire?.service?.shift_charge)}
            </span>
          </div>
        </div>

        <div className="flex justify-between py-4">
          <span className="text-sm font-semibold uppercase tracking-wide">
            Total Amount
          </span>

          <span className="text-lg font-bold">
            {formatPrice(hire?.service?.shift_charge)}
          </span>
        </div>
      </div>
    </section>
  );
}
