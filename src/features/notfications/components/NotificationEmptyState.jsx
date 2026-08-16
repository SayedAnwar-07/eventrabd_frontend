import { BellOff } from "lucide-react";

export default function NotificationEmptyState({
  filter = "all",
  userRole,
  compact = false,
}) {
  let title = "No notifications yet";
  let description = "Your new Hire and Invoice updates will appear here.";

  if (filter === "unread") {
    title = "You're all caught up";
    description = "You don't have any unread notifications.";
  }

  if (filter === "read") {
    title = "No read notifications";
    description = "Notifications you read will appear here.";
  }

  if (filter === "all" && userRole === "seller") {
    description = "New Hire requests and related updates will appear here.";
  }

  if (filter === "all" && userRole === "customer") {
    description = "New Invoice notifications and updates will appear here.";
  }

  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact ? "px-6 py-10" : "px-6 py-16"
      }`}
    >
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
        <BellOff className="size-5 text-muted-foreground" />
      </div>

      <h3 className="text-sm font-semibold text-foreground">{title}</h3>

      <p className="mt-1 max-w-xs text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
