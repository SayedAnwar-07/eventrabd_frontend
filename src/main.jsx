import { createRoot } from "react-dom/client";

import "./index.css";

import MainRoutes from "./routes";

import { Provider } from "react-redux";

import { store } from "./store/store";

import { startNotificationListener } from "./websocket/notificationListener";

import { connectWebSocket } from "./websocket/websocketClient";

startNotificationListener();
const accessToken = localStorage.getItem("accessToken");

if (accessToken) {
  connectWebSocket(accessToken);
}

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <MainRoutes />
  </Provider>,
);
