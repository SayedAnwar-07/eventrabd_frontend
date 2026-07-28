import { memo, useMemo } from "react";

const FIELD_LABELS = {
  service_name: "Service type",
  drive_link: "Drive or YouTube link",
  shift_charge: "Shift charge",
  description: "Description",
  shift_hour: "Shift hour",
  sound_system_payment: "Sound system payment",
  lighting_payment: "Lighting payment",
  cover_photo: "Cover photo",
  add_gallery_images: "Gallery images",
  remove_gallery_image_ids: "Gallery images",
  gallery_images: "Gallery images",
  booking_slots: "Booking slots",
  starts_at: "Start time",
  ends_at: "End time",
  venue_name: "Venue name",
  venue_address: "Venue address",
  location_note: "Location note",
  non_field_errors: "Error",
  detail: "Error",
  message: "Error",
  error: "Error",
};

const GENERIC_ERROR_KEYS = new Set([
  "detail",
  "message",
  "error",
  "non_field_errors",
]);

const cleanString = (value) => {
  if (typeof value !== "string") {
    return String(value ?? "");
  }

  const titleMatch = value.match(/<title>(.*?)<\/title>/i);

  if (titleMatch?.[1]) {
    return titleMatch[1].trim();
  }

  if (value.includes("<!DOCTYPE") || value.includes("<html")) {
    return "The server returned an HTML error page. Check the backend console.";
  }

  return value
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const formatFieldName = (field) => {
  if (/^\d+$/.test(field)) {
    return `Item ${Number(field) + 1}`;
  }

  return (
    FIELD_LABELS[field] ||
    field
      .replaceAll("_", " ")
      .replace(/\b\w/g, (character) => character.toUpperCase())
  );
};

const createFieldLabel = (path) => {
  const meaningfulPath = path.filter(
    (segment) => !GENERIC_ERROR_KEYS.has(segment),
  );

  return meaningfulPath.map(formatFieldName).join(" → ");
};

const collectBackendErrors = (value, path = [], seen = new WeakSet()) => {
  if (value === null || value === undefined || value === "") {
    return [];
  }

  if (value instanceof Error) {
    return [
      {
        field: createFieldLabel(path),
        message: value.message || "Something went wrong.",
      },
    ];
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    const message = cleanString(value);

    return message
      ? [
          {
            field: createFieldLabel(path),
            message,
          },
        ]
      : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item, index) => {
      const nextPath =
        item && typeof item === "object" && !Array.isArray(item)
          ? [...path, String(index)]
          : path;

      return collectBackendErrors(item, nextPath, seen);
    });
  }

  if (typeof value === "object") {
    if (seen.has(value)) {
      return [];
    }

    seen.add(value);

    // Axios error object: only render the backend payload, not config/request internals.
    if (value.response?.data !== undefined) {
      return collectBackendErrors(value.response.data, path, seen);
    }

    const entries = Object.entries(value);

    if (entries.length === 0) {
      return [
        {
          field: createFieldLabel(path),
          message: "Something went wrong.",
        },
      ];
    }

    return entries.flatMap(([key, childValue]) =>
      collectBackendErrors(childValue, [...path, key], seen),
    );
  }

  return [
    {
      field: createFieldLabel(path),
      message: "Something went wrong.",
    },
  ];
};

const BackendErrorMessage = ({
  error,
  title = "Please fix the following:",
  className = "",
}) => {
  const errorItems = useMemo(() => collectBackendErrors(error), [error]);

  if (errorItems.length === 0) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive ${className}`}
    >
      {title && <p className="font-semibold">{title}</p>}

      <ul className={title ? "mt-2 space-y-1" : "space-y-1"}>
        {errorItems.map((item, index) => (
          <li
            key={`${item.field}-${item.message}-${index}`}
            className="whitespace-pre-wrap break-words"
          >
            {item.field ? (
              <>
                <span className="font-semibold">{item.field}:</span>{" "}
                {item.message}
              </>
            ) : (
              item.message
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default memo(BackendErrorMessage);
