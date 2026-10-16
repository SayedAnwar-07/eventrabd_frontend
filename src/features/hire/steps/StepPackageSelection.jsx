import { Check, Package } from "lucide-react";

import GlobalErrorMessage from "@/components/common/GlobalErrorMessage";

import { formatPrice, MAX_BOOKING_SLOTS } from "../utils/hireFormUtils";

const StepPackageSelection = ({
  packages = [],
  packagesLoading = false,
  packagesError = null,

  bookingMode,
  bookingItems = [],

  loading = false,

  onPackageToggle,
}) => {
  const availablePackages = Array.isArray(packages) ? packages : [];

  const selectedPackageCount =
    bookingMode === "packages" ? bookingItems.length : 0;

  return (
    <section className="space-y-6">
      {/* Header */}

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
          Step 2
        </p>

        <h2 className="mt-2 text-2xl font-semibold text-gray-950">
          Select Packages
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          Choose one or more packages for your event.
        </p>
      </div>

      {/* Selected Count */}

      {selectedPackageCount > 0 && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <p className="text-sm font-semibold text-green-800">
            {selectedPackageCount} package
            {selectedPackageCount > 1 ? "s" : ""} selected
          </p>
        </div>
      )}

      {/* Loading */}

      {packagesLoading && (
        <div className="rounded-xl border border-gray-200 p-6 text-center">
          <p className="text-sm text-gray-500">Loading packages...</p>
        </div>
      )}

      {/* Error */}

      {!packagesLoading && packagesError && (
        <div className="space-y-3">
          <GlobalErrorMessage error={packagesError} />

          <p className="text-sm text-gray-500">
            You can still continue with normal booking.
          </p>
        </div>
      )}

      {/* Empty */}

      {!packagesLoading && !packagesError && availablePackages.length === 0 && (
        <div className="rounded-xl border border-gray-200 p-6 text-center">
          <p className="text-sm text-gray-500">No packages available.</p>
        </div>
      )}

      {/* Package List */}

      {!packagesLoading && !packagesError && availablePackages.length > 0 && (
        <div className="grid gap-4">
          {availablePackages.map((item) => {
            const isSelected =
              bookingMode === "packages" &&
              bookingItems.some(
                (bookingItem) =>
                  String(bookingItem.packageId) === String(item.id),
              );

            const limitReached =
              bookingMode === "packages" &&
              bookingItems.length >= MAX_BOOKING_SLOTS;

            return (
              <button
                key={item.id}
                type="button"
                disabled={loading || (!isSelected && limitReached)}
                onClick={() => onPackageToggle(item.id)}
                className={`
                  rounded-2xl border p-5
                  text-left transition

                  ${
                    isSelected
                      ? "border-green-700 bg-green-50"
                      : "border-gray-200 bg-white hover:border-gray-400"
                  }

                  disabled:cursor-not-allowed
                  disabled:opacity-50
                `}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}

                  <div
                    className={`
                      flex h-12 w-12 shrink-0
                      items-center justify-center
                      rounded-xl

                      ${
                        isSelected
                          ? "bg-green-700 text-white"
                          : "bg-gray-100 text-gray-600"
                      }
                    `}
                  >
                    {isSelected ? <Check size={22} /> : <Package size={22} />}
                  </div>

                  {/* Content */}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3
                        className={`
                          font-semibold

                          ${isSelected ? "text-green-900" : "text-gray-950"}
                        `}
                      >
                        {item?.package_title || "Untitled Package"}
                      </h3>

                      {isSelected && (
                        <span
                          className="
                          rounded-full
                          bg-green-700
                          px-3 py-1
                          text-xs
                          font-semibold
                          text-white
                        "
                        >
                          Selected
                        </span>
                      )}
                    </div>

                    <p
                      className={`
                        mt-2
                        text-lg
                        font-bold

                        ${isSelected ? "text-green-700" : "text-[#a2101b]"}
                      `}
                    >
                      {formatPrice(item?.package_price) || "Price unavailable"}
                    </p>

                    {item?.description && (
                      <p
                        className="
                        mt-2
                        text-sm
                        leading-6
                        text-gray-600
                      "
                      >
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default StepPackageSelection;
