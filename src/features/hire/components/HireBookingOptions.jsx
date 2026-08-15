import GlobalErrorMessage from "@/components/common/GlobalErrorMessage";

import { formatPrice, MAX_BOOKING_SLOTS } from "../utils/hireFormUtils";

const HireBookingOptions = ({
  bookingMode,
  bookingItems = [],
  serviceCharge,
  packages = [],
  packagesLoading = false,
  packagesError = null,
  loading = false,
  bookingOptionError = "",
  onNormalServiceSelect,
  onPackageToggle,
}) => {
  const availablePackages = Array.isArray(packages) ? packages : [];

  const normalSelected = bookingMode === "normal";

  const selectedPackageCount =
    bookingMode === "packages" ? bookingItems.length : 0;

  return (
    <section className="border border-gray-200 bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
          Booking Option
        </p>

        <h3 className="mt-1 text-lg font-semibold text-gray-950">
          Choose How You Want to Book
        </h3>

        <p className="mt-1 text-sm leading-6 text-gray-600">
          Choose the normal service or select one or more packages.
        </p>
      </div>

      <div className="space-y-5 p-5">
        {/* =====================================
            NORMAL SERVICE
        ====================================== */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">
            Option A
          </p>

          <button
            type="button"
            disabled={loading}
            onClick={onNormalServiceSelect}
            className={`w-full border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
              normalSelected
                ? "border-green-700 bg-green-50"
                : "border-gray-200 bg-white hover:border-gray-400"
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                  normalSelected
                    ? "border-green-700 bg-green-700"
                    : "border-gray-300 bg-white"
                }`}
              >
                {normalSelected && (
                  <span className="text-xs font-bold text-white">✓</span>
                )}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p
                    className={`font-semibold ${
                      normalSelected ? "text-green-900" : "text-gray-950"
                    }`}
                  >
                    Book Service Normally
                  </p>

                  {normalSelected && (
                    <span className="bg-green-700 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                      Selected
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm text-gray-600">
                  Use the regular service charge.
                </p>

                <p
                  className={`mt-2 text-sm font-semibold ${
                    normalSelected ? "text-green-700" : "text-gray-950"
                  }`}
                >
                  {formatPrice(serviceCharge)
                    ? `${formatPrice(serviceCharge)} per shift`
                    : "Service charge unavailable"}
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* =====================================
            PACKAGES
        ====================================== */}
        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">
              Option B
            </p>

            {selectedPackageCount > 0 && (
              <span className="text-xs font-semibold text-green-700">
                {selectedPackageCount} selected
              </span>
            )}
          </div>

          <div className="border border-gray-200">
            <div className="border-b border-gray-200 px-4 py-3">
              <p className="font-semibold text-gray-950">Select Packages</p>

              <p className="mt-1 text-sm text-gray-600">
                You can select multiple different packages.
              </p>
            </div>

            <div className="p-4">
              {packagesLoading ? (
                <div className="py-4 text-center">
                  <p className="text-sm text-gray-500">Loading packages...</p>
                </div>
              ) : packagesError ? (
                <div className="space-y-3">
                  <GlobalErrorMessage error={packagesError} />

                  <p className="text-xs text-gray-500">
                    You can still book this service normally.
                  </p>
                </div>
              ) : availablePackages.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-sm text-gray-500">
                    No packages are currently available.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availablePackages.map((item) => {
                    const isSelected =
                      bookingMode === "packages" &&
                      bookingItems.some(
                        (bookingItem) =>
                          String(bookingItem.packageId) === String(item.id),
                      );

                    const selectionLimitReached =
                      bookingMode === "packages" &&
                      bookingItems.length >= MAX_BOOKING_SLOTS;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        disabled={
                          loading || (!isSelected && selectionLimitReached)
                        }
                        onClick={() => onPackageToggle(item.id)}
                        className={`w-full border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          isSelected
                            ? "border-green-700 bg-green-50"
                            : "border-gray-200 bg-white hover:border-gray-400"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Checkbox */}
                          <span
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border ${
                              isSelected
                                ? "border-green-700 bg-green-700"
                                : "border-gray-300 bg-white"
                            }`}
                          >
                            {isSelected && (
                              <span className="text-xs font-bold text-white">
                                ✓
                              </span>
                            )}
                          </span>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p
                                className={`wrap-break-word font-semibold ${
                                  isSelected
                                    ? "text-green-900"
                                    : "text-gray-950"
                                }`}
                              >
                                {item?.package_title || "Untitled Package"}
                              </p>

                              {isSelected && (
                                <span className="bg-green-700 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                                  Selected
                                </span>
                              )}
                            </div>

                            <p
                              className={`mt-1 text-sm font-semibold ${
                                isSelected ? "text-green-700" : "text-[#a2101b]"
                              }`}
                            >
                              {formatPrice(item?.package_price) ||
                                "Package price unavailable"}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {bookingOptionError && (
          <p className="text-xs text-red-600">{bookingOptionError}</p>
        )}
      </div>
    </section>
  );
};

export default HireBookingOptions;
