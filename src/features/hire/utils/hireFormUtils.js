export const MAX_BOOKING_SLOTS = 5;

export const PACKAGE_SUPPORTED_SERVICES = ["photography", "videography"];

export const EVENT_TYPE_OPTIONS = [
  { value: "holud", label: "Holud" },
  { value: "mehedi", label: "Mehedi" },
  { value: "akhd_walima", label: "Akhd/Walima" },
  {
    value: "wedding_ceremony",
    label: "Wedding Ceremony",
  },
  { value: "reception", label: "Reception" },
  { value: "anniversary", label: "Anniversary" },
  { value: "birthday", label: "Birthday" },
];

export const createEmptySlot = () => ({
  starts_at: "",
  venue_name: "",
  venue_address: "",
  google_map_link: "",
});

export const createBookingItem = (packageId = null) => ({
  key: packageId ? `package-${packageId}` : "normal",
  packageId: packageId ? String(packageId) : null,
  quantity: 1,
  eventTypes: [""],
  bookingSlots: [createEmptySlot()],
});

export const normalizeItemToQuantityOne = (item) => ({
  ...item,
  quantity: 1,
  eventTypes: [item?.eventTypes?.[0] || ""],
  bookingSlots: [item?.bookingSlots?.[0] || createEmptySlot()],
});

export const getMinimumDateTime = () => {
  const now = new Date();

  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

  return now.toISOString().slice(0, 16);
};

export const formatPrice = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return null;
  }

  return `৳${numericValue.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  })}`;
};

export const normalizeOptionalText = (value) => {
  const normalizedValue = String(value ?? "").trim();

  return normalizedValue || null;
};

export const getEventTypeLabel = (value) => {
  if (!value) {
    return "";
  }

  return (
    EVENT_TYPE_OPTIONS.find((option) => option.value === value)?.label || value
  );
};
