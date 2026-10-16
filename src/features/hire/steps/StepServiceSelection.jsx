import { Camera, Package } from "lucide-react";

const StepServiceSelection = ({
  bookingMode,
  serviceCharge,
  onNormalServiceSelect,
  onPackageSelect,
  disabled = false,
}) => {
  const normalSelected = bookingMode === "normal";

  const packageSelected = bookingMode === "packages";

  return (
    <section className="space-y-6">
      {/* Header */}

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
          Step 1
        </p>

        <h2 className="mt-2 text-2xl font-semibold text-gray-950">
          Choose Booking Type
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          Select how you want to hire this service.
        </p>
      </div>

      {/* Options */}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Normal */}

        <button
          type="button"
          disabled={disabled}
          onClick={onNormalServiceSelect}
          className={`
            rounded-2xl border p-6 text-left
            transition
            ${
              normalSelected
                ? "border-green-700 bg-green-50"
                : "border-gray-200 bg-white hover:border-gray-400"
            }
          `}
        >
          <div
            className={`
              flex h-12 w-12 items-center
              justify-center rounded-xl
              ${
                normalSelected
                  ? "bg-green-700 text-white"
                  : "bg-gray-100 text-gray-600"
              }
            `}
          >
            <Camera size={22} />
          </div>

          <h3 className="mt-5 text-lg font-semibold">Book Service Normally</h3>

          <p className="mt-2 text-sm text-gray-600">
            Use the regular service charge.
          </p>

          <p className="mt-4 text-lg font-bold text-green-700">
            ৳{Number(serviceCharge || 0).toLocaleString()} per shift
          </p>
        </button>

        {/* Packages */}

        <button
          type="button"
          disabled={disabled}
          onClick={onPackageSelect}
          className={`
            rounded-2xl border p-6 text-left
            transition
            ${
              packageSelected
                ? "border-green-700 bg-green-50"
                : "border-gray-200 bg-white hover:border-gray-400"
            }
          `}
        >
          <div
            className={`
              flex h-12 w-12 items-center
              justify-center rounded-xl
              ${
                packageSelected
                  ? "bg-green-700 text-white"
                  : "bg-gray-100 text-gray-600"
              }
            `}
          >
            <Package size={22} />
          </div>

          <h3 className="mt-5 text-lg font-semibold">Select Packages</h3>

          <p className="mt-2 text-sm text-gray-600">
            Choose from multiple packages.
          </p>

          <p className="mt-4 text-sm font-medium text-gray-500">
            Premium options available
          </p>
        </button>
      </div>
    </section>
  );
};

export default StepServiceSelection;
