import store from "@/store/store";

import {
  fetchNotifications,
  fetchNotificationCount,
} from "@/store/features/notification/notificationSlice";

export const startNotificationListener = () => {
  window.addEventListener("notification_received", () => {
    store.dispatch(fetchNotifications());

    store.dispatch(fetchNotificationCount());
  });
};
