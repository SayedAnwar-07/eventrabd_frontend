import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Bell } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  fetchMoreNotifications,
  fetchNotifications,
  markAllNotificationsRead,
} from "@/store/features/notification/notificationSlice";

import { handleNotificationClick } from "../utils/notificationUtils";
import NotificationDropdown from "./NotificationDropdown";

const EMPTY_NOTIFICATIONS = Object.freeze([]);
const EMPTY_LOADING_IDS = Object.freeze({});

export default function NotificationBell({
  userRole,
  onNavigate,
  onViewAll,
  className = "",
}) {
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);

  const notifications = useSelector(
    (state) => state.notification?.notifications ?? EMPTY_NOTIFICATIONS,
  );

  const unreadCount = useSelector(
    (state) => state.notification?.unreadCount ?? 0,
  );

  const next = useSelector((state) => state.notification?.next ?? null);

  const currentFilter = useSelector(
    (state) => state.notification?.currentFilter ?? null,
  );

  const hasFetchedList = useSelector(
    (state) => state.notification?.hasFetchedList ?? false,
  );

  const listLoading = useSelector(
    (state) => state.notification?.listLoading ?? false,
  );

  const loadingMore = useSelector(
    (state) => state.notification?.loadingMore ?? false,
  );

  const markAllReadLoading = useSelector(
    (state) => state.notification?.markAllReadLoading ?? false,
  );

  const markReadLoadingIds = useSelector(
    (state) => state.notification?.markReadLoadingIds ?? EMPTY_LOADING_IDS,
  );

  const error = useSelector((state) => state.notification?.error ?? null);

  const badgeLabel = unreadCount > 9 ? "9+" : String(unreadCount);

  const handleOpenChange = (nextOpen) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      return;
    }

    /*
     * Dropdown always represents the normal "all notifications" feed.
     *
     * If the full notification page previously loaded a filtered list,
     * reload the normal feed once when the bell opens.
     */
    const needsList = !hasFetchedList || currentFilter !== null;

    if (needsList && !listLoading) {
      dispatch(fetchNotifications());
    }
  };

  const handleItemClick = async (notification) => {
    await handleNotificationClick({
      notification,
      dispatch,
      onNavigate,
    });

    setOpen(false);
  };

  const handleViewAll = () => {
    setOpen(false);

    onViewAll?.();
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : "Notifications"
          }
          className={`relative rounded-full ${className}`}
        >
          <Bell className="size-4.75" />

          {unreadCount > 0 && (
            <Badge className="pointer-events-none absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full border-2 border-background bg-red-600 px-1 text-[9px] font-bold leading-none text-white hover:bg-red-600">
              {badgeLabel}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[calc(100vw-1.5rem)] max-w-100 overflow-hidden rounded-xl p-0 shadow-xl sm:w-100"
      >
        <NotificationDropdown
          notifications={notifications}
          unreadCount={unreadCount}
          listLoading={listLoading}
          loadingMore={loadingMore}
          markAllReadLoading={markAllReadLoading}
          markReadLoadingIds={markReadLoadingIds}
          error={error}
          hasMore={Boolean(next)}
          userRole={userRole}
          onNotificationClick={handleItemClick}
          onMarkAllRead={() => dispatch(markAllNotificationsRead())}
          onLoadMore={() => dispatch(fetchMoreNotifications())}
          onViewAll={
            typeof onViewAll === "function" ? handleViewAll : undefined
          }
        />
      </PopoverContent>
    </Popover>
  );
}
