import {
  Bell,
  CalendarPlus2,
  FilePenLine,
  Loader2,
  ReceiptText,
  Star,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import {
  formatNotificationCurrency,
  formatNotificationTime,
  getChangedFieldLabels,
  getNotificationToneClass,
  getNotificationTypeLabel,
  NOTIFICATION_TYPES,
} from "../utils/notificationUtils";

// ── Notification icon ─────────────────────────────────────────────────────────

function NotificationIcon({ type, className = "" }) {
  switch (type) {
    case NOTIFICATION_TYPES.HIRE_CREATED:
      return <CalendarPlus2 className={className} />;

    case NOTIFICATION_TYPES.INVOICE_CREATED:
      return <ReceiptText className={className} />;

    case NOTIFICATION_TYPES.INVOICE_UPDATED:
      return <FilePenLine className={className} />;

    case NOTIFICATION_TYPES.REVIEW_CREATED:
      return <Star className={className} />;

    default:
      return <Bell className={className} />;
  }
}

// ── Source information ────────────────────────────────────────────────────────

const getSourceMeta = (notification) => {
  if (notification?.notification_type === NOTIFICATION_TYPES.HIRE_CREATED) {
    const customerName = notification.hire?.customer_name;

    const serviceName = notification.hire?.service_display_name;

    return [customerName, serviceName].filter(Boolean).join(" · ");
  }

  if (notification?.notification_type === NOTIFICATION_TYPES.REVIEW_CREATED) {
    const customerName = notification.review?.customer_name;

    const serviceName = notification.review?.service_display_name;

    const stars = notification.review?.stars;

    const ratingLabel =
      stars !== null && stars !== undefined && stars !== ""
        ? `${stars} ★`
        : null;

    return [customerName, serviceName, ratingLabel].filter(Boolean).join(" · ");
  }

  const invoiceNumber = notification?.invoice?.invoice_number;

  const total = notification?.invoice?.total;

  if (invoiceNumber && total !== null && total !== undefined) {
    return `${invoiceNumber} · ${formatNotificationCurrency(total)}`;
  }

  return invoiceNumber || "";
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function NotificationItem({
  notification,
  onClick,
  isMarkingRead = false,
  className = "",
}) {
  if (!notification) {
    return null;
  }

  const toneClass = getNotificationToneClass(notification.notification_type);

  const title =
    notification.title ||
    getNotificationTypeLabel(notification.notification_type);

  const sourceMeta = getSourceMeta(notification);

  const changedFields =
    notification.notification_type === NOTIFICATION_TYPES.INVOICE_UPDATED
      ? getChangedFieldLabels(notification.data?.changed_fields)
      : [];

  const visibleChangedFields = changedFields.slice(0, 2);

  const remainingChangedFields = Math.max(
    0,
    changedFields.length - visibleChangedFields.length,
  );

  return (
    <button
      type="button"
      onClick={() => onClick?.(notification)}
      disabled={isMarkingRead}
      className={cn(
        "group relative flex w-full gap-3 px-4 py-4 text-left transition-colors",
        "hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
        !notification.is_read && "bg-primary/[0.035]",
        isMarkingRead && "cursor-wait",
        className,
      )}
      aria-label={`Open notification: ${title}`}
    >
      <div
        className={cn(
          "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full",
          toneClass,
        )}
      >
        <NotificationIcon
          type={notification.notification_type}
          className="size-4.5"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4
                className={cn(
                  "truncate text-sm text-foreground",
                  notification.is_read ? "font-medium" : "font-semibold",
                )}
              >
                {title}
              </h4>

              {!notification.is_read && (
                <>
                  <span
                    className="size-2 shrink-0 rounded-full bg-red-500"
                    aria-hidden="true"
                  />

                  <span className="sr-only">Unread</span>
                </>
              )}
            </div>
          </div>

          <span className="shrink-0 whitespace-nowrap text-[11px] text-muted-foreground">
            {formatNotificationTime(notification.created_at)}
          </span>
        </div>

        {notification.message && (
          <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">
            {notification.message}
          </p>
        )}

        {sourceMeta && (
          <p className="mt-2 truncate text-xs font-medium text-foreground/70">
            {sourceMeta}
          </p>
        )}

        {visibleChangedFields.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {visibleChangedFields.map((field) => (
              <Badge
                key={field}
                variant="secondary"
                className="h-5 rounded-md px-1.5 text-[10px] font-medium"
              >
                {field}
              </Badge>
            ))}

            {remainingChangedFields > 0 && (
              <Badge
                variant="secondary"
                className="h-5 rounded-md px-1.5 text-[10px] font-medium"
              >
                +{remainingChangedFields}
              </Badge>
            )}
          </div>
        )}
      </div>

      {isMarkingRead && (
        <div className="absolute inset-y-0 right-3 flex items-center">
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        </div>
      )}
    </button>
  );
}
