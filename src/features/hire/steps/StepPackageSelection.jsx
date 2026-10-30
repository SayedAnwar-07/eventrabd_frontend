import { Check, Loader2 } from "lucide-react";

import GlobalErrorMessage from "@/components/common/GlobalErrorMessage";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { formatPrice, MAX_BOOKING_SLOTS } from "../utils/hireFormUtils";

import useSound from "use-sound";
import boopSfx from "@/assets/musics/hire-packages-book-sound.wav";

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

  const [play] = useSound(boopSfx);

  return (
    <section className="space-y-4">
      {/* HEADER */}
      {/* <div className="space-y-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#756A62]">
          Step 02 · Package Selection
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-[#3D3530] sm:text-2xl">
          Select Packages
        </h2>

        <p className="text-sm leading-relaxed text-[#756A62]">
          Choose one or more packages for your event.
        </p>
      </div> */}

      {/* SELECTED PACKAGE COUNT */}
      {selectedPackageCount > 0 && (
        <div
          role="status"
          className="flex items-center gap-2.5 rounded-md border border-[#E5DDD5] bg-[#FFFCF9] px-3.5 py-2.5"
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#3D3530] text-white">
            <Check size={12} strokeWidth={2.5} />
          </span>

          <p className="text-xs font-medium text-[#51463E]">
            {selectedPackageCount}{" "}
            {selectedPackageCount === 1 ? "package" : "packages"} selected
          </p>
        </div>
      )}

      {/* LOADING STATE */}
      {packagesLoading && (
        <div className="flex items-center justify-center gap-2 rounded-md border border-[#E5DDD5] bg-white px-4 py-6">
          <Loader2 size={16} className="animate-spin text-[#A68C78]" />

          <p className="text-sm text-[#756A62]">Loading packages...</p>
        </div>
      )}

      {/* ERROR STATE */}
      {!packagesLoading && packagesError && (
        <div className="space-y-2">
          <GlobalErrorMessage error={packagesError} />

          <p className="text-xs text-[#756A62]">
            You can still continue with normal booking.
          </p>
        </div>
      )}

      {/* EMPTY STATE */}
      {!packagesLoading && !packagesError && availablePackages.length === 0 && (
        <div className="rounded-md border border-[#E5DDD5] bg-white px-4 py-6 text-center">
          <p className="text-sm text-[#756A62]">No packages available.</p>
        </div>
      )}

      {/* PACKAGE LIST */}
      {!packagesLoading && !packagesError && availablePackages.length > 0 && (
        <Accordion
          type="single"
          collapsible
          defaultValue={`package-${availablePackages[0]?.id}`}
          className="flex flex-col gap-2.5"
        >
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

            const selectionDisabled = loading || (!isSelected && limitReached);

            const packageInfo = Array.isArray(item?.short_info)
              ? item.short_info.filter(Boolean)
              : [];

            const packagePrice = Number(item?.package_price);

            const priceAvailable =
              item?.package_price !== null &&
              item?.package_price !== undefined &&
              item?.package_price !== "" &&
              Number.isFinite(packagePrice);

            return (
              <AccordionItem
                key={item.id}
                value={`package-${item.id}`}
                className={`m-0! w-full overflow-hidden rounded-md border transition-colors duration-200 ${
                  isSelected
                    ? "border-[#A68C78] bg-[#FFFCF9] shadow-[0_0_0_1px_rgba(166,140,120,0.18)]"
                    : "border-[#E5DDD5] bg-white hover:border-[#CFC2B6]"
                }`}
              >
                <div className="flex items-start gap-3 px-3.5 sm:px-4">
                  {/* SELECTION CHECKBOX */}
                  <button
                    type="button"
                    disabled={selectionDisabled}
                    onClick={() => {
                      if (selectionDisabled) return;

                      if (!isSelected) {
                        play();
                      }

                      onPackageToggle(item.id);
                    }}
                    aria-label={
                      isSelected
                        ? `Deselect ${item.package_title || "package"}`
                        : `Select ${item.package_title || "package"}`
                    }
                    aria-pressed={isSelected}
                    className={`mt-4 flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A68C78]/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                      isSelected
                        ? "border-[#3D3530] bg-[#3D3530] text-white"
                        : "border-[#CFC2B6] bg-white text-transparent hover:border-[#A68C78]"
                    }`}
                  >
                    {isSelected && <Check size={13} strokeWidth={2.5} />}
                  </button>

                  {/* PACKAGE TITLE, PRICE & DETAILS */}
                  <div className="min-w-0 flex-1">
                    <AccordionTrigger className="gap-3 py-3.5 text-left hover:no-underline [&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0 [&>svg]:text-[#9B9087]">
                      <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
                        {/* PACKAGE INFORMATION */}
                        <div className="min-w-0 flex-1">
                          <h3 className="wrap-break-word text-sm font-semibold leading-5 text-[#3D3530]">
                            {item?.package_title || "Untitled Package"}
                          </h3>

                          <p className="mt-1 text-base font-semibold tracking-tight tabular-nums text-[#51463E]">
                            {priceAvailable
                              ? formatPrice(packagePrice)
                              : "Price unavailable"}
                          </p>
                        </div>

                        {/* SELECTED BADGE */}
                        {isSelected && (
                          <span className="mt-0.5 shrink-0 rounded-md bg-[#F3ECE5] px-2 py-1 text-[10px] font-semibold text-[#51463E]">
                            Selected
                          </span>
                        )}
                      </div>
                    </AccordionTrigger>

                    {/* PACKAGE FEATURES */}
                    <AccordionContent className="pb-0">
                      {packageInfo.length > 0 && (
                        <div className="border-t border-[#F0EAE4] pt-3 pb-3.5">
                          <ul className="space-y-2">
                            {packageInfo.map((info, infoIndex) => (
                              <li
                                key={`${item.id}-${infoIndex}`}
                                className="flex items-start gap-2.5 text-xs leading-5 text-[#756A62]"
                              >
                                <Check
                                  size={14}
                                  strokeWidth={1.8}
                                  className={`mt-0.5 shrink-0 ${
                                    isSelected
                                      ? "text-[#8B735F]"
                                      : "text-[#A69B91]"
                                  }`}
                                />

                                <span className="min-w-0 wrap-break-word">
                                  {info}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </AccordionContent>
                  </div>
                </div>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </section>
  );
};

export default StepPackageSelection;
