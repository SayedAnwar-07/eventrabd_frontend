import { CheckCheck, ChevronRight, Loader2 } from "lucide-react";

import GlobalErrorMessage from "@/components/common/GlobalErrorMessage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import NotificationEmptyState from "./NotificationEmptyState";
import NotificationItem from "./NotificationItem";
import NotificationListSkeleton from "./NotificationListSkeleton";

export default function NotificationDropdown({
  notifications = [],
  unreadCount = 0,
  listLoading = false,
  loadingMore = false,
  markAllReadLoading = false,
  markReadLoadingIds = {},
  error = null,
  hasMore = false,
  userRole,
  onNotificationClick,
  onMarkAllRead,
  onLoadMore,
  onViewAll,
}) {
  const hasNotifications = notifications.length > 0;

  return (
    <div className="overflow-hidden rounded-lg bg-popover">
      <div className="flex items-center justify-between gap-3 px-4 py-3.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">Notifications</h3>

            {unreadCount > 0 && (
              <Badge
                variant="secondary"
                className="h-5 rounded-md px-1.5 text-[10px]"
              >
                {unreadCount} unread
              </Badge>
            )}
          </div>

          <p className="mt-0.5 text-xs text-muted-foreground">
            Your latest activity and updates
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onMarkAllRead}
            disabled={markAllReadLoading}
            className="h-8 shrink-0 px-2 text-xs"
          >
            {markAllReadLoading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <CheckCheck className="size-3.5" />
            )}

            <span className="hidden sm:inline">Mark all read</span>
          </Button>
        )}
      </div>

      <Separator />

      {error && (
        <GlobalErrorMessage error={error} className="mx-4 mt-3 rounded-md" />
      )}

      <ScrollArea
        className="h-[60vh] min-h-65 max-h-129
      "
      >
        {listLoading && !hasNotifications ? (
          <NotificationListSkeleton rows={5} compact />
        ) : !hasNotifications ? (
          <NotificationEmptyState compact userRole={userRole} />
        ) : (
          <div>
            {notifications.map((notification, index) => (
              <div key={notification.id}>
                <NotificationItem
                  notification={notification}
                  isMarkingRead={Boolean(markReadLoadingIds[notification.id])}
                  onClick={onNotificationClick}
                />

                {index < notifications.length - 1 && (
                  <Separator className="ml-17" />
                )}
              </div>
            ))}

            {hasMore && (
              <div className="flex justify-center px-4 py-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onLoadMore}
                  disabled={loadingMore}
                  className="min-w-28"
                >
                  {loadingMore && <Loader2 className="size-4 animate-spin" />}

                  {loadingMore ? "Loading..." : "Load more"}
                </Button>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {typeof onViewAll === "function" && (
        <>
          <Separator />

          <div className="p-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onViewAll}
              className="h-9 w-full justify-between px-3 text-sm"
            >
              View all notifications
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
