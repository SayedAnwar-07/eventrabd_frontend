import store from "@/store/store";

import {
  fetchNotifications,
  fetchNotificationCount,
} from "@/store/features/notification/notificationSlice";

import { fetchInvoices } from "@/store/features/invoice/invoiceSlice";

let listenerStarted = false;

export const startNotificationListener = () => {
  if (listenerStarted) {
    return;
  }

  listenerStarted = true;

  window.addEventListener("notification_received", (event) => {
    const notification = event.detail;

    store.dispatch(fetchNotifications());

    store.dispatch(fetchNotificationCount());

    if (notification?.notification_type === "invoice_updated") {
      store.dispatch(fetchInvoices());
    }
  });
};
