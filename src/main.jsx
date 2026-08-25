import { createRoot } from "react-dom/client";

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
    </AuthInitializer>
  </Provider>,
);
