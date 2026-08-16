import { markNotificationRead } from "@/store/features/notification/notificationSlice";

export const NOTIFICATION_TYPES = {
  HIRE_CREATED: "hire_created",
  INVOICE_CREATED: "invoice_created",
  INVOICE_UPDATED: "invoice_updated",
};

export const NOTIFICATION_FIELD_LABELS = {
  service_price: "Service price",
  additional_charge: "Additional charge",
  additional_charge_reason: "Additional charge reason",
  discount_price: "Discount",
  advance_payment: "Advance payment",
  due_payment_last_date: "Due date",
  seller_note: "Seller note",
  terms_conditions: "Terms & conditions",
  slot_shifts: "Booking shifts",
};

const numberFormatter = new Intl.NumberFormat("en-BD", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const relativeTimeFormatter = new Intl.RelativeTimeFormat("en", {
  numeric: "auto",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-BD", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const dateFormatter = new Intl.DateTimeFormat("en-BD", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export const mergeNotifications = (current = [], incoming = []) => {
  const notificationMap = new Map();

  [...current, ...incoming].forEach((notification) => {
    if (!notification?.id) {
      return;
    }

    notificationMap.set(notification.id, notification);
  });

  return Array.from(notificationMap.values());
};

export const formatNotificationCurrency = (value) => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "—";
  }

  return `৳${numberFormatter.format(numericValue)}`;
};

export const formatNotificationTime = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const differenceInSeconds = Math.round((date.getTime() - Date.now()) / 1000);

  const absoluteSeconds = Math.abs(differenceInSeconds);

  if (absoluteSeconds < 45) {
    return "Just now";
  }

  const differenceInMinutes = Math.round(differenceInSeconds / 60);

  if (Math.abs(differenceInMinutes) < 60) {
    return relativeTimeFormatter.format(differenceInMinutes, "minute");
  }

  const differenceInHours = Math.round(differenceInMinutes / 60);

  if (Math.abs(differenceInHours) < 24) {
    return relativeTimeFormatter.format(differenceInHours, "hour");
  }

  const differenceInDays = Math.round(differenceInHours / 24);

  if (Math.abs(differenceInDays) < 7) {
    return relativeTimeFormatter.format(differenceInDays, "day");
  }

  return dateTimeFormatter.format(date);
};

export const formatNotificationDate = (value) => {
  if (!value) {
    return "—";
  }

  const normalizedValue =
    typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? `${value}T00:00:00`
      : value;

  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return dateFormatter.format(date);
};

export const getNotificationTypeLabel = (notificationType) => {
  switch (notificationType) {
    case NOTIFICATION_TYPES.HIRE_CREATED:
      return "New Hire Request";

    case NOTIFICATION_TYPES.INVOICE_CREATED:
      return "Invoice Created";

    case NOTIFICATION_TYPES.INVOICE_UPDATED:
      return "Invoice Updated";

    default:
      return "Notification";
  }
};


export const getNotificationToneClass = (notificationType) => {
  switch (notificationType) {
    case NOTIFICATION_TYPES.HIRE_CREATED:
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400";

    case NOTIFICATION_TYPES.INVOICE_CREATED:
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";

    case NOTIFICATION_TYPES.INVOICE_UPDATED:
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400";

    default:
      return "bg-muted text-muted-foreground";
  }
};

export const getChangedFieldLabels = (changedFields) => {
  if (!Array.isArray(changedFields)) {
    return [];
  }

  return changedFields
    .filter((field) => typeof field === "string" && field.trim())
    .map(
      (field) =>
        NOTIFICATION_FIELD_LABELS[field] ||
        field
          .replaceAll("_", " ")
          .replace(/\b\w/g, (character) => character.toUpperCase()),
    );
};

export const getNotificationDestination = (notification) => {
  if (!notification) {
    return null;
  }

  switch (notification.notification_type) {
    case NOTIFICATION_TYPES.HIRE_CREATED:
      if (!notification.hire?.id) {
        return null;
      }

      return {
        type: "hire",
        id: notification.hire.id,
      };

    case NOTIFICATION_TYPES.INVOICE_CREATED:
    case NOTIFICATION_TYPES.INVOICE_UPDATED:
      if (!notification.invoice?.id) {
        return null;
      }

      return {
        type: "invoice",
        id: notification.invoice.id,
      };

    default:
      return null;
  }
};

export const handleNotificationClick = async ({
  notification,
  dispatch,
  onNavigate,
}) => {
  if (!notification?.id || !dispatch) {
    return null;
  }

  let resolvedNotification = notification;

  if (!notification.is_read) {
    try {
      const result = await dispatch(
        markNotificationRead(notification.id),
      ).unwrap();

      if (result?.notification) {
        resolvedNotification = result.notification;
      }
    } catch {
      // The Redux slice already stores the API error.
      // Navigation should still be allowed if the destination is valid.
    }
  }

  const destination = getNotificationDestination(resolvedNotification);

  if (destination && typeof onNavigate === "function") {
    await onNavigate(destination, resolvedNotification);
  }

  return destination;
};
