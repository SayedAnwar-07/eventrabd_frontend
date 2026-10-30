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

  const serviceIcon = SERVICE_ICON_MAP[normalizedService] || photographyIcon;

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

  // COMPACT RESPONSIVE CARD
  const baseCard =
    "group relative flex min-w-0 w-full flex-col items-center " +
    "justify-start rounded-sm border " +
    "px-2 py-3 sm:px-3 sm:py-3.5 lg:px-5 lg:py-4 2xl:py-5 " +
    "pb-7 sm:pb-8 text-center outline-none " +
    "transition-all duration-300 ease-in-out shadow-sm hover:shadow-md";

  // SELECTED CARD
  const selectedCard =
    "border-[#344653] bg-[#f9fafb] " +
    "shadow-[0_0_0_1px_#344653] cursor-pointer";

  // UNSELECTED CARD
  const unselectedCard =
    "border-[#DCE3E5] bg-white " +
    "hover:border-[#AAB8BE] hover:bg-[#f9fafb] cursor-pointer";

  // RESPONSIVE ICON AREA
  const iconArea =
    "flex h-10 w-10 sm:h-12 sm:w-12 " +
    "lg:h-14 lg:w-14 2xl:h-16 2xl:w-16 " +
    "shrink-0 items-center justify-center";

  // RESPONSIVE ICON
  const iconImage =
    "h-8 w-8 sm:h-10 sm:w-10 " +
    "lg:h-12 lg:w-12 2xl:h-[54px] 2xl:w-[54px] " +
    "object-contain opacity-90 " +
    "transition-transform duration-300 group-hover:scale-105";

  // SINGLE-LINE TITLE
  const titleClass =
    "mt-2 w-full whitespace-nowrap overflow-hidden text-ellipsis " +
    "text-[clamp(9px,2.5vw,16px)] sm:text-sm lg:text-base " +
    "font-medium uppercase " +
    "tracking-[0.02em] sm:tracking-[0.08em] lg:tracking-[0.15em] " +
    "leading-tight text-[#293B47]";

  // SUBTITLE
  const subtitleClass =
    "mt-1.5 whitespace-nowrap " +
    "text-[8px] sm:text-[9px] lg:text-[10px] " +
    "font-medium uppercase " +
    "tracking-[0.10em] sm:tracking-[0.18em] lg:tracking-[0.25em] " +
    "leading-tight text-[#52636E]";

  // COMPACT DIVIDER
  const dividerClass =
    "my-2.5 sm:my-3 lg:my-3.5 mb-4" +
    "h-px w-9 sm:w-11 lg:w-12 " +
    "bg-[#B9C6CB] transition-all duration-300 " +
    "group-hover:w-14 sm:group-hover:w-16 lg:group-hover:w-20";

  // PRICE
  const priceClass =
    "whitespace-nowrap " +
    "text-[clamp(11px,3vw,20px)] sm:text-base lg:text-lg " +
    "font-medium tracking-wide text-[#293B47]";

  // SELECTION INDICATOR
  const selectionIndicator = (selected) =>
    `absolute right-2 top-2 sm:right-3 sm:top-3 ` +
    `flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center ` +
    `rounded-full border transition-all duration-200 ${
      selected
        ? "border-[#344653] bg-[#344653] text-white"
        : "border-[#C4CFD3] bg-transparent text-transparent"
    }`;

  // ACTION ICON
  const actionIconClass =
    "absolute bottom-2 right-2 sm:bottom-3 sm:right-3 " +
    "h-3.5 w-3.5 sm:h-4 sm:w-4 " +
    "text-[#52636E] transition-transform duration-300 " +
    "group-hover:translate-x-0.5 group-hover:-translate-y-0.5";

  return (
    <section className="w-full">
      {/* BOOKING CARDS */}
      <div
        role="group"
        aria-label="Choose booking type"
        className="grid w-full min-w-0 grid-cols-2 gap-2 sm:gap-3 lg:gap-5"
      >
        {/* STANDARD BOOKING */}
        <button
          type="button"
          disabled={disabled}
          aria-pressed={normalSelected}
          onClick={onNormalServiceSelect}
          className={`
            ${baseCard}
            ${normalSelected ? selectedCard : unselectedCard}
            focus-visible:ring-2
            focus-visible:ring-[#344653]/30
            focus-visible:ring-offset-2
            disabled:cursor-not-allowed
            disabled:opacity-50
          `}
        >
          {/* SELECTION INDICATOR */}
          <span className={selectionIndicator(normalSelected)}>
            <Check size={12} strokeWidth={2.5} />
          </span>

          {/* SERVICE ICON */}
          <div className={iconArea}>
            <img
              src={serviceIcon}
              alt=""
              aria-hidden="true"
              className={iconImage}
            />
          </div>

          {/* SERVICE TITLE */}
          <h3 className={titleClass}>{serviceLabel || "Our Service"}</h3>

          {/* SUBTITLE */}
          <p className={subtitleClass}>Standard Booking</p>

          {/* DIVIDER */}
          <div className={dividerClass} />

          {/* PRICE */}
          <div className="w-full px-1">
            <p className={priceClass}>{formattedPrice}</p>

            <p
              className="
              mt-1 whitespace-nowrap
              text-[8px] sm:text-[9px] lg:text-[10px]
              uppercase tracking-[0.10em] sm:tracking-[0.18em]
              text-[#788890]
            "
            >
              Per Shift
            </p>
          </div>

          {/* ACTION ICON */}
          <ArrowUpRight
            size={16}
            strokeWidth={1.5}
            className={actionIconClass}
          />
        </button>

        {/* PACKAGE BOOKING */}
        <button
          type="button"
          disabled={disabled}
          aria-pressed={packageSelected}
          onClick={onPackageSelect}
          className={`
            ${baseCard}
            ${packageSelected ? selectedCard : unselectedCard}
            focus-visible:ring-2
            focus-visible:ring-[#344653]/30
            focus-visible:ring-offset-2
            disabled:cursor-not-allowed
            disabled:opacity-50
          `}
        >
          {/* SELECTION INDICATOR */}
          <span className={selectionIndicator(packageSelected)}>
            <Check size={12} strokeWidth={2.5} />
          </span>

          {/* PACKAGE ICON */}
          <div className={iconArea}>
            <img
              src={packagesHandGiftIcon}
              alt=""
              aria-hidden="true"
              className={iconImage}
            />
          </div>

          {/* PACKAGE TITLE */}
          <h3 className={titleClass}>Event Packages</h3>

          {/* SUBTITLE */}
          <p className={subtitleClass}>Package Booking</p>

          {/* DIVIDER */}
          <div className={dividerClass} />

          {/* PACKAGE DESCRIPTION */}
          <div className="w-full px-1">
            <p
              className="
              whitespace-nowrap
              text-[clamp(10px,2.8vw,14px)] sm:text-sm lg:text-base
              font-medium tracking-wide text-[#293B47]
            "
            >
              Explore Packages
            </p>

            <p
              className="
              mt-1 whitespace-nowrap
              text-[8px] sm:text-[9px] lg:text-[10px]
              uppercase tracking-[0.05em] sm:tracking-[0.12em]
              text-[#788890]
            "
            >
              Tailored For Your Event
            </p>
          </div>

          {/* ACTION ICON */}
          <ArrowUpRight
            size={16}
            strokeWidth={1.5}
            className={actionIconClass}
          />
        </button>
      </div>
    </section>
  );
};

export default StepServiceSelection;
