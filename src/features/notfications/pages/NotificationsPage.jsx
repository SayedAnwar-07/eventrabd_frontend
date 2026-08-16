import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Loader2 } from "lucide-react";

import GlobalErrorMessage from "@/components/common/GlobalErrorMessage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import {
  fetchMoreNotifications,
  fetchNotificationCount,
  fetchNotifications,
  markAllNotificationsRead,
} from "@/store/features/notification/notificationSlice";

import NotificationEmptyState from "../components/NotificationEmptyState";
import NotificationItem from "../components/NotificationItem";
import NotificationListSkeleton from "../components/NotificationListSkeleton";
import { handleNotificationClick } from "../utils/notificationUtils";

const EMPTY_NOTIFICATIONS = Object.freeze([]);
const EMPTY_LOADING_IDS = Object.freeze({});

const FILTERS = [
  {
    key: "all",
    label: "All",
    isRead: null,
  },
  {
    key: "unread",
    label: "Unread",
    isRead: false,
  },
  {
    key: "read",
    label: "Read",
    isRead: true,
  },
];

export default function NotificationsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [filter, setFilter] = useState("all");

  const user = useSelector((state) => state.auth?.user);

  const notifications = useSelector(
    (state) => state.notification?.notifications ?? EMPTY_NOTIFICATIONS,
  );

  const unreadCount = useSelector(
    (state) => state.notification?.unreadCount ?? 0,
  );

  const totalCount = useSelector(
    (state) => state.notification?.totalCount ?? 0,
  );

  const next = useSelector((state) => state.notification?.next ?? null);

  const currentFilter = useSelector(
    (state) => state.notification?.currentFilter ?? null,
  );

  const hasFetchedList = useSelector(
    (state) => state.notification?.hasFetchedList ?? false,
  );

  const hasFetchedCount = useSelector(
    (state) => state.notification?.hasFetchedCount ?? false,
  );

  const listLoading = useSelector(
    (state) => state.notification?.listLoading ?? false,
  );

  const countLoading = useSelector(
    (state) => state.notification?.countLoading ?? false,
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

  const activeFilter = FILTERS.find((item) => item.key === filter);

  const desiredReduxFilter =
    typeof activeFilter?.isRead === "boolean" ? activeFilter.isRead : null;

  // ── Notification count ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!hasFetchedCount && !countLoading) {
      dispatch(fetchNotificationCount());
    }
  }, [countLoading, dispatch, hasFetchedCount]);

  // ── Notification list ───────────────────────────────────────────────────────

  useEffect(() => {
    if (hasFetchedList && currentFilter === desiredReduxFilter) {
      return;
    }

    if (typeof activeFilter?.isRead === "boolean") {
      dispatch(
        fetchNotifications({
          is_read: activeFilter.isRead,
        }),
      );

      return;
    }

    dispatch(fetchNotifications());
  }, [
    activeFilter?.isRead,
    currentFilter,
    desiredReduxFilter,
    dispatch,
    hasFetchedList,
  ]);

  // ── Local filter ────────────────────────────────────────────────────────────

  const visibleNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((notification) => !notification.is_read);
    }

    if (filter === "read") {
      return notifications.filter((notification) => notification.is_read);
    }

    return notifications;
  }, [filter, notifications]);

  // ── Notification destination ────────────────────────────────────────────────

  const handleNavigate = (destination) => {
    if (!destination) {
      return;
    }

    if (destination.type === "hire" && user?.role === "seller") {
      navigate(`/seller/hire-requests/${destination.id}`);
      return;
    }

    /*
     * Invoice route is intentionally not invented here.
     *
     * Your current router does not contain an Invoice detail route yet.
     * The notification is still marked as read successfully.
     */
  };

  // ── Notification click ──────────────────────────────────────────────────────

  const handleItemClick = async (notification) => {
    await handleNotificationClick({
      notification,
      dispatch,
      onNavigate: handleNavigate,
    });
  };

  const hasMore = Boolean(next) && !(filter === "unread" && unreadCount === 0);

  return (
    <div className="mx-auto w-full py-6 sm:py-8 lg:py-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center text-primary">
            <Bell className="size-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Notifications
              </h1>

              {!countLoading && unreadCount > 0 && (
                <Badge variant="secondary" className="rounded-md">
                  {unreadCount} unread
                </Badge>
              )}
            </div>

            <p className="mt-0.5 text-sm text-muted-foreground">
              Stay updated with your Hire and Invoice activity.
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => dispatch(markAllNotificationsRead())}
            disabled={markAllReadLoading}
            className="self-start sm:self-auto"
          >
            {markAllReadLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCheck className="size-4" />
            )}
            Mark all as read
          </Button>
        )}
      </div>

      <div className="overflow-hidden">
        <div className="space-y-4 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold">Activity</h2>

              {!countLoading && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {totalCount}{" "}
                  {totalCount === 1 ? "notification" : "notifications"}
                </p>
              )}
            </div>

            <div
              className="flex w-full gap-1 p-1 sm:w-auto"
              role="group"
              aria-label="Notification filters"
            >
              {FILTERS.map((item) => {
                const active = filter === item.key;

                return (
                  <Button
                    key={item.key}
                    type="button"
                    variant={active ? "secondary" : "ghost"}
                    size="sm"
                    aria-pressed={active}
                    onClick={() => setFilter(item.key)}
                    className="h-8 flex-1 rounded-md px-4 text-xs sm:flex-none"
                  >
                    {item.label}

                    {item.key === "unread" && unreadCount > 0 && (
                      <span className="ml-1.5 text-[10px] font-semibold">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          {error && <GlobalErrorMessage error={error} className="rounded-md" />}
        </div>

        <Separator />

        <div className="p-0">
          {listLoading ? (
            <NotificationListSkeleton rows={6} />
          ) : visibleNotifications.length === 0 ? (
            <NotificationEmptyState filter={filter} userRole={user?.role} />
          ) : (
            <>
              <div>
                {visibleNotifications.map((notification, index) => (
                  <div key={notification.id}>
                    <NotificationItem
                      notification={notification}
                      onClick={handleItemClick}
                      isMarkingRead={Boolean(
                        markReadLoadingIds[notification.id],
                      )}
                      className="px-4 py-5 sm:px-5"
                    />

                    {index < visibleNotifications.length - 1 && (
                      <Separator className="ml-18" />
                    )}
                  </div>
                ))}
              </div>

              {hasMore && (
                <>
                  <Separator />

                  <div className="flex justify-center p-5">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => dispatch(fetchMoreNotifications())}
                      disabled={loadingMore}
                      className="min-w-32"
                    >
                      {loadingMore && (
                        <Loader2 className="size-4 animate-spin" />
                      )}

                      {loadingMore ? "Loading..." : "Load more"}
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
