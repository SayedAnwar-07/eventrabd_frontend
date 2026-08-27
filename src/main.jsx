import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";

import "./index.css";

import MainRoutes from "./routes";

import { Provider } from "react-redux";

import { store } from "./store/store";

import { startNotificationListener } from "./websocket/notificationListener";
import AuthInitializer from "./features/auth/AuthInitializer";

// Start realtime notification listener
startNotificationListener();

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <AuthInitializer>
      <MainRoutes />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "6px",
            padding: "12px 16px",
            fontSize: "14px",
          },
        }}
      />
    </AuthInitializer>
  </Provider>,
);
