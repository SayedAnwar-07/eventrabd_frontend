
import { Check, ArrowUpRight } from "lucide-react";

import photographyIcon from "@/assets/service-icon/photography.svg";
import videographyIcon from "@/assets/service-icon/videography.svg";
import stageDesignerIcon from "@/assets/service-icon/stage_designer.svg";
import soundLightingIcon from "@/assets/service-icon/sound_lighting.svg";
import eventHallIcon from "@/assets/service-icon/event_hall.svg";
import packagesHandGiftIcon from "@/assets/service-icon/packages_hand_gift.svg";

const SERVICE_ICON_MAP = {
  photography: photographyIcon,
  videography: videographyIcon,
  stage_designer: stageDesignerIcon,
  sound_lighting: soundLightingIcon,
  event_hall: eventHallIcon,
};

const normalizeServiceName = (name = "") =>
  String(name)
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

const formatServiceName = (name = "") =>
  String(name)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

const StepServiceSelection = ({
  serviceName = "",
  bookingMode,
  serviceCharge,
  onNormalServiceSelect,
  onPackageSelect,
  disabled = false,
}) => {
  const normalSelected = bookingMode === "normal";
  const packageSelected = bookingMode === "packages";

  const normalizedService = normalizeServiceName(serviceName);

  const serviceIcon =
    SERVICE_ICON_MAP[normalizedService] || photographyIcon;

  const serviceLabel = formatServiceName(serviceName);

  const price = Number(serviceCharge);

  const hasValidPrice =
    serviceCharge !== null &&
    serviceCharge !== undefined &&
    serviceCharge !== "" &&
    Number.isFinite(price);

  const formattedPrice = hasValidPrice
    ? `৳${price.toLocaleString("en-BD")}`
    : "Price unavailable";

  // Minimal logo-inspired card design.
  const baseCard =
    "group relative flex min-h-[300px] w-full flex-col items-center rounded-sm border p-6 text-center outline-none transition-all duration-300 sm:min-h-[330px] sm:p-8";

  const selectedCard =
    "border-[#344653] bg-[#f9fafb] shadow-[0_0_0_1px_#344653] cursor-pointer";

  const unselectedCard =
    "border-[#DCE3E5] bg-[#fff] hover:border-[#AAB8BE] hover:bg-[#f9fafb] cursor-pointer";

  // Icon area: centered, clean, and spacious.
  const iconArea =
    "flex h-[76px] w-[76px] items-center justify-center";

  const iconImage =
    "h-[58px] w-[58px] object-contain opacity-90 transition-transform duration-300 group-hover:scale-105";

  return (
    <section className="space-y-7">

      {/* BOOKING CARDS */}
      <div
        role="group"
        aria-label="Choose booking type"
        className="grid grid-cols-1 gap-5 sm:grid-cols-2"
      >
        {/* STANDARD BOOKING */}
        <button
          type="button"
          disabled={disabled}
          aria-pressed={normalSelected}
          onClick={onNormalServiceSelect}
          className={`${baseCard} ${
            normalSelected ? selectedCard : unselectedCard
          } focus-visible:ring-2 focus-visible:ring-[#344653]/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-md`}
        >
          {/* Selection indicator */}
          <span
            className={`absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border transition-all ${
              normalSelected
                ? "border-[#344653] bg-[#344653] text-white"
                : "border-[#C4CFD3] bg-transparent text-transparent"
            }`}
          >
            <Check size={12} strokeWidth={2.5} />
          </span>

          {/* Centered service icon */}
          <div className={iconArea}>
            <img
              src={serviceIcon}
              alt=""
              aria-hidden="true"
              className={iconImage}
            />
          </div>

          {/* Main title */}
          <h3 className="mt-5 text-lg font-medium uppercase tracking-[0.24em] text-[#293B47]">
            {serviceLabel || "Our Service"}
          </h3>

          {/* Subtitle inspired by the reference logo */}
          <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.34em] text-[#52636E]">
            Standard Booking
          </p>

          {/* Thin decorative divider */}
          <div className="my-5 h-px w-12 bg-[#B9C6CB] transition-all duration-300 group-hover:w-20" />

          {/* Price */}
          <div className="mt-auto">
            <p className="text-xl font-medium tracking-wide text-[#293B47]">
              {formattedPrice}
            </p>

            <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-[#788890]">
              Per Shift
            </p>
          </div>

          {/* Subtle action indicator */}
          <ArrowUpRight
            size={16}
            strokeWidth={1.5}
            className="absolute bottom-5 right-5 text-[#52636E] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </button>

        {/* PACKAGE BOOKING */}
        <button
          type="button"
          disabled={disabled}
          aria-pressed={packageSelected}
          onClick={onPackageSelect}
          className={`${baseCard} ${
            packageSelected ? selectedCard : unselectedCard
          } focus-visible:ring-2 focus-visible:ring-[#344653]/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-md`}
        >
          {/* Selection indicator */}
          <span
            className={`absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border transition-all ${
              packageSelected
                ? "border-[#344653] bg-[#344653] text-white"
                : "border-[#C4CFD3] bg-transparent text-transparent"
            }`}
          >
            <Check size={12} strokeWidth={2.5} />
          </span>

          {/* Centered package icon */}
          <div className={iconArea}>
            <img
              src={packagesHandGiftIcon}
              alt=""
              aria-hidden="true"
              className={iconImage}
            />
          </div>

          {/* Main title */}
          <h3 className="mt-5 text-lg font-medium uppercase tracking-[0.24em] text-[#293B47]">
            Event Packages
          </h3>

          {/* Subtitle */}
          <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.34em] text-[#52636E]">
            Package Booking
          </p>

          {/* Thin decorative divider */}
          <div className="my-5 h-px w-12 bg-[#B9C6CB] transition-all duration-300 group-hover:w-20" />

          {/* Package description */}
          <div className="mt-auto">
            <p className="text-sm font-medium tracking-wide text-[#293B47]">
              Explore Packages
            </p>

            <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#788890]">
              Tailored For Your Event
            </p>
          </div>

          {/* Subtle action indicator */}
          <ArrowUpRight
            size={16}
            strokeWidth={1.5}
            className="absolute bottom-5 right-5 text-[#52636E] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </button>
      </div>
    </section>
  );
};

export default StepServiceSelection;
