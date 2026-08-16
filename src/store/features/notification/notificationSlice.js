import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import api from "@/store/constant/api";
import { getApiErrorMessage } from "@/store/constant/getApiErrorMessage";

const NOTIFICATION_API = "/notifications/";

const initialState = {
  notifications: [],
  selectedNotification: null,

  unreadCount: 0,
  totalCount: 0,

  next: null,
  previous: null,

  currentFilter: null,

  hasFetchedList: false,
  hasFetchedCount: false,

  listLoading: false,
  countLoading: false,
  detailLoading: false,
  loadingMore: false,

  markReadLoadingIds: {},
  markAllReadLoading: false,

  error: null,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const getNotificationState = (state) => state.notification;

const getFilterParams = (options) => {
  const isRead = options?.is_read;

  if (typeof isRead !== "boolean") {
    return undefined;
  }

  return {
    is_read: isRead,
  };
};

const mergeNotifications = (current, incoming) => {
  const notificationsMap = new Map();

  [...current, ...incoming].forEach((notification) => {
    if (!notification?.id) {
      return;
    }

    notificationsMap.set(notification.id, notification);
  });

  return Array.from(notificationsMap.values());
};

// ── Fetch notification list ───────────────────────────────────────────────────

export const fetchNotifications = createAsyncThunk(
  "notification/fetchNotifications",
  async (options = {}, { rejectWithValue }) => {
    try {
      const response = await api.get(NOTIFICATION_API, {
        params: getFilterParams(options),
      });

      return {
        results: Array.isArray(response.data?.results)
          ? response.data.results
          : [],
        next: response.data?.next ?? null,
        previous: response.data?.previous ?? null,
        filter: typeof options?.is_read === "boolean" ? options.is_read : null,
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Unable to load notifications."),
      );
    }
  },
  {
    condition: (_, { getState }) => {
      const notificationState = getNotificationState(getState());

      if (!notificationState) {
        return true;
      }

      return !notificationState.listLoading;
    },
  },
);

// ── Fetch next cursor page ────────────────────────────────────────────────────

export const fetchMoreNotifications = createAsyncThunk(
  "notification/fetchMoreNotifications",
  async (_, { getState, rejectWithValue }) => {
    const notificationState = getNotificationState(getState());
    const nextUrl = notificationState?.next;

    if (!nextUrl) {
      return {
        results: [],
        next: null,
        previous: notificationState?.previous ?? null,
      };
    }

    try {
      // Use the complete cursor URL returned by DRF.
      // Never manually construct the cursor.
      const response = await api.get(nextUrl);

      return {
        results: Array.isArray(response.data?.results)
          ? response.data.results
          : [],
        next: response.data?.next ?? null,
        previous: response.data?.previous ?? null,
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Unable to load more notifications."),
      );
    }
  },
  {
    condition: (_, { getState }) => {
      const notificationState = getNotificationState(getState());

      if (!notificationState) {
        return false;
      }

      if (!notificationState.next) {
        return false;
      }

      if (notificationState.loadingMore) {
        return false;
      }

      if (notificationState.listLoading) {
        return false;
      }

      return true;
    },
  },
);

// ── Fetch notification count ──────────────────────────────────────────────────

export const fetchNotificationCount = createAsyncThunk(
  "notification/fetchNotificationCount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`${NOTIFICATION_API}count/`);

      return {
        totalCount: Number(response.data?.total_count ?? 0),
        unreadCount: Number(response.data?.unread_count ?? 0),
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Unable to load notification count."),
      );
    }
  },
  {
    condition: (_, { getState }) => {
      const notificationState = getNotificationState(getState());

      if (!notificationState) {
        return true;
      }

      return !notificationState.countLoading;
    },
  },
);

// ── Fetch single notification ─────────────────────────────────────────────────

export const fetchNotificationDetails = createAsyncThunk(
  "notification/fetchNotificationDetails",
  async (notificationId, { rejectWithValue }) => {
    if (!notificationId) {
      return rejectWithValue("Notification ID is required.");
    }

    try {
      const response = await api.get(`${NOTIFICATION_API}${notificationId}/`);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Unable to load notification."),
      );
    }
  },
);

// ── Mark one notification read ────────────────────────────────────────────────

export const markNotificationRead = createAsyncThunk(
  "notification/markNotificationRead",
  async (notificationId, { getState, rejectWithValue }) => {
    if (!notificationId) {
      return rejectWithValue("Notification ID is required.");
    }

    const notificationState = getNotificationState(getState());

    const loadedNotification = notificationState?.notifications?.find(
      (notification) => notification.id === notificationId,
    );

    const selectedNotification =
      notificationState?.selectedNotification?.id === notificationId
        ? notificationState.selectedNotification
        : null;

    const wasUnread =
      loadedNotification?.is_read === false ||
      selectedNotification?.is_read === false;

    try {
      const response = await api.post(
        `${NOTIFICATION_API}${notificationId}/mark-read/`,
      );

      return {
        notification: response.data,
        wasUnread,
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Unable to mark notification as read."),
      );
    }
  },
  {
    condition: (notificationId, { getState }) => {
      if (!notificationId) {
        return false;
      }

      const notificationState = getNotificationState(getState());

      if (!notificationState) {
        return true;
      }

      return !notificationState.markReadLoadingIds?.[notificationId];
    },
  },
);

// ── Mark all notifications read ───────────────────────────────────────────────

export const markAllNotificationsRead = createAsyncThunk(
  "notification/markAllNotificationsRead",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post(`${NOTIFICATION_API}mark-all-read/`);

      return {
        updatedCount: Number(response.data?.updated_count ?? 0),
        unreadCount: Number(response.data?.unread_count ?? 0),
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Unable to mark all notifications as read."),
      );
    }
  },
  {
    condition: (_, { getState }) => {
      const notificationState = getNotificationState(getState());

      if (!notificationState) {
        return true;
      }

      return !notificationState.markAllReadLoading;
    },
  },
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const notificationSlice = createSlice({
  name: "notification",

  initialState,

  reducers: {
    clearNotificationError: (state) => {
      state.error = null;
    },

    clearSelectedNotification: (state) => {
      state.selectedNotification = null;
    },

    clearNotifications: () => initialState,

    setNotificationUnreadCount: (state, action) => {
      const unreadCount = Number(action.payload);

      state.unreadCount = Number.isFinite(unreadCount)
        ? Math.max(0, unreadCount)
        : 0;
    },
  },

  extraReducers: (builder) => {
    builder

      // ── Fetch notifications ────────────────────────────────────────────────

      .addCase(fetchNotifications.pending, (state) => {
        state.listLoading = true;
        state.error = null;
      })

      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.listLoading = false;

        state.notifications = action.payload.results;
        state.next = action.payload.next;
        state.previous = action.payload.previous;
        state.currentFilter = action.payload.filter;

        state.hasFetchedList = true;
      })

      .addCase(fetchNotifications.rejected, (state, action) => {
        state.listLoading = false;

        if (!action.meta.condition) {
          state.error = action.payload || "Unable to load notifications.";
        }
      })

      // ── Fetch more ────────────────────────────────────────────────────────

      .addCase(fetchMoreNotifications.pending, (state) => {
        state.loadingMore = true;
        state.error = null;
      })

      .addCase(fetchMoreNotifications.fulfilled, (state, action) => {
        state.loadingMore = false;

        state.notifications = mergeNotifications(
          state.notifications,
          action.payload.results,
        );

        state.next = action.payload.next;
        state.previous = action.payload.previous;
      })

      .addCase(fetchMoreNotifications.rejected, (state, action) => {
        state.loadingMore = false;

        if (!action.meta.condition) {
          state.error = action.payload || "Unable to load more notifications.";
        }
      })

      // ── Count ─────────────────────────────────────────────────────────────

      .addCase(fetchNotificationCount.pending, (state) => {
        state.countLoading = true;
      })

      .addCase(fetchNotificationCount.fulfilled, (state, action) => {
        state.countLoading = false;

        state.totalCount = action.payload.totalCount;
        state.unreadCount = action.payload.unreadCount;

        state.hasFetchedCount = true;
      })

      .addCase(fetchNotificationCount.rejected, (state, action) => {
        state.countLoading = false;

        if (!action.meta.condition) {
          state.error = action.payload || "Unable to load notification count.";
        }
      })

      // ── Notification details ──────────────────────────────────────────────

      .addCase(fetchNotificationDetails.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })

      .addCase(fetchNotificationDetails.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedNotification = action.payload;

        const notificationIndex = state.notifications.findIndex(
          (notification) => notification.id === action.payload?.id,
        );

        if (notificationIndex !== -1) {
          state.notifications[notificationIndex] = {
            ...state.notifications[notificationIndex],
            ...action.payload,
          };
        }
      })

      .addCase(fetchNotificationDetails.rejected, (state, action) => {
        state.detailLoading = false;

        state.error = action.payload || "Unable to load notification.";
      })

      // ── Mark one read ─────────────────────────────────────────────────────

      .addCase(markNotificationRead.pending, (state, action) => {
        const notificationId = action.meta.arg;

        state.markReadLoadingIds[notificationId] = true;
      })

      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const notificationId = action.meta.arg;
        const updatedNotification = action.payload.notification;

        delete state.markReadLoadingIds[notificationId];

        const notificationIndex = state.notifications.findIndex(
          (notification) => notification.id === notificationId,
        );

        if (notificationIndex !== -1) {
          state.notifications[notificationIndex] = {
            ...state.notifications[notificationIndex],
            ...updatedNotification,
          };
        }

        if (state.selectedNotification?.id === notificationId) {
          state.selectedNotification = {
            ...state.selectedNotification,
            ...updatedNotification,
          };
        }

        if (action.payload.wasUnread) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })

      .addCase(markNotificationRead.rejected, (state, action) => {
        const notificationId = action.meta.arg;

        delete state.markReadLoadingIds[notificationId];

        if (!action.meta.condition) {
          state.error =
            action.payload || "Unable to mark notification as read.";
        }
      })

      // ── Mark all read ─────────────────────────────────────────────────────

      .addCase(markAllNotificationsRead.pending, (state) => {
        state.markAllReadLoading = true;
        state.error = null;
      })

      .addCase(markAllNotificationsRead.fulfilled, (state, action) => {
        state.markAllReadLoading = false;

        const readAt = new Date().toISOString();

        state.notifications.forEach((notification) => {
          if (!notification.is_read) {
            notification.is_read = true;
            notification.read_at = notification.read_at || readAt;
          }
        });

        if (state.selectedNotification && !state.selectedNotification.is_read) {
          state.selectedNotification.is_read = true;
          state.selectedNotification.read_at =
            state.selectedNotification.read_at || readAt;
        }

        state.unreadCount = action.payload.unreadCount;
      })

      .addCase(markAllNotificationsRead.rejected, (state, action) => {
        state.markAllReadLoading = false;

        if (!action.meta.condition) {
          state.error =
            action.payload || "Unable to mark all notifications as read.";
        }
      });
  },
});

export const {
  clearNotificationError,
  clearSelectedNotification,
  clearNotifications,
  setNotificationUnreadCount,
} = notificationSlice.actions;

export default notificationSlice.reducer;
